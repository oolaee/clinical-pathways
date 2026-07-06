//! Encrypted local persistence.
//!
//! The whole app dataset is stored as a single AES-256-GCM–encrypted document in
//! a local SQLite file under the app-data directory. The 256-bit key lives in a
//! `0600` key file in that same user-protected directory. Nothing is stored in
//! plaintext and nothing leaves the machine.
//!
//! v1 keeps it deliberately simple (one encrypted document) so data reliably
//! survives restarts. Two hardening upgrades are planned: move the key into the
//! macOS Keychain, and model per-patient rows for partial reads/writes.

use std::sync::Mutex;

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use rand::RngCore;
use rusqlite::Connection;
use tauri::{AppHandle, Manager, State};

struct Db {
    conn: Connection,
    cipher: Aes256Gcm,
}

/// Managed state — `None` when persistence could not be initialized (in which
/// case the app still runs, just in-memory).
#[derive(Default)]
pub struct DbState {
    inner: Mutex<Option<Db>>,
}

/// Open (or create) the encrypted store. Called once from the Tauri setup hook.
pub fn init(app: &AppHandle) {
    match open(app) {
        Ok(db) => {
            *app.state::<DbState>().inner.lock().unwrap() = Some(db);
            println!("[db] encrypted store ready");
        }
        Err(e) => eprintln!("[db] persistence disabled: {e}"),
    }
}

fn open(app: &AppHandle) -> Result<Db, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("no app-data dir: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let key = load_or_create_key(&dir)?;
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&key));

    let conn = Connection::open(dir.join("clinical-pathways.db")).map_err(|e| e.to_string())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY, doc BLOB)",
        [],
    )
    .map_err(|e| e.to_string())?;
    Ok(Db { conn, cipher })
}

/// Read the 256-bit key from `db.key`, or generate and persist a new one (0600).
fn load_or_create_key(dir: &std::path::Path) -> Result<[u8; 32], String> {
    let path = dir.join("db.key");
    if let Ok(bytes) = std::fs::read(&path) {
        if bytes.len() == 32 {
            let mut k = [0u8; 32];
            k.copy_from_slice(&bytes);
            return Ok(k);
        }
    }
    let mut k = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut k);
    std::fs::write(&path, k).map_err(|e| e.to_string())?;
    restrict_permissions(&path);
    Ok(k)
}

#[cfg(unix)]
fn restrict_permissions(path: &std::path::Path) {
    use std::os::unix::fs::PermissionsExt;
    let _ = std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o600));
}
#[cfg(not(unix))]
fn restrict_permissions(_path: &std::path::Path) {}

/// Load the saved document (decrypted JSON), or `None` if nothing is stored yet.
#[tauri::command]
pub fn db_load(state: State<DbState>) -> Result<Option<String>, String> {
    let guard = state.inner.lock().unwrap();
    let db = match guard.as_ref() {
        Some(db) => db,
        None => return Ok(None),
    };
    let blob: Option<Vec<u8>> = db
        .conn
        .query_row("SELECT doc FROM app_state WHERE id = 1", [], |r| r.get(0))
        .ok();
    let blob = match blob {
        Some(b) if b.len() > 12 => b,
        _ => return Ok(None),
    };
    let (nonce, ct) = blob.split_at(12);
    let plain = db
        .cipher
        .decrypt(Nonce::from_slice(nonce), ct)
        .map_err(|_| "could not decrypt local store".to_string())?;
    String::from_utf8(plain)
        .map(Some)
        .map_err(|e| e.to_string())
}

/// Encrypt and persist the document (the app's serialized state snapshot).
#[tauri::command]
pub fn db_save(state: State<DbState>, doc: String) -> Result<(), String> {
    let guard = state.inner.lock().unwrap();
    let db = match guard.as_ref() {
        Some(db) => db,
        None => return Ok(()), // persistence disabled — no-op
    };
    let mut nonce = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce);
    let ct = db
        .cipher
        .encrypt(Nonce::from_slice(&nonce), doc.as_bytes())
        .map_err(|e| e.to_string())?;
    let mut blob = nonce.to_vec();
    blob.extend_from_slice(&ct);
    db.conn
        .execute(
            "INSERT OR REPLACE INTO app_state (id, doc) VALUES (1, ?1)",
            [&blob],
        )
        .map_err(|e| e.to_string())?;
    Ok(())
}
