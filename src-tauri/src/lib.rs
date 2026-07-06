//! Tauri desktop shell for Clinical Pathways.
//!
//! Hosts the web frontend in a native window and provides on-device AI via a
//! bundled llama.cpp sidecar (see `ai`). The clinical rules engine stays in the
//! frontend and remains fully deterministic; the model only assists with lab
//! extraction and drafting visit summaries — and every output requires provider
//! review. Persistent encrypted storage (SQLCipher) is the next backend layer.

mod ai;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ai::LlmState::default())
        .invoke_handler(tauri::generate_handler![
            ai::llm_status,
            ai::extract_labs,
            ai::draft_summary
        ])
        .setup(|app| {
            ai::start(app.handle());
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                ai::stop(window.app_handle());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Clinical Pathways");
}
