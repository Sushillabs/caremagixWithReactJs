# Changelog

All notable changes to this project are documented here, feature-wise.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Until the project starts cutting real releases (see `package.json` version),
entries live under `[Unreleased]`.

#### Fixed — Routing and logo broke under the new `/new/` base path

`vite.config.js` now sets `base: "/new/"` and `.env`'s `VITE_API_URL` points
at a remote backend instead of localhost — both changed outside this
session, but broke two things once in place:

- `App.jsx`: `BrowserRouter` had no matching `basename`, so a real
  deployment under `/new/` would push wrong URLs and 404 on hard refresh.
  Added `basename="/new/"` (the chrome-extension build's `MemoryRouter` is
  unaffected — no real URL bar to match against).
- `Sidebar.jsx`: the logo `<img>` used a filesystem-style relative path
  (`../../public/images/logo.png`), which browsers resolve as a URL, not a
  file path — always 404'd. Now `${import.meta.env.BASE_URL}images/logo.png`,
  which resolves correctly under the base in both dev and prod.

#### Added — Add New Patient (`PatientsList.jsx`)

New "Add Patient" button opens `AddPatientModal.jsx`, a 3-step flow:

1. Enter mobile and/or email → `POST /send-otp` per identifier filled in.
2. Enter the OTP(s) — 6 digits per identifier (backend generates 6-digit
   codes; the Figma mockup showed 4, which would truncate the code and
   always fail, so built to match the backend). If both mobile and email
   were entered, both must verify; if only one was entered, that one is
   sufficient.
3. Patient name + Upload PDF/Upload Scan PDF (reuses the same upload logic
   as the existing-patient flow — see below). On success, invalidates the
   `patientList` query so the new patient shows up, and for Scan PDF,
   dispatches into the same `jobsId` tracking the Jobs page already reads.

Refactored to make step 3 possible without duplicating `UploadPlanModal.jsx`:
extracted `uploadPlanShared.js` (`MODE_CONFIG` + `buildUploadFormData`, the
verified `/upload`/`/ocr-upload` field contracts) and `UploadFields.jsx`
(the plan/file/checkbox UI) into shared pieces used by both
`UploadPlanModal` and `AddPatientModal`'s step 3.

#### Added — Jobs page (background job tracker)

New: `src/features/jobs/JobsPage.jsx`, at `/app/jobs` (new "Jobs" entry in
the sidebar). Table of background jobs from this session — Scan PDF (OCR),
eFax, Care Plan generation — with Type, Patient, File, Status, Progress %,
Message. Reads the existing `jobsId`/`finalJobStatus` redux state via the
existing `useProgress.js` polling hook; no new polling logic added.

#### Added — Patient Details: Upload PDF / Upload Scan PDF

`src/features/patients/UploadPlanModal.jsx` now takes a `mode` prop
(`"pdf"` | `"scan"`) instead of being one fixed form. Upload dropdown items
renamed to `["Upload PDF", "Upload Scan PDF"]` and wired to it.

- `mode="pdf"` → `POST /upload`, synchronous. Fields verified against
  `file_upload_api.py`: `file`, `file_type`, `patient_name`, `patient_type`
  (the selected plan), `confirm`, `note_doc`.
- `mode="scan"` → `POST /ocr-upload`, an RQ background job. Fields verified
  against `ocr_upload_api.py`: `image`, `image_type`, `note_doc` +
  `keep_document`. On success, dispatches `setJobsId({ ocrJobs: response })`
  so it's tracked by the Jobs page above.

#### Added — Patient Details: Unregister Call (phase 2) + toggle button

New: `src/features/patients/UnregisterCallModal.jsx`. Same centered-modal
shell as `RegisterCallModal`, but simpler — a confirm step instead of a
form.

**Toolbar button is now one toggle, not two.** In `PatientDetails.jsx`, the
Register/Unregister button:

