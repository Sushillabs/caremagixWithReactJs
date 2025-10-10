import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
// import Footer from "./components/Footer";
import CareGiver from "./pages/CareGiver";
import CareGiverLayout from "./layouts.jsx/CareGiverLayout";
import AuthLayout from "./layouts.jsx/AuthLayout";
import RequireAuth from "./components/RequireAuth";

function App() {
  // const [count, setCount] = useState(0)

  const roles = ["caregiver", "physician", "patient"];

  return (
    <>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Route>
          <Route element={
              <RequireAuth roles={roles}>
                <CareGiverLayout />
              </RequireAuth>
            }
          >
            <Route path="/care-giver" element={<CareGiver />} />
            {/* <Route path="/physician" element={<Physician/>} /> */}
            {/* <Route path="/patient" element={<Patient />} /> */}
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
