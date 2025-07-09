import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function AuthLayout() {
  return (
    <div>
      <Header />
      <div className="pt-24 px-4">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default AuthLayout;
