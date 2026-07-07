/**
 * Auto-update (desktop only).
 *
 * On launch the installed app checks the update endpoint configured in
 * `tauri.conf.json`. If a newer signed release is available it downloads and
 * installs it, then relaunches into the new version. Signature verification uses
 * the updater public key in the config, so only releases signed with the matching
 * private key are ever installed. In a browser this is a no-op.
 */
import { IS_DESKTOP } from './ai'

export async function checkForUpdates(onStatus?: (msg: string) => void): Promise<void> {
  if (!IS_DESKTOP) return
  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (!update) return
    onStatus?.(`Installing update ${update.version}…`)
    await update.downloadAndInstall()
    const { relaunch } = await import('@tauri-apps/plugin-process')
    await relaunch()
  } catch (e) {
    // Never block launch on an update failure — the app runs the current version.
    console.error('update check failed:', e)
  }
}
