import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import CareGiver from "./pages/CareGiver";
import CareGiverLayout from "./layouts.jsx/CareGiverLayout";
import AuthLayout from "./layouts.jsx/AuthLayout";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "react-hot-toast";

const isExtension = window.location.protocol === 'chrome-extension:';
console.log('protocol:', window.location.protocol);
console.log('isExtension:', isExtension);

const Router = isExtension ? MemoryRouter : BrowserRouter;

function App() {
  const roles = ["caregiver", "physician", "patient"];

  return (
    <div style={isExtension ? {
      width: '400px',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'white',
      position: 'relative'
    } : {}}>
      <Toaster position="top-right" containerStyle={{ top: 60 }} />
      <Router initialEntries={["/"]}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;