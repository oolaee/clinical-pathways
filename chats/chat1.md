# Olympia Pathways desktop app

_Started 2026-07-04 22:55 UTC_

---

## User

Claude Design Prompt: Olympia Pathways (Clinical Decision Support Desktop App)

Design a high-fidelity interactive prototype of a desktop clinical decision support application called Clinical Pathways, built for Olympia Aesthetics & Wellness, a medical practice in Palm Harbor, FL. This is an internal, provider-facing tool. It is never patient-facing. The final product will be a fully local desktop app (Tauri, encrypted SQLite, local Ollama model), so the design should feel like installed clinical software, not a SaaS web app. No cloud language anywhere in the UI.

What the app does

Providers enter or upload patient information, vitals, and lab results. A deterministic rules engine evaluates the data against clinical pathways and produces suggested next steps: medication recommendations with dosing and route, lab ordering sets, lifestyle planning, follow-up intervals, and a talking points checklist the provider works through when starting a patient on a new medication. A local AI model assists with two things only: extracting values from uploaded lab PDFs and drafting plain-language visit summaries. All clinical logic is rules-based and every recommendation requires provider review before it is finalized. The UI must make that distinction visible.

Users and roles

Three roles with role-based permissions, enforced at login:


Provider (physician, PA, NP): full access. Sees evaluations, recommendations, dosing. Only role that can approve and finalize a plan.
Clinical staff (MA): can create patients, run intake questionnaires, enter vitals, upload labs, and verify extracted lab values. Cannot view dosing recommendations or finalize plans. Their view of a completed evaluation shows status only ("Ready for provider review").
Admin: user management, audit log, backup settings. No clinical data entry.


Show a lock screen with practice branding, role badge visible in the app header at all times, and an auto-lock timeout indicator.

Clinical pathways

A patient can be on multiple pathways at once. Pathway selection happens during intake and can be changed later.


Metabolic / Weight Loss: the foundation pathway. Evaluates insulin resistance and metabolic syndrome.
GLP-1: always includes the Metabolic pathway automatically. Adds GLP-1 response tracking (weight trend, plateau detection, side effect burden, dose history) and plateau workup logic for patients failing or stalling on GLP-1 therapy.
TRT (men): low testosterone evaluation and treatment.
BHRT (women): perimenopause and menopause hormone evaluation and treatment.
Thyroid: full thyroid panel interpretation including subclinical patterns.
Gut Health / Functional: intestinal permeability, GI symptom burden, and integrative workup alongside conventional recommendations.


Core flows and screens to design

1. Patient list (home)

A dense, scannable board styled like an ED tracking board: one row per patient with name, age/sex, active pathways as small chips, last visit, lab status (pending upload, awaiting verification, verified), and evaluation status (not run, ready for review, finalized). Filter by pathway and status. Prominent "New Patient" action.

2. Intake

Multi-step form: demographics, medical history, current medications, allergies, weight and treatment goals, then pathway selection as large selectable cards. Selecting GLP-1 visibly auto-selects Metabolic with a note explaining why.

3. Symptom questionnaires (dynamic per pathway)

Each selected pathway adds its own questionnaire step. Design one full example per pathway:


TRT: ADAM questionnaire plus a 0 to 10 severity scale for libido, morning erections, energy, mood, muscle loss, brain fog.
BHRT: menopause rating scale style items covering hot flashes, night sweats, sleep, mood, vaginal dryness, libido, cycle changes.
Thyroid: fatigue, cold intolerance, constipation, hair thinning, weight change, dry skin.
Metabolic / GLP-1: appetite, cravings, energy crashes, weight history, prior GLP-1 agents and doses, side effects (nausea, constipation, reflux), plateau duration.
Gut: bloating, stool pattern, food reactions, antibiotic history, NSAID use.


Show computed symptom scores at the end of each questionnaire.

4. Vitals entry

Fast keyboard-first entry: height, weight (BMI auto-calculated), blood pressure, heart rate, waist circumference, body composition if available. Show trend sparklines next to each field when prior values exist.

5. Lab upload and verification

This is a critical safety screen. Design it carefully:


Drag-and-drop zone for lab PDFs (LabCorp, Quest).
Processing state: "Extracting values with local AI. Nothing leaves this device."
Verification screen: side-by-side layout with the PDF page on the left and extracted values on the right. Each value shows analyte name, result, units, reference range, and a confidence indicator. Low-confidence extractions are flagged and must be individually confirmed against the PDF. A value cannot enter the record until a human confirms it. Include a "confirm all high-confidence" action plus per-row confirmation for flagged rows.
Manual entry fallback for any analyte.
After verification: a labs view with values organized by panel, out-of-range flags, and historical trend charts per analyte.


