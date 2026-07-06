/**
 * Frontend client for the bundled on-device LLM.
 *
 * In the packaged desktop app these call Rust commands that talk to the local
 * llama.cpp server (see `src-tauri/src/ai.rs`). In a plain browser (dev/design)
 * `IS_DESKTOP` is false and callers fall back to the deterministic mock — so the
 * web build behaves exactly as before and never depends on a model.
 */
import { invoke } from '@tauri-apps/api/core'
import type { VerifyRow } from './data'

/** True when running inside the Tauri desktop shell (v2 injects this global). */
export const IS_DESKTOP =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export type LlmStatus = { available: boolean; ready: boolean; model: string }

export function llmStatus(): Promise<LlmStatus> {
  return invoke<LlmStatus>('llm_status')
}

/** Raw shape returned by the Rust `extract_labs` command. */
type ExtractedLab = { analyte: string; result: string; units: string; reference_range: string }

/**
 * Extract analytes from lab-report text using the on-device model, mapped into
 * the same VerifyRow shape the verification screen already renders. Every value
 * still requires human confirmation before entering the record.
 */
export async function extractLabs(pdfText: string): Promise<VerifyRow[]> {
  const rows = await invoke<ExtractedLab[]>('extract_labs', { pdfText })
  return rows.map((r) => ({
    a: r.analyte,
    v: r.result,
    u: r.units,
    r: r.reference_range,
    flag: '',
    // Model extractions are shown as low-confidence so each is verified by hand.
    conf: 'low' as const,
  }))
}

export type SummaryInput = {
  patient: string
  findings: string[]
  plan: string[]
  labsOrdered: string[]
  followUp: string
}

/** Draft a plain-language visit summary on-device. Provider reviews before saving. */
export function draftSummary(input: SummaryInput): Promise<string> {
  return invoke<string>('draft_summary', {
    input: {
      patient: input.patient,
      findings: input.findings,
      plan: input.plan,
      labs_ordered: input.labsOrdered,
      follow_up: input.followUp,
    },
  })
}