- Only renders when `patient?.type === "Uploaded"` — call registration only
  applies to that patient type (PCC/Epic/Metriport records never carry
  `call_registered`/`calling_number`, so there's nothing to toggle for them).
- Reads `patient?.raw?.call_registered` to decide label + action: `false` →
  "Register a Call" (opens `RegisterCallModal`), `true` → "Unregister Call"
  (opens `UnregisterCallModal`).

**Flow:** "Unregister this call? The scheduled call will be cancelled." with
Cancel/Unregister buttons, then `POST /pause_call` (`unregisterCall`) with
`{ to_number: patient.raw.calling_number }` — no lookup call needed, the
number is already on the patient record from registration. Same no-toast
pattern as Register: Unregister button dims + reads "Unregistering..." while
pending, inline red error on failure (modal stays open to retry), checkmark

- "Call unregistered" panel on success, auto-closes after ~1.2s.

**Redux fix that made the toggle actually work end-to-end:**
`PatientSingleDateSlice.js`'s `updatePatientData` reducer used to hardcode a
single field (`state.value.patient.raw.call_registered = ...`); it's now
`Object.assign(state.value.patient.raw, action.payload)`, so a dispatch can
update multiple raw-patient fields at once. `RegisterCallModal`'s success
handler was also missing a write entirely — it flipped `call_registered`
but never recorded the number that had just been used, so unregistering
immediately after a patient's _first-ever_ registration (before the patient
list next refetched from the backend) would find `calling_number` undefined
and the Unregister button would stay disabled. Now register success
dispatches `updatePatientData({ call_registered: true, calling_number: phone })`,
so both flags are correct without waiting on a refetch.

