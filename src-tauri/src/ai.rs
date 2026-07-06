//! On-device LLM integration.
//!
//! The app bundles `llama-server` (llama.cpp) as a Tauri sidecar and a quantized
//! GGUF model as a resource. On startup we locate the model, launch the server
//! bound to localhost, and wait for it to become healthy. The two provider-
//! facing AI tasks — extracting values from a lab report and drafting a
//! plain-language visit summary — are exposed as Tauri commands that call the
//! local server's OpenAI-compatible API. Nothing ever leaves the machine.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

/// Fixed loopback port for the local inference server. Chosen to avoid a
/// clash with a user's own Ollama install (11434).
const LLM_PORT: u16 = 11534;

/// Shared runtime state for the local model server.
pub struct LlmState {
    /// A model file was found and the server was launched.
    pub available: AtomicBool,
    /// The server has finished loading and answered `/health`.
    pub ready: AtomicBool,
    /// Display name of the loaded model file (for the UI).
    pub model: Mutex<String>,
    /// The child process, kept so we can terminate it on shutdown.
    pub child: Mutex<Option<CommandChild>>,
}

impl Default for LlmState {
    fn default() -> Self {
        Self {
            available: AtomicBool::new(false),
            ready: AtomicBool::new(false),
            model: Mutex::new(String::new()),
            child: Mutex::new(None),
        }
    }
}

#[derive(Serialize)]
pub struct LlmStatus {
    /// Whether a bundled model was found and the server started.
    available: bool,
    /// Whether the server has finished loading and is ready to answer.
    ready: bool,
    /// The loaded model file name, or empty when none is bundled.
    model: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct LabValue {
    pub analyte: String,
    pub result: String,
    #[serde(default)]
    pub units: String,
    #[serde(default)]
    pub reference_range: String,
}

/// Locate the first `*.gguf` under the bundled resources and start the server.
/// Called once from the Tauri `setup` hook. Missing model is not fatal — the
/// app still runs, and the frontend falls back to its deterministic mock.
pub fn start(app: &AppHandle) {
    let state = app.state::<LlmState>();

    let model_path = match find_model(app) {
        Some(p) => p,
        None => {
            eprintln!("[llm] no bundled .gguf model found — on-device AI disabled");
            return;
        }
    };
    let model_name = model_path
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();

    let sidecar = match app.shell().sidecar("llama-server") {
        Ok(cmd) => cmd,
        Err(e) => {
            eprintln!("[llm] sidecar not found: {e}");
            return;
        }
    };

    let (_rx, child) = match sidecar
        .args([
            "-m",
            &model_path.to_string_lossy(),
            "--host",
            "127.0.0.1",
            "--port",
            &LLM_PORT.to_string(),
            "-c",
            "4096",
            // Offload all layers to the GPU (Metal on macOS); ignored if unsupported.
            "-ngl",
            "999",
            "--parallel",
            "1",
        ])
        .spawn()
    {
        Ok(pair) => pair,
        Err(e) => {
            eprintln!("[llm] failed to launch llama-server: {e}");
            return;
        }
    };

    *state.model.lock().unwrap() = model_name.clone();
    *state.child.lock().unwrap() = Some(child);
    state.available.store(true, Ordering::SeqCst);
    println!("[llm] launched llama-server on 127.0.0.1:{LLM_PORT} with {model_name}");

    // Poll for readiness in the background so startup never blocks the UI.
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let client = reqwest::Client::new();
        for _ in 0..600 {
            tokio::time::sleep(Duration::from_millis(500)).await;
            if let Ok(resp) = client
                .get(format!("http://127.0.0.1:{LLM_PORT}/health"))
                .send()
                .await
            {
                if resp.status().is_success() {
                    app.state::<LlmState>().ready.store(true, Ordering::SeqCst);
                    println!("[llm] model ready");
                    return;
                }
            }
        }
        eprintln!("[llm] model did not become ready within timeout");
    });
}

