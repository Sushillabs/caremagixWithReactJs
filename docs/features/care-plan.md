# Care Plan — Flow & API Reference

## Files involved

**Frontend**
- `src/features/patients/CarePlan.jsx` — header + button, lives inline at `/app/patients/:id/care-plan`
- `src/features/patients/CarePlanDetailPage.jsx` — the full accordion document, `/app/patients/:id/care-plan/view`
- `src/hooks/useCarePlan.js` — starts a generation job
- `src/hooks/useCarePlanStatus.js` — reads status/result for one patient
- `src/hooks/useJobsTracker.js` — the always-alive poller, mounted once in `AppShell.jsx`
- `src/hooks/useProgress.js` — generic multi-job poller (pre-existing, shared with eFax/OCR)
- `src/redux/jobsIdslice.js` — `carePlanJobs` array (jobs currently tracked)
- `src/redux/finalJobsStatusSlice.js` — `finalJobs` array (jobs that finished)
- `src/utils/buildPatientPayload.js` — `getPatientKey(patient_name, patient_type)`, the stable identity used everywhere here
- `src/api/hospitalApi.js` — `generateCarePlan`, `getCarePlan`, `updateCarePlan`, `getProgress`

**Backend** (`caremagix-be`)
- `careplan.py` — `/generate_care_plan`, `/care_plan/<id>` (GET/PUT), `/export_care_plan_pdf` (not wired to UI yet)
- `ocr_upload_api.py` — `/ocr-progress/<job_id>` (shared poll endpoint for eFax/OCR/Care Plan jobs)
- `models.py` — `CarePlan` table (`id`, `patient_name`, `patient_type`, `user_id`, `facility_id`, `data`, `created_at`, `updated_at`)

## API reference

### API 1 — Start / short-circuit generation
`POST /generate_care_plan`

Request body:
```json
{
  "patient_name": "string",
  "patient_type": "string",
  "days": 30,
  "doc_title": "string",
  "regenerate": true
}
```

Two possible responses, depending on `regenerate` and whether a saved plan already exists:

- **A job was started** (the normal case — `regenerate: true`, or nothing saved yet):
```json
{ "message": "Care plan generation started.", "job_id": "string", "patient_name": "string" }
```
- **Already exists, returned immediately, no job** (`regenerate: false` AND a saved plan is found):
```json
{ "message": "Care plan already exists.", "care_plan_id": "string", "care_plan_data": { "...": "see shape below" } }
```

### API 2 — Poll job status
`GET /ocr-progress/:job_id`

Shared endpoint — also used by eFax/OCR jobs, hence the generic field names.

Response:
```json
{
  "progress": 0,
  "message": "string",
  "status": "INPROGRESS | COMPLETED | FAILED",
  "job_id": "string",
  "patient_name": "string",
  "care_plan_id": "string | null",
  "care_plan_data": { "...": "present only once status is COMPLETED" },
  "file_name": "", "file_path": "", "html_content": "", "fax_id": "", "type": "care-plan-job"
}
```

### API 3 — Fetch a saved plan by ID
`GET /care_plan/:care_plan_id`

Response:
```json
{
  "care_plan_id": "string",
  "patient_name": "string",
  "patient_type": "string",
  "care_plan_data": { "...": "see shape below" },
  "updated_at": "ISO datetime"
}
```
Used as a **fallback only** — when the frontend already has `care_plan_data` in shared state (the normal case, right after generation), this call is skipped entirely.

### API 4 — Save edits (backend ready, not wired to the UI yet)
`PUT /care_plan/:care_plan_id`

Request: `{ "care_plan_data": { "...": "the whole edited document" } }`
Response: `{ "message": "Care plan updated.", "care_plan_id": "string", "care_plan_data": {...} }`

### `care_plan_data` shape (recap)
```json
{
  "patient": { "name": "", "primary_care_provider": "", "diagnosis": "", "plan_start_date": "", "plan_end_date": "", "date_acknowledged_by_patient": "", "next_follow_up_date": "" },
  "sections": [
    {
      "title": "",
      "problem": "",
      "smart_goals": [{ "text": "", "target_date": "", "status": "not_started|in_progress|complete", "selected": false }],
      "interventions": [ "...same shape as smart_goals" ],
      "patient_self_management_actions": [ "...same shape" ],
      "red_flag_symptoms": ["string"],
      "potential_barriers": [ "...same shape as smart_goals" ],
      "evidence_based_references": ["string"],
      "assessment_of_progress": { "header_data": "", "table_data": { "date": "", "goal_intervention": "", "status": "", "note": "" } },
      "follow_up_communication": { "method": "", "next_contact_date": "" }
    }
  ]
}
```

---

## Flow 1 — Brand new Care Plan (nothing exists yet)

