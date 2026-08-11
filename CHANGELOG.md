# Changelog

All notable changes to this project are documented here, feature-wise.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Until the project starts cutting real releases (see `package.json` version),
entries live under `[Unreleased]`.

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
  plan (`GET /care_plan/:id`), save edits (`PUT /care_plan/:id`, not wired
  to the UI yet).
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
  patient looked like a *different* patient and lost track of their plan.
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
- PDF export for Care Plan not built yet (Phase 6, still pending).
- No per-field editing yet (the green Edit/Save controls from the Figma
  design) — the document is read-only for now.

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
- Patient Details: dropdown items, action buttons, and question chips are not
  wired to anything yet (UI only).
- Header card's Age/Admission Date have no backing data — rendered blank.