6. Evaluation results

The centerpiece screen. After the rules engine runs, show:


Computed markers panel: HOMA-IR with the calculation shown (fasting glucose times fasting insulin divided by 405), triglyceride to HDL ratio, metabolic syndrome criteria count, free testosterone status against age norms, thyroid pattern interpretation.
Findings list: each finding states the data behind it, e.g. "Insulin resistance: HOMA-IR 3.4 (threshold 2.5), fasting insulin 14, fasting glucose 98."
Recommendations, grouped by pathway and tiered: conventional first-line options first (example: metformin 500 mg BID with titration schedule, dietary and exercise planning, sleep), then adjunct and integrative options clearly labeled as such. Hormone recommendations include agent, dose, route options (example: testosterone cypionate weekly IM or twice-weekly subcutaneous; estradiol patch or cream with micronized progesterone), and monitoring plan. Every recommendation card shows a short rationale and a "per Olympia protocol" source tag.
Suggested lab orders: pathway-specific ordering sets the provider can toggle on or off, based on what the patient is interested in pursuing.
A persistent banner: "Suggestions only. Provider review required." Finalize button is provider-role only and requires an attestation checkbox.


7. Talking points checklist

Generated when a plan includes starting a medication. A checklist the provider works through in the room: mechanism in plain language, expected timeline, common side effects, serious warnings, contraindications reviewed, monitoring schedule, consent confirmed. Each item has a checkbox and the completed checklist is saved to the visit. Design examples for starting metformin, starting testosterone cypionate, and starting a GLP-1.

8. Visit summary export

Print-ready summary: findings, plan, talking points covered, follow-up date. Clean and minimal for the chart.

9. Admin screens

User management with role assignment, audit log (who viewed or edited which patient and when), backup and encryption status panel.

Design direction

Use the Olympia Aesthetics & Wellness brand system: taupe #b6a28e as the primary accent, black #171810 for text and dark surfaces, white #fcfbfb backgrounds, cream #f0e5db for soft panels. Cormorant Garamond for page titles only, DM Sans for everything else including all data, tables, and forms. No teal.

The feel should be calm, clinical, and dense where density helps (patient board, labs) and spacious where judgment happens (evaluation results, talking points). Status colors: use restrained semantic colors for lab flags and alerts (red for critical, amber for out of range, neutral for normal) that sit comfortably against the taupe and cream palette. Rounded corners, generous type hierarchy, no gradients, no decorative illustration. This should read as trustworthy medical software a physician would show a colleague.

Sample data

Seed the prototype with three realistic fictional patients:


Male, 48, on semaglutide 12 weeks with a 6-week plateau, HOMA-IR 3.4, total testosterone 310 with symptoms. Pathways: GLP-1 (with Metabolic) and TRT. This patient should demonstrate the full evaluation and a multi-pathway recommendation set.
Female, 51, perimenopausal symptoms, normal metabolic labs. Pathway: BHRT.
Female, 39, TSH 5.8 with positive TPO antibodies, fatigue and hair thinning. Pathways: Thyroid and Gut Health.


Out of scope for this prototype

No real authentication, no real PDF parsing, and no real AI calls. Mock all processing states with realistic timing. The deliverable is the complete interactive UI with all screens above navigable, using the sample patients.

## User

Found issues — fixing…

## User

Found issues — fixing…

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: snip]_

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: get_webview_logs]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: run_script]_

_[tool: show_html]_

Runtime contains `</script>` in strings — escape it and re-inline:

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: snip]_

_[tool: ready_for_verification]_

Root cause found and fixed: the project's asset-serving layer was refusing to deliver any `.js` file, so the DC runtime never loaded. I inlined the runtime directly into `Clinical Pathways.dc.html` (with a couple of sequences neutralized so the DC parser doesn't trip on them). The app now hydrates — lock screen shows all three profiles and is fully interactive. Verifier is re-checking in the background.

One caveat: if I later rewrite the file wholesale via `dc_write`, the inlined runtime would be replaced with the external reference again — I'll re-inline if that happens.

## User

Found issues — fixing…

## Assistant

