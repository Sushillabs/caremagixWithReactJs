npm install react-icons

It’s a React package that gives you access to multiple popular icon sets — including:
Font Awesome
Material Design Icons
Bootstrap Icons
Feather
Simple Icons ✅ ← (for brands like LinkedIn, GitHub, etc.)

================================================================================
1-Discharge header button
2-left side buttons
3-delete 
4-logout
5-Responsive
->Mic and spekar
------------------------------------
6-Physician page
7-Patient page

================================================================================
NEW FIGMA APP SHELL (/app) - built so far
Same codebase, old /care-giver app untouched and left running in parallel.
Reuses existing api/hooks/redux wherever possible instead of new plumbing.

Shell (Phase 1)
- AppShell / Sidebar / TopBar / DockedAssistant (src/features/shell/)
- Dashboard (facility stat cards, placeholder counts) (src/features/dashboard/)
- Docked AI Care Assistant, wired to existing useAskQuestion hook
- config/sections.js + config/roles.js drive routing/nav per role
- ComingSoon placeholder for every section not yet built
TopBar known issues (flagged, not yet fixed): facility name/beds field names
are guessed, notification bell has no logic, logout handler is broken.

Patients List (/app/patients) - all done
1-Route scaffolded + added to IMPLEMENTED_SECTIONS
2-Real data via getPatients + useMyQuery, merges uploaded docs with
  pcc_data/epic_data/metriport_data sources (generalized, one source list)
3-Table per Figma: SL No / Patient name / Data Origin / View Details
4-TopBar search filters the table live (useOutletContext)
5-View Details dispatches selected patient (addDischargePatientDate) +
  fetchPatientChat, then navigates to /app/patients/:id

Patient Details (/app/patients/:id) - layout + chat data done, features pending
1-Static layout skeleton: header card (name, Active badge, age/admission
  date placeholders, caregiver name), feature toolbar (Documents/Notes/
  Plan/Forms/Upload dropdowns + MMTA/Register a Call/Medication Alerts/
  Call Reports/Medication buttons), Patient Journey/Create Care Plan,
  document viewer card shell - done
2-fetchPatientChat wired: spinner while loading, error message on failure,
  summary table (chatData[0], markdown) + default question chips
  (chatData[1..-2]) rendered, MMTA question (last item) excluded - done
3-Wire Documents/Notes/Plan/Forms/Upload dropdown items - pending
4-Wire MMTA / Register a Call / Medication Alerts / Call Reports /
  Medication / Patient Journey / Create Care Plan buttons - pending
5-Make default question chips clickable (real /ask call) - pending
6-Conversation / Chat History / Delete / Download actions on the
  document card - pending