import { Outlet } from "react-router-dom";

function CareGiverLayout() {
  return (
    <div className="px-4">
      <Outlet />
    </div>
  );
}

export default CareGiverLayout;