1. User is on `CarePlan.jsx` (status = `idle`), clicks the button.
2. `handleClick` calls `useCarePlan().generate({ patient_name, patient_type, doc_title, regenerate: false })` and **awaits** it before navigating.
3. **API 1** fires. Nothing existed yet, so the backend enqueues a job → responds with `{job_id, ...}`.
4. `generate()` dispatches into redux: `jobsIdSlice.carePlanJobs` gets `{ job_id, patientKey, patient_name, patient_type }`.
5. `navigate("view")` — by now the job is already registered, so `CarePlanDetailPage` opens directly into the `running` state (no idle flash).
6. Meanwhile, `useJobsTracker` (mounted in `AppShell`, running regardless of page) has been polling **API 2** every few seconds via `useProgress`. `CarePlanDetailPage`'s own `useCarePlanStatus` call taps the *same* cached query (same `queryKey`), so it doesn't poll a second time — it just reads the live `progress`/`message`.
7. Progress checklist UI updates as `progress` climbs (10 → 50 → 75 → 90 → 100).
8. Poll response shows `status: "COMPLETED"`. `useJobsTracker` records it: pushes a lightweight `{jobId, status, message, carePlanId}` to `localStorage`, and dispatches the *full* record (including `carePlanData`) to `finalJobsStatusSlice`.
9. `useCarePlanStatus` now finds this in `finalJobs` → returns `{ status: "done", carePlanId, carePlanData }`.
10. `CarePlanDetailPage` renders the accordion directly from `carePlanData` — no extra fetch (API 3 not called).

## Flow 2 — A Care Plan already exists in the backend

Same entry point (click the button, `status: idle` on the frontend — e.g., a fresh browser session that never generated one *this* session, but the patient already has a saved plan from before).

1. `generate({ ..., regenerate: false })` → **API 1**.
2. Backend's `existing_plan` lookup (`CarePlan.query.filter_by(patient_name=..., patient_type=..., user_id=...)`) finds a row → returns the **immediate-result** shape: `{message, care_plan_id, care_plan_data}`, no `job_id`, nothing to poll.
3. `useCarePlan.generate()` detects `response.care_plan_data` is present → dispatches straight to `finalJobsStatusSlice` (skips `jobsIdSlice` entirely — there was never a running job) with `jobId: "immediate-<care_plan_id>"`.
4. `navigate("view")` → `CarePlanDetailPage` sees `status: "done"` immediately, renders the accordion — no progress checklist ever shown, no poll ever happened.

## Flow 3 — Generate for Patient B while Patient A's plan is still running; does A's data survive?

1. Patient A: click "Create Care Plan" → Flow 1 steps 1–4 happen, job registered under A's `patientKey`.
2. Navigate to Patients list, open Patient B, click "Create Care Plan" too → a **second, independent** entry gets pushed into `jobsIdSlice.carePlanJobs`, keyed by B's `patientKey`.
3. `useJobsTracker`'s `useProgress` call feeds *both* job IDs into `useQueries` — react-query polls each one independently, in parallel. Neither job's polling depends on which patient's page is currently open.
4. Whichever finishes first gets finalized into `finalJobsStatusSlice` first; the other keeps polling until it's done too.
5. Navigating back to Patient A at any point: `useCarePlanStatus(getPatientKey(A))` filters `carePlanJobs`/`finalJobs` by A's key specifically — B's entries are simply ignored, A's are still there, untouched. Nothing about tracking B ever removes or overwrites A's record.

## Flow 4 — Come back to a patient whose Care Plan is still pending

1. Left Patient A while their job was still `running`, did other things.
2. Reopen Patient A (same session, no browser refresh — redux state is still alive).
3. `CarePlan.jsx` calls `useCarePlanStatus(patientKey)` → finds A's entry still in `carePlanJobs` with no matching `finalJobs` record yet → returns `{ status: "running", progress, message }`.
4. Button shows `"Generating... 62%"` (whatever the last poll reported) instead of resetting to `"Create Care Plan"`. Clicking it does **not** call `generate()` again (only fires when `status === "idle"`) — it just navigates to the detail page to watch.
5. `CarePlanDetailPage` shows the same live progress checklist, continuing from wherever the background poll currently is — it was never actually interrupted, since `useJobsTracker` kept polling the whole time regardless of which page was open.

**Known gap, not yet handled:** all of the above assumes the browser tab was never fully reloaded — `jobsIdSlice`/`finalJobsStatusSlice` live in redux (in-memory only) and reset on a hard refresh. `localStorage`'s `completed_jobs` currently only backs up *finished* jobs, not ones still in flight — so a refresh mid-generation would lose track of that specific job (the backend keeps working; the frontend just wouldn't know to resume polling it). Extending the localStorage backup to cover in-flight jobs too, with rehydration into redux on app load, was discussed as a follow-up and is not yet built.

**Also not yet wired:** an explicit "Regenerate" action (force a fresh plan even though one exists) — right now `CarePlan.jsx`'s main button always passes `regenerate: false` (reuse-first), while `CarePlanDetailPage.jsx`'s fallback "Generate Care Plan" button (only shown in edge cases — direct link, or after a failure) still passes `regenerate: true`. Worth deciding if that's the intended split or if it should be unified.
