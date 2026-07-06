import { useEffect, useRef, useState } from 'react'
import { CONFIG, INITIAL_BUNDLES, INITIAL_USERS, type Bundle, type User, type VerifyRow } from './data'
import type { RoleKey } from './helpers'
import { IS_DESKTOP } from './ai'
import { dbLoad, dbSave } from './db'

/** Everything in the prototype's `Component.state`, typed. */
export type AppState = {
  locked: boolean
  role: RoleKey | null
  userName: string
  screen: string
  pid: number
  pathFilter: string
  statusFilter: string
  intakeStep: number
  intakePaths: string[]
  ikChecks: Record<string, boolean>
  qTab: string
  answers: Record<string, number>
  qEnabled: Record<string, boolean>
  vits: Record<number, Record<string, string | number>>
  labView: string
  procPct: number
  procMsg: string
  /** Analytes extracted by the on-device model; null → use the seeded sample set. */
  aiLabs: VerifyRow[] | null
  /** On-device extraction is running. */
  aiBusy: boolean
  conf: Record<number, boolean>
  manual: { a: string; v: string; u: string; r: string }[]
  manualSaved: Record<number, boolean>
  bundleOn: Record<string, boolean>
  labOff: Record<string, boolean>
  manualLabs: Record<string, string[]>
  manualLabDraft: string
  attested: Record<string, boolean>
  finalized: Record<string, boolean>
  tpTab: number
  tpChecked: Record<string, boolean>
  tpSaved: Record<number, boolean>
  aTab: string
  backupDone: boolean
  activeVisit: Record<number, string>
  visitsByPatient: Record<number, { id: string; type: string; date: string; status: string }[]>
  newUser: { name: string; user: string; role: RoleKey }
  users: User[]
  bundles: Bundle[]
  lockSecs: number
}

export const initialState: AppState = {
  locked: true,
  role: null,
  userName: '',
  screen: 'patients',
  pid: 1,
  pathFilter: 'All',
  statusFilter: 'All',
  intakeStep: 1,
  intakePaths: [],
  ikChecks: {},
  qTab: 'TRT',
  answers: {},
  qEnabled: {},
  vits: { 1: { ht: 70, wt: 221, sys: 134, dia: 86, hr: 72, waist: 42, bf: 31.2 } },
  labView: 'upload',
  procPct: 0,
  procMsg: 'Reading page 1 of 2…',
  aiLabs: null,
  aiBusy: false,
  conf: {},
  manual: [
    { a: '', v: '', u: '', r: '' },
    { a: '', v: '', u: '', r: '' },
    { a: '', v: '', u: '', r: '' },
    { a: '', v: '', u: '', r: '' },
  ],
  manualSaved: {},
  bundleOn: {},
  labOff: {},
  manualLabs: {},
  manualLabDraft: '',
  attested: {},
  finalized: {},
  tpTab: 0,
  tpChecked: {},
  tpSaved: {},
  aTab: 'users',
  backupDone: false,
  activeVisit: {},
  visitsByPatient: {},
  newUser: { name: '', user: '', role: 'ma' },
  users: INITIAL_USERS,
  bundles: INITIAL_BUNDLES,
  lockSecs: 900,
}

/** A partial state patch, or a function of the previous state returning one. */
export type Patch = Partial<AppState> | ((prev: AppState) => Partial<AppState>)

export type Timers = { p: ReturnType<typeof setInterval> | null }

export type Store = {
  state: AppState
  setState: (patch: Patch) => void
  /** Latest state, readable synchronously inside event handlers/intervals. */
  stateRef: React.MutableRefObject<AppState>
  timers: Timers
}

export function lockMax(): number {
  return (CONFIG.autoLockMinutes ?? 15) * 60
}

/**
 * Durable state that persists to the encrypted store between launches. Transient
 * session/UI fields (lock, role, current screen, timers, in-flight AI) are
 * intentionally excluded so the app always reopens locked and at a clean start.
 */
const PERSIST_KEYS: (keyof AppState)[] = [
  'pid', 'intakePaths', 'ikChecks', 'answers', 'qEnabled', 'vits',
  'manual', 'manualSaved', 'bundleOn', 'labOff', 'manualLabs',
  'attested', 'finalized', 'tpChecked', 'tpSaved', 'backupDone',
  'activeVisit', 'visitsByPatient', 'users', 'bundles',
]

/** Store hook: mirrors React class `setState` (shallow merge) + the auto-lock timer. */
export function useStore(): Store {
  const [state, setRaw] = useState<AppState>(initialState)
  const stateRef = useRef(state)
  stateRef.current = state
  const timers = useRef<Timers>({ p: null }).current

  const setState = (patch: Patch) => {
    setRaw((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : patch
      return { ...prev, ...next }
    })
  }

  // Auto-lock countdown — ticks once per second while unlocked.
  useEffect(() => {
    const t = setInterval(() => {
      setRaw((prev) => {
        if (prev.locked) return prev
        const s = prev.lockSecs - 1
        return s <= 0 ? { ...prev, locked: true, lockSecs: lockMax() } : { ...prev, lockSecs: s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Hydrate durable state from the encrypted store on launch (desktop only).
  const loaded = useRef(false)
  useEffect(() => {
    if (!IS_DESKTOP) return
    dbLoad().then((doc) => {
      if (doc) {
        try {
          const saved = JSON.parse(doc) as Partial<AppState>
          setRaw((prev) => {
            const next = { ...prev }
            for (const k of PERSIST_KEYS) {
              if (k in saved) (next as Record<string, unknown>)[k] = (saved as Record<string, unknown>)[k]
            }
            return next
          })
        } catch (e) {
          console.error('could not parse saved state:', e)
        }
      }
      loaded.current = true
    })
  }, [])

  // Persist durable state on change (debounced), once the initial load is done.
  useEffect(() => {
    if (!IS_DESKTOP || !loaded.current) return
    const id = setTimeout(() => {
      const subset: Record<string, unknown> = {}
      for (const k of PERSIST_KEYS) subset[k] = state[k]
      void dbSave(JSON.stringify(subset))
    }, 600)
    return () => clearTimeout(id)
  }, [state])

  return { state, setState, stateRef, timers }
}
