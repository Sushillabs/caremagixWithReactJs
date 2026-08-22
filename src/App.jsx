import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import CareGiver from "./pages/CareGiver";
import CareGiverLayout from "./layouts.jsx/CareGiverLayout";
import AuthLayout from "./layouts.jsx/AuthLayout";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "react-hot-toast";
import PrivacyPolicy from "./components/PrivacyPolicy";
import AppShell from "./features/shell/AppShell";
import Dashboard from "./features/dashboard/Dashboard";
import PatientsList from "./features/patients/PatientsList";
import PatientDetails from "./features/patients/PatientDetails";
import ConversationCard from "./features/patients/ConversationCard";
import CarePlan from "./features/patients/CarePlan";
import VisitNotes from "./features/patients/VisitNotes";
import VisitNotesAI from "./features/patients/VisitNotesAI";
import CarePlanDetailPage from "./features/patients/CarePlanDetailPage";
import MmtaPage from "./features/patients/MmtaPage";
import ComingSoon from "./features/common/ComingSoon";
import JobsPage from "./features/jobs/JobsPage";
import CallReportsPage from "./features/reports/CallReportsPage";
import TransitionCareServicesPage from "./features/services/TransitionCareServicesPage";
import { SECTIONS } from "./config/sections";

const isExtension = window.location.protocol === "chrome-extension:";
console.log("protocol:", window.location.protocol);
console.log("isExtension:", isExtension);

const Router = isExtension ? MemoryRouter : BrowserRouter;
// vite.config.js builds this app under base: "/new/" — BrowserRouter needs a
// matching basename or routing breaks (wrong URLs, hard refresh 404s) once
// deployed there. MemoryRouter (chrome-extension build) has no real URL bar,
// so it keeps using initialEntries instead.
const routerProps = isExtension ? { initialEntries: ["/"] } : { basename: "/new/" };

function App() {
  const roles = ["caregiver", "physician", "patient"];

  return (
    <div
      style={
        isExtension
          ? {
              width: "400px",
              height: "100vh",
              overflowY: "auto",
              overflowX: "hidden",
              background: "white",
              position: "relative",
            }
          : {}
      }
    >
      <Toaster position="top-right" containerStyle={{ top: 60 }} />
      <Router {...routerProps}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Route>

          <Route
            element={
              <RequireAuth roles={roles}>
                <CareGiverLayout />
              </RequireAuth>
            }
          >
            <Route path="/care-giver" element={<CareGiver />} />
          </Route>

          {/* New Figma app shell (Phase 1). Old routes above stay as fallback. */}
          <Route
            element={
              <RequireAuth roles={roles}>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/patients/:id" element={<PatientDetails />}>
              <Route index element={<ConversationCard />} />
              <Route path="care-plan" element={<CarePlan />} />
              <Route path="visit-notes" element={<VisitNotes />} />
              <Route path="visit-notes-ai" element={<VisitNotesAI />} />
            </Route>
            <Route path="/app/patients/:id/care-plan/view" element={<CarePlanDetailPage />} />

            <Route path="/app/patients/:id/mmta" element={<MmtaPage />} />
            {Object.values(SECTIONS)
              .filter((section) => !section.children && section.path)
              .map((section) => (
                <Route
                  key={section.key}
                  path={section.path}
                  element={
                    section.key === "dashboard" ? (
                      <Dashboard />
                    ) : section.key === "patients" ? (
                      <PatientsList />
                    ) : section.key === "jobs" ? (
                      <JobsPage />
                    ) : section.key === "reports" ? (
                      <CallReportsPage />
                    ) : section.key === "transitionCareServices" ? (
                      <TransitionCareServicesPage />
                    ) : (
                      <ComingSoon />
                    )
                  }
                />
              ))}
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
