import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTooltip, setIsTooltip] = useState(false);

  return (
    <header>
      <nav className="shadow-md fixed top-0 w-full z-10 bg-white">
        <div className="grid grid-cols-12 md:ml-14 md:mr-14 mt-4 p-2 items-center">
          <div className="col-span-6 md:col-span-4 w-40 hover:cursor-pointer">
            <img src="/images/caremagix-logo.jpg" alt="Logo" />
          </div>

          <div className="col-span-6 flex justify-end md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    menuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>

          <div
            className={`col-span-12 md:col-span-5 mt-10 md:mt-0 ${
              menuOpen ? "block" : "hidden"
            } md:block`}
          >
            <ul className="flex flex-col md:flex-row justify-between items-start md:items-center text-gray-500 text-sm gap-4 md:gap-0">
              <li className="hover:cursor-pointer hover:text-green-500 hover:font-bold transition-colors">
                Our Platform
              </li>
              <li className="hover:cursor-pointer hover:text-green-500 hover:font-bold transition-colors">
                Solutions
              </li>
              <li className="hover:cursor-pointer hover:text-green-500 hover:font-bold transition-colors">
                Other Benefits
              </li>
              <li className="relative h-full">
                <div
                  className="flex items-center h-full px-3 py-2 hover:text-green-500 hover:font-bold cursor-pointer"
                  onMouseEnter={() => setIsTooltip(true)}
                  onMouseLeave={(e) => {
                  
                    if (!e.relatedTarget || !e.relatedTarget.closest(".dropdown-container")) {
                      setIsTooltip(false);
                    }
                  }}
                >
                  Patients
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`ml-1 w-4 h-4 transition-transform ${
                      isTooltip ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 1 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {isTooltip && (
                  <div
                    className="dropdown-container absolute left-0 top-full w-56 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50"
                    onMouseEnter={() => setIsTooltip(true)}
                    onMouseLeave={() => setIsTooltip(false)}
                    style={{
                      // Ensure dropdown appears right at navbar bottom
                      marginTop: "0",
                      // Optional: Add animation
                      animation: "fadeIn 0.2s ease-out",
                    }}
                  >
                    <a
                      href="#"
                      className="block px-4 py-3 hover:bg-gray-300 border-b border-gray-100"
                    >
                      Care Advocate
                    </a>
                    <a href="#" className="block px-4 py-3 hover:bg-gray-300">
                      Personal Care Advocates
                    </a>
                  </div>
                )}
              </li>

              <li>
                <Link
                  to={"/"}
                  className="bg-yellow-300 rounded-2xl py-2 px-4 hover:cursor-pointer hover:text-black hover:bg-yellow-400 transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>

            {/* Add this to your global CSS */}
            {/* <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-5px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style> */}
          </div>

          <div className={`hidden md:flex justify-end col-span-3 text-end `}>
            <div className="flex flex-col md:flex-row items-center gap-0 py-4 px-6 bg-green-600 text-white rounded hover:cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-4 mr-1"
              >
                <path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
                <path
                  fillRule="evenodd"
                  d="M8.625.75A3.375 3.375 0 0 0 5.25 4.125v15.75a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.125A3.375 3.375 0 0 0 15.375.75h-6.75ZM7.5 4.125C7.5 3.504 8.004 3 8.625 3H9.75v.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V3h1.125c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.875V4.125Z"
                  clipRule="evenodd"
                />
              </svg>
              Contact
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
