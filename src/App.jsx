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
import ComingSoon from "./features/common/ComingSoon";
import { SECTIONS } from "./config/sections";

const isExtension = window.location.protocol === "chrome-extension:";
console.log("protocol:", window.location.protocol);
console.log("isExtension:", isExtension);

const Router = isExtension ? MemoryRouter : BrowserRouter;

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
      <Router initialEntries={["/"]}>
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
            <Route path="/app/patients/:id" element={<PatientDetails />} />
            {Object.values(SECTIONS).map((section) => (
              <Route
                key={section.key}
                path={section.path}
                element={section.key === "dashboard" ? <Dashboard /> : section.key === "patients" ? <PatientsList /> : <ComingSoon />}
              />
            ))}
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
