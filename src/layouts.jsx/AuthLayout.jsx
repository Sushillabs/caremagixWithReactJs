import { Outlet, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function AuthLayout() {
 const location=useLocation();
 const privacy=location.pathname === '/privacy-policy'
  return (
    <div>
      <Header />
      <div className="pt-24 px-4">
        <Outlet />
      </div>
      {!privacy && <Footer />}
    </div>
  );
}

export default AuthLayout;