Root cause: fixed grid columns (508px + gaps) exceed content width at ~920px viewport, collapsing the `fr` name track to 0. One decisive fix: `minmax()` on the flexible columns + smaller fixed tracks on both tables.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Tightening further so minimum track widths actually fit the ~672px content area, plus shorter badge labels:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Fixed the narrow-width collapse: both tables now use `minmax()` tracks sized to fit the actual content area (patient names can't collapse to 0, and the Confirm buttons on the lab-verification table stay on-screen), with shortened badge/button labels to make the minimums honest. Verifier is re-checking.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: snip]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Applied the decisive fix: the verify screen's two-pane grid now guarantees the table pane ≥440px (PDF pane yields), and the table card uses `overflow-x:auto` so the Confirm controls can never be clip-hidden. Verifier re-checking.

## User

So I started a new patient but it pulled other patient demographics and labs. Also, the intake should have more check boxes instead of type in for easier analysis. I'd like the llm to be able to analyze the patients overall picture and tell about other under or undiagnosed conditions. For example if his initial blood pressure is 160/110 then he needs to start antihypertensives. 

I'd like it to find these things and make all the recommendations of meds, lifestyle changes, dosing based on JNC8 and other evidence based medicine. Also, when I went from intake to questionnaires it didn't have a next on the screen. Also some of these questionnaires might not be valid on the patient and should all start with the no. This one for the new patient had both yes and no checked. Possibly have an on and off for each questionnaire if they are valid or not for the pathway. 

Each section should have a next button.The quesionaiires have no way to move on except clicking the vitals.  Same thing on the vitals. Can we have a manual entry for labs as well. 

The testosterone should also show cream or enclomiphene and dosing. 

I also want it to have a heavy metabolic workup section, what it means, how to use the testing and explanations for the providers. Why we do it and which labs.

## Assistant

Good catches — that's a real set of gaps. Plan: isolate a true "New Patient" draft (blank questionnaires defaulting to No, blank vitals, no inherited labs), checkbox-based history/meds intake, per-questionnaire administered toggle + Next buttons on questionnaires and vitals, manual lab entry tab, a rules-based systemic screening layer (JNC 8 hypertension detection from entered vitals), testosterone cream + enclomiphene options, and a Metabolic Workup provider-reference screen.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now the questionnaire toggle + navigation, and vitals footer:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Manual lab entry tab, results empty state, generic PDF identity, and the Metabolic Workup screen:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Template done. Now the logic — state, draft patient, per-patient data, screening rules, workup data:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now add testosterone cream + enclomiphene options to Marcus's TRT recommendations and the talking points:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: ready_for_verification]_

All requested changes are in:

- **New Patient isolation** — "+ New Patient" now creates a true blank draft: questionnaires default to No/0, vitals start empty ("no prior values"), labs show "No labs on record," and the header shows "New Patient · Intake in progress." Sample-patient data no longer bleeds in.
- **Checkbox intake** — medical history, family history, medication classes, and allergies are now tap-to-check chips (structured for the rules engine), with one "other" line each.
- **Undiagnosed-condition screening** — the rules engine now watches vitals live: enter a BP like 160/110 and the Evaluation grows a "Systemic screening — beyond selected pathways" section with a JNC 8 finding and dosed recommendations (two-drug therapy ≥160/100, single agent above goal, age-adjusted thresholds). This works on the new patient *and* existing patients. Note: I kept this rules-based (JNC 8 / evidence tags) rather than LLM-driven — it fits the app's "deterministic logic, AI only for extraction/summaries" safety model.
- **Questionnaire validity toggles** — each questionnaire has an "Administered this visit" switch; for a new patient it auto-enables only the pathways chosen at intake. Off state shows a "skipped by rules engine" note.
- **Next buttons everywhere** — questionnaires chain (Next: BHRT → … → Continue to vitals), and vitals has "Continue to labs."
- **Manual lab entry** — new tab in Labs with analyte/result/units/range rows, add-row, and save-to-record (marked human-entered in Results).
- **TRT options** — cypionate (IM/SC), testosterone cream 100 mg/mL with transference counseling, and enclomiphene 12.5–25 mg as the fertility-sparing option — flagged as especially apt for Marcus's secondary (normal-LH) pattern.
- **Heavy Metabolic Workup** — new nav item: why we order it, 3-step how-to-use, 8 lab cards (what it tells you + how to act), and the engine's formulas (HOMA-IR, TG/HDL, MetSyn criteria).

Verifier is checking now. Want the hypertension screening extended to more rules (e.g., A1c ≥6.5 → diabetes workup, resting HR, BMI class triggers)?

