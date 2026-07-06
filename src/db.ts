/**
 * Frontend client for the encrypted local store (desktop only).
 *
 * In the packaged app these call Rust commands that read/write an AES-256-GCM
 * encrypted SQLite document (see `src-tauri/src/db.rs`). In a plain browser
 * they are inert, so the web build keeps its in-memory behavior.
 */
import { invoke } from '@tauri-apps/api/core'
import { IS_DESKTOP } from './ai'

export async function dbLoad(): Promise<string | null> {
  if (!IS_DESKTOP) return null
  try {
    return await invoke<string | null>('db_load')
  } catch (e) {
    console.error('db_load failed:', e)
    return null
  }
}

export async function dbSave(doc: string): Promise<void> {
  if (!IS_DESKTOP) return
  try {
    await invoke('db_save', { doc })
  } catch (e) {
    console.error('db_save failed:', e)
  }
}
