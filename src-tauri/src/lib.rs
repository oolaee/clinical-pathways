//! Tauri desktop shell for Clinical Pathways.
//!
//! For now this simply hosts the existing web frontend in a native window —
//! no backend commands yet. The product roadmap (encrypted SQLite via SQLCipher,
//! a local Ollama model for lab extraction and visit summaries) will be added
//! here as Tauri commands and wired to the frontend via `@tauri-apps/api`.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Clinical Pathways");
}