Note: `registered_number` (used by `UploadPatientDocument.jsx` to prefill
the upload form's contact field) is a different, unrelated field — the
patient's contact number for upload/OTP notifications, not the call-register
number. Not touched by this change.

#### Added — Patient Details: "Register a Call" modal

New: `src/features/patients/RegisterCallModal.jsx`, wired from the
"Register a Call" toolbar button in `PatientDetails.jsx`. Centered modal
(`fixed inset-0`, same overlay pattern as `ReviewModal.jsx`) rather than an
anchored popover.

**Flow**

1. Opening the modal silently calls `POST /get-details` (`getCallDetail`)
   with `{ patient_name, patient_type, dates }` — `patient_name`/`patient_type`
   come from the already-selected patient in redux
   (`patientsingledata.value`); `dates` is `singleData.dates` for `Uploaded`
   patients or `singleData.patient_collection` otherwise (same branch
   `PatientDetails`'s own `handleDocumentClick` already uses). The response's
   `phone_number` prefills the Mobile Number field.
2. Mobile Number uses `react-phone-number-input` (`defaultCountry="US"`,
   `international`) — country-code picker + number, same library the legacy
   call-register form used. Editable even after autofill, e.g. if the lookup
   fails or the number is wrong.
3. Schedule Time is a native `datetime-local` input, defaulted to now + 90
   minutes ("Schedule it for 1 hour 30 minutes from now" hint), which already
   emits the `"YYYY-MM-DDTHH:mm"` shape the backend expects for `time_slots`
   — no reformatting needed.
4. "Schedule" calls `POST /register-call` (`registerCall`) with
   `{ patient_name, patient_type, dates, to_number, time_slots }`.

**Pending/error/success — no toast.** Both calls use `useMutation` directly
(not the app's usual `useMyMutation`, which auto-fires `react-hot-toast`) so
feedback stays inside the modal:

- Phone lookup: field disabled + "Looking up phone number..." while
  pending; inline red text if it fails (user can still type the number by
  hand).
- Schedule button: dims/disables and reads "Scheduling..." while pending;
  inline red error text below on failure.
- Success: the form is replaced with a checkmark + "Call scheduled" panel,
  then the modal auto-closes after ~1.2s.

Unregistering a call was deliberately left out of this pass (see
"Unregister Call (phase 2)" entry above for that). Patient Name/Type aren't
shown as fields (unlike the legacy form) — they're derived from the
selected patient and sent silently.

#### Fixed — Patient Details: Documents dropdown now switches the active document

`src/features/patients/PatientDetails.jsx`.

The Documents dropdown's list items were dead — the `<li>` used a typo'd
`onkey={item}` prop (not a real React/DOM event) instead of `onClick`, so
clicking a document silently did nothing. Now:

1. `DOCUMENT_ITEMS` is built from the actual patient record instead of a
   hardcoded placeholder list: each upload's `dates` for `Uploaded` patients,
   or `patient?.details` for PCC/Epic/Metriport patients.
2. Clicking an item clears the current conversation (`clearChat`), rebuilds
   the patient payload with that document selected (`dates`/`patient_date`
   for `Uploaded`, `patient_collection` otherwise), and re-fetches the
   default question set for it via `fetchPatientChat` (`/generate_questions`)
   — the same pattern `PatientsList`'s "View Details" already uses.
3. If the user was on the Care Plan tab, picking a document navigates back
   to the Conversation tab (`navigate(".")`) so the refreshed chat is visible.

`DropdownButton` gained an `onItemClick` prop (only wired up for Documents
so far — Notes/Plan/Forms/Upload are still inert, see Known issues below).

#### Added — Care Plan, Phase 2 (editable document + PDF export)

Builds on the Care Plan feature below — that phase made the plan
_generate and display_; this phase makes it _editable and exportable_.
Full write-up: [`docs/features/care-plan.md`](./docs/features/care-plan.md)
(flows/API) and
[`docs/features/care-plan-backend-spec.md`](./docs/features/care-plan-backend-spec.md)
(a self-contained backend spec, written so a different backend team — or an
AI coding agent — could rebuild this feature from scratch without access to
this codebase).

**What it does now:** the document is no longer read-only. Each section has
its own Edit/Cancel/Save (checkboxes, status, target dates, the problem
statement, item wording, red-flag/reference lists, and the Assessment of
Progress row all become editable). The patient info block (Primary Care
Provider, Diagnosis, the four dates) has its own separate Edit/Cancel/Save.
None of that touches the server by itself — it's staged locally. One
page-level "Save Care Plan" button batches every pending edit into a single
save. A "Generate PDF" button renders whatever is currently saved into a
downloadable PDF — if there are unsaved edits when it's clicked, it saves
them first automatically, so the PDF can never be stale.

**Backend (`caremagix-be`)**

- `careplan.py`:
  - AI prompt schema: every goal/intervention/action/barrier item now
    includes a `selected` field (the AI always sets it `false` — it proposes
    the menu, the Care Manager is the one who ticks what applies).
  - `assessment_of_progress` changed from an always-empty array to a
    `{header_data, table_data}` object — one real, editable progress-log row
    per section instead of a dead placeholder that was never actually
    rendered with data.
  - New: `_render_care_plan_html()` / `generate_care_plan_pdf()` — renders
    the JSON-shaped care plan straight into a styled, print-ready HTML/PDF
    document. Reused the print stylesheet (`CARE_PLAN_CSS`) that was already
    sitting in this file from an earlier phase of the project, before the AI
    generated raw HTML directly — added a "checked" checkbox style to it
    since it previously only drew empty boxes.
  - `POST /export_care_plan_pdf` — repurposed: it already existed but the
    frontend never called it, and it expected the _caller_ to hand it
    pre-built HTML. Now takes `{care_plan_id}` and renders entirely
    server-side from the saved database row, so there's one source of truth
    for what an exported plan looks like.

**Frontend — existing files changed**

- `src/features/patients/CarePlanDetailPage.jsx` — the bulk of this phase:
  per-section and per-patient-block edit sessions, the page-level
  "Save Care Plan" button (`PUT /care_plan/:id`, one call for everything),
  and the "Generate PDF" button (auto-save-then-export).
- `src/api/hospitalApi.js` — added `exportCarePlanPdf()`.

**Design decisions worth knowing**

- Edits are staged locally (per section, per patient block) and only reach
  the server on the one page-level Save — avoids an API call per
  keystroke/checkbox and avoids ever saving a half-finished edit.
- Nothing is ever removed from an AI-generated item list when unticked —
  `selected` just toggles. Every AI-proposed option stays visible (and shows
  up in the PDF either way, checked or not) so the full menu of options the
  AI considered is never lost.
- The Assessment of Progress table is intentionally a single editable row
  per section (an ongoing log entry updated at each patient contact), not a
  growing/appendable list — a deliberate scope decision, not an oversight.
- After a successful page-level save, the result is dispatched into the same
  Redux slice (`finalJobsStatusSlice`) that tracks a freshly _generated_
  plan — caught during design, before it shipped, that keeping the saved
  data only in local component state would show stale (pre-edit) data if the
  Care Manager navigated away and back to the same patient in one session.

**Known issues / not done yet**

- Still no explicit "Regenerate" action (unchanged from Phase 1, below).
- A hard refresh mid-generation still loses in-progress job tracking
  (unchanged from Phase 1, below).
- No history of previously generated PDFs — "Generate PDF" always renders
  the current saved state; nothing is kept of earlier exports.

#### Added — Care Plan feature (generate, view, and track across the app)

Full write-up with API payloads and step-by-step flows:
[`docs/features/care-plan.md`](./docs/features/care-plan.md). Short version below.

**What it does now:** click "Create Care Plan" on a patient → AI generates a
structured care plan in the background → live progress shown while it runs →
finished plan displayed as an expandable document. Switching to a different
patient (or navigating anywhere else in the app) does not lose track of it —
it keeps generating and finishes in the background regardless of what page
is open, and the button correctly shows "Generating..." if you come back to
that patient before it's done.

**Backend (`caremagix-be`)**

- `models.py` — new `CarePlan` database table (one row per generated plan:
  patient, owner, the plan itself as JSON text, timestamps).
- `careplan.py` — the AI prompt now asks for structured JSON (a fixed set of
  fields) instead of free-form HTML, so the frontend can reliably build a
  form/document out of it instead of guessing at HTML structure. Added a
  safety check (`_is_valid_care_plan_shape`) that rejects a malformed AI
  response instead of saving/forwarding bad data. Three routes: start
  generation (`POST /generate_care_plan`, reuses an existing saved plan
  when `regenerate: false` instead of re-running the AI), fetch a saved
  plan (`GET /care_plan/:id`), save edits (`PUT /care_plan/:id` — wired to
  the UI in Phase 2, see above).
- `ocr_upload_api.py` — the existing job-status endpoint
  (`GET /ocr-progress/:job_id`, shared with eFax/OCR uploads) now also
  returns `care_plan_id`/`care_plan_data` once a care-plan job finishes.

**Frontend — new files**

- `src/features/patients/CarePlan.jsx` — the "Care Plan" header/button,
  shown inline on the Patient Details page (`/app/patients/:id/care-plan`).
- `src/features/patients/CarePlanDetailPage.jsx` — the full document view,
  its own page (`/app/patients/:id/care-plan/view`), no header/toolbar
  chrome (it's a dense document, given the full screen on purpose).
- `src/features/patients/ConversationCard.jsx` — the existing chat/summary
  card, pulled out of `PatientDetails.jsx` into its own file so it could
  become a normal routed page instead of one hardcoded piece.
- `src/hooks/useCarePlan.js` — starts a generation job.
- `src/hooks/useCarePlanStatus.js` — for one given patient, answers "is a
  plan generating, already done, failed, or not started."
- `src/hooks/useJobsTracker.js` — the part that actually keeps checking job
  status in the background, mounted once in `AppShell` so it runs no
  matter which page is open (not tied to the Care Plan page being visible).
- `src/utils/buildPatientPayload.js` — added `getPatientKey()`, a stable
  way to identify "this patient" for tracking purposes.
- `docs/features/care-plan.md` — the detailed reference doc mentioned above.

**Frontend — existing files changed**

- `src/App.jsx` — Patient Details is now a proper layout (header/toolbar
  stay on screen, only the content below changes) with nested routes
  instead of one big page swapping content via local state.
- `src/features/patients/PatientDetails.jsx` — trimmed down to just the
  header/toolbar; the actual content is now `<Outlet />` (routed).
- `src/redux/jobsIdslice.js` — added a `carePlanJobs` list, alongside the
  existing `eFaxJobs`/`ocrJobs` (same idea, reused instead of rebuilt).
- `src/hooks/useProgress.js` — the shared job-polling hook (already used by
  eFax/OCR) now polls faster and keeps polling even if the browser tab
  loses focus, since Care Plan jobs have someone actively watching them
  (unlike background uploads).
- `src/features/shell/AppShell.jsx` / `DockedAssistant.jsx` /
  `src/config/sections.js` — the docked "Ask anything..." bar now hides
  itself on Care Plan pages specifically (`noAssistantPaths`), since that
  feature isn't a chat.
- `src/components/ChatLoader.jsx` — small "Thinking" label added next to
  the animated dots.

**Bugs found and fixed while building this**

- Care plan tracking was originally keyed off each patient row's `id` —
  turned out that ID is randomly regenerated every time the Patients list
  re-fetches, so navigating back to the list and re-opening the same
  patient looked like a _different_ patient and lost track of their plan.
  Fixed by keying on patient name + type instead (stable, and it's what
  the backend already uses to identify a patient).
- The finished plan's content was being fetched twice — once already
  delivered by the job-status check, then discarded and re-fetched again
  by ID. Fixed to reuse the copy already in hand; the re-fetch now only
  happens as a fallback for cases where that copy genuinely isn't available.
- "Create Care Plan" required two clicks (one to open the page, a second
  to actually start it). Now one click does both.

**Known issues / not done yet**

- A hard browser refresh while a plan is generating loses track of that
  one in-progress job (finished ones already survive a refresh via
  `localStorage`; in-progress ones don't yet).
- No explicit "Regenerate" action yet (force a fresh plan when one already
  exists) — only "generate if none exists, else show the existing one."
- Editing and PDF export were both added in Phase 2 — see the entry above.

#### Added — Chat, Phase 1 (default questions become real answers)

Patient Details page (`src/features/patients/PatientDetails.jsx`), Conversation tab.
Step by step, what happens now:

1. When a patient is opened, the Conversation tab shows a welcome line and a
   list of default questions (from the `/generate_questions` response).
2. User clicks one of the default questions.
3. The app sends that question to the `/ask` API, using the same patient
   info that was already saved when the patient was picked from the list
   (no need to pick the patient again).
4. While the answer is loading, the question list gets disabled so the user
   can't click another question at the same time, and a "Thinking..." line
   shows up.
5. The page automatically scrolls down on its own to follow the new message
   as it comes in.
6. Once the answer arrives, it's added below: the question appears on the
   right like a small chat bubble, and the answer appears on the left as
   properly formatted text (tables/lists render correctly, not as raw text).
7. Each answer has two small buttons under it: "Doc Reference" (not working
   yet, for a later phase) and "Quick Questions", which smoothly scrolls the
   page back up to the default question list, so the user doesn't have to
   scroll up by hand in a long conversation.
8. The "Ask anything..." box docked at the bottom of the page shares the
   same conversation, so typing a custom question there adds to the same
   chat thread as clicking a default question does.

Also: `useAskQuestion`/`fetchPatientChat` now get a consistent, legacy-shaped
patient payload from one shared helper (`src/utils/buildPatientPayload.js`),
built once when the patient is selected, instead of being rebuilt (and
duplicated) at every place that calls the backend.

### Added

- **New Figma app shell** (`/app`, `src/features/shell/`, `src/config/`): `AppShell`,
  `Sidebar`, `TopBar`, `DockedAssistant`, role/section registry
  (`config/roles.js`, `config/sections.js`), `ComingSoon` placeholder for
  unbuilt sections. Old app kept running unchanged at `/care-giver`.
- **Dashboard** (`/app/dashboard`, `src/features/dashboard/`): facility stat
  cards (placeholder counts).
- **Docked AI Care Assistant** (`src/features/assistant/`): reuses the
  existing `useAskQuestion` hook; visible only on patient-context sections.
- **Patients List** (`/app/patients`, `src/features/patients/PatientsList.jsx`):
  table (SL No / Patient name / Data Origin / View Details), fed by
  `getPatients` + `useMyQuery`, merged with `pcc_data`/`epic_data`/`metriport_data`
  sources; live search via the TopBar; "View Details" selects the patient
  (`addDischargePatientDate`), kicks off `fetchPatientChat`, and navigates to
  `/app/patients/:id`.
- **Patient Details** (`/app/patients/:id`, `src/features/patients/PatientDetails.jsx`):
  static layout skeleton per Figma (header card, Documents/Notes/Plan/Forms/
  Upload dropdowns, MMTA/Register a Call/Medication Alerts/Call Reports/
  Medication buttons, Patient Journey/Create Care Plan, document viewer card);
  `fetchPatientChat` wired with loading spinner and error state; renders the
  markdown summary table and default question chips from the response
  (MMTA question excluded).

### Known issues

- TopBar: facility name/beds-available field names are guessed, notification
  bell has no logic yet, logout handler is broken (missing `dispatch`/`navigate`).
- Patient Details: Documents dropdown and "Register a Call" are wired (see
  entries above); Notes/Plan/Forms/Upload dropdowns, the remaining action
  buttons (MMTA, Medication Alerts, Call Reports, Medication, Patient
  Journey), and question chips are still not wired to anything (UI only).
- Header card's Age/Admission Date have no backing data — rendered blank.
