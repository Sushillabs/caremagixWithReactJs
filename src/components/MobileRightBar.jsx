import { FaUser } from "react-icons/fa"
import { X } from "lucide-react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const MobileRightBar = ({ setRightBar }) => {
    let plans = [
        "Discharge Plan",
        "Nursing plan",
        "Transition-CarePlan",
        "ICD Codes",
        "CPT Codes",
        "Medical Adherence",
    ];
    const [isDischargeToggle, setIsDishchargeToggle] = useState(true)
    const user = useSelector((state) => state.auth.value);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(logout());
        navigate('/');

        console.log("Logged out");
    }
    return (
        <div className="z-50 fixed bg-white shadow-lg grid grid-cols-15 pl-4 pr-4">
            <X className="cursor-pointer h-6 w-6 absolute top-0 right-2" onClick={() => setRightBar(false)} />
            <div className="mt-4 col-span-15 mb-2 flex items-center justify-between md:justify-end">
                <div className="text-xs flex font-semibold mr-4 text-gray-600 ">
                    <div className="border-r pr-1">
                        <p>Facility Name: {user.facility_name}</p>
                        <p>Beds Available: {user.beds_available}</p>
                    </div>
                    <div className="pl-1 pr-1">
                        <p className="flex items-center gap-1">
                            <FaUser />
                            {user.first_name}
                        </p>
                        <p className="">{user.role}</p>
                    </div>
                </div>


            </div>
            <div className="col-span-15 mb-2 flex flex-wrap justify-between items-center lg:ml-4 lg:pr-4">
                {plans &&
                    plans.map((plan, ind) =>
                        ind === 0 ? (
                            <div
                                className="flex flex-col relative w-1/2 sm:w-1/3 md:w-auto  "
                                onMouseEnter={() => setIsDishchargeToggle(false)}
                                onMouseLeave={() => setIsDishchargeToggle(true)}
                            >
                                <p
                                    key={ind}
                                    // onClick={() => setIsDishchargeToggle(!isDischargeToggle)}
                                    className="border border-black p-2 rounded-2xl bg-white text-xs font-semibold cursor-pointer"
                                >
                                    {plan}
                                </p>

                                {!isDischargeToggle && ind === 0 && (
                                    <ul className="bg-gray-100 p-2 rounded shadow-md mt-0 text-sm absolute w-44 top-full z-10">
                                        <li className="py-1 hover:bg-gray-300 cursor-pointer">
                                            Discharge Plan
                                        </li>
                                        <li className="py-1 hover:bg-gray-300 cursor-pointer">
                                            Create Discharge Plan
                                        </li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div
                                key={ind}
                                className="w-1/2 sm:w-1/3 md:w-auto border border-black p-2 rounded-2xl bg-white text-xs font-semibold cursor-pointer"
                            >
                                {plan}
                            </div>
                        )
                    )}
            </div>
            <button
                type="button"
                onClick={handleLogout}
                className=" w-28 mb-2 py-2 text-xs text-white bg-red-600 cursor-pointer hover:bg-red-700 rounded-lg transition duration-200"
            >
                Logout
            </button>
        </div>
    )
}
export default MobileRightBar;