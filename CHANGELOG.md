# Changelog

All notable changes to this project are documented here, feature-wise.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Until the project starts cutting real releases (see `package.json` version),
entries live under `[Unreleased]`.

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