/// Terminate the sidecar when the app exits.
pub fn stop(app: &AppHandle) {
    if let Some(child) = app.state::<LlmState>().child.lock().unwrap().take() {
        let _ = child.kill();
    }
}

fn find_model(app: &AppHandle) -> Option<std::path::PathBuf> {
    let dir = app
        .path()
        .resource_dir()
        .ok()?
        .join("resources")
        .join("models");
    let entries = std::fs::read_dir(dir).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("gguf") {
            return Some(path);
        }
    }
    None
}

#[tauri::command]
pub fn llm_status(state: State<LlmState>) -> LlmStatus {
    LlmStatus {
        available: state.available.load(Ordering::SeqCst),
        ready: state.ready.load(Ordering::SeqCst),
        model: state.model.lock().unwrap().clone(),
    }
}

/// Call the local server's chat endpoint. `json` requests a JSON object response.
async fn chat(system: &str, user: &str, json: bool, max_tokens: u32) -> Result<String, String> {
    let mut body = serde_json::json!({
        "messages": [
            { "role": "system", "content": system },
            { "role": "user", "content": user }
        ],
        "temperature": 0.1,
        "max_tokens": max_tokens,
        "stream": false
    });
    if json {
        body["response_format"] = serde_json::json!({ "type": "json_object" });
    }

    let client = reqwest::Client::new();
    let resp = client
        .post(format!("http://127.0.0.1:{LLM_PORT}/v1/chat/completions"))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("local model request failed: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("local model returned {}", resp.status()));
    }
    let v: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("could not parse model response: {e}"))?;
    v["choices"][0]["message"]["content"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "empty model response".to_string())
}

/// Extract analytes from raw lab-report text. Every value still requires human
/// verification in the UI before it enters the record.
#[tauri::command]
pub async fn extract_labs(state: State<'_, LlmState>, pdf_text: String) -> Result<Vec<LabValue>, String> {
    if !state.ready.load(Ordering::SeqCst) {
        return Err("The on-device model is not ready yet.".into());
    }
    let system = "You are a clinical lab-extraction assistant running entirely on-device. \
Extract every analyte present in the lab report text into strict JSON. Copy values verbatim; \
never invent, infer, or normalize a value that is not written in the text. \
Respond ONLY with a JSON object of the form {\"labs\":[{\"analyte\":\"\",\"result\":\"\",\"units\":\"\",\"reference_range\":\"\"}]}.";
    let content = chat(system, &pdf_text, true, 1536).await?;
    let parsed: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("model returned invalid JSON: {e}"))?;
    let labs = parsed
        .get("labs")
        .cloned()
        .unwrap_or(serde_json::Value::Array(vec![]));
    serde_json::from_value(labs).map_err(|e| format!("could not read extracted labs: {e}"))
}

#[derive(Deserialize)]
pub struct SummaryInput {
    pub patient: String,
    pub findings: Vec<String>,
    pub plan: Vec<String>,
    pub labs_ordered: Vec<String>,
    pub follow_up: String,
}

/// Draft a concise, plain-language visit summary from the structured plan.
/// The provider reviews and edits before it is saved to the chart.
#[tauri::command]
pub async fn draft_summary(state: State<'_, LlmState>, input: SummaryInput) -> Result<String, String> {
    if !state.ready.load(Ordering::SeqCst) {
        return Err("The on-device model is not ready yet.".into());
    }
    let system = "You draft concise, plain-language clinical visit summaries for the patient chart. \
Use only the structured input provided; do not add diagnoses, doses, or claims that are not present. \
Write 4–7 short sentences in a calm, professional clinical voice. No headers, no markdown.";
    let user = format!(
        "Patient: {}\nFindings:\n- {}\nPlan:\n- {}\nLabs ordered: {}\nFollow-up: {}",
        input.patient,
        input.findings.join("\n- "),
        input.plan.join("\n- "),
        input.labs_ordered.join(", "),
        input.follow_up
    );
    chat(system, &user, false, 512).await
}
