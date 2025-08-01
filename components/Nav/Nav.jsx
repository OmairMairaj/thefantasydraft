"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Exo_2 } from "next/font/google";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { FaBell } from "react-icons/fa";
import { signIn, signOut, useSession } from "next-auth/react";

const exo2 = Exo_2({
  weight: ["400", "500", "700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const router = useRouter();

  React.useEffect(() => {
    if (sessionStorage.getItem("user")) {
      setUser(JSON.parse(sessionStorage.getItem("user")).user);
    } else {
      if (localStorage.getItem("user")) {
        setUser(JSON.parse(localStorage.getItem("user")).user);
      } else {
        setUser("nothing");
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Check if window is defined to ensure we are on the client side
    if (typeof window !== 'undefined') {
      let userData = null;

      // Get user from session storage or local storage
      if (sessionStorage.getItem("user")) {
        userData = JSON.parse(sessionStorage.getItem("user"));
      } else if (localStorage.getItem("user")) {
        userData = JSON.parse(localStorage.getItem("user"));
      }

      if (userData && userData.user) {
        setUser(userData.user);
        console.log(userData.user.email);
      } else {
        setUser("nothing");
      }
    }
  }, [pathname]);



  React.useEffect(() => {
    if (
      (pathname != "/" && pathname != "/how-to-play" && pathname != "/contact" && pathname != "/signup" && pathname != "/forgot-password" && pathname != "/change-password" && pathname != "/login" && pathname != "/verify" && pathname != "/privacy-policy" && pathname != "/terms-and-conditions") &&
      user === "nothing"
    ) {
      router.push("/login?redirect=" + window.location.toString());
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  // console.log(user);

  return (
    <nav
      className={`max-h-[120px] flex justify-between items-center border-b border-white py-2 lg:py-0 m-auto mx-4 sm:mx-8 md:mx-10 lg:mx-16 xl:mx-20  relative`}
    >
      <div className="flex space-x-1 items-center">
        <Link href={user ? "/dashboard" : "/"}>
          <Image
            src="/images/logo.svg"
            width={100}
            height={100}
            className="object-cover cursor-pointer w-16 sm:w-18 md:w-20 lg:w-24 xl:w-28"
            alt="The Fantasy Draft Logo"
          />
        </Link>
        <h1 className={`lg:hidden text-xl md:text-2xl font-bold leading-tight ml-0 text-white italic ${exo2.className}`}>
          THE <span className="text-[#FF8A00]">FANTASY</span> <br disabled />DRAFT
        </h1>
      </div>

      {/* Nav Links */}
      {(user === "nothing" || user === null) ? (
        <div
          className={`lg:flex ${menuOpen ? "block" : "hidden"} lg:space-x-6`}
        >
          <Link
            href="/"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            HOME
          </Link>
          <Link
            href="/how-to-play"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            HOW TO PLAY
          </Link>
          <Link
            href="/contact"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            CONTACT US
          </Link>
        </div>
      ) : (
        <div
          className={`lg:flex ${menuOpen ? "block" : "hidden"} lg:space-x-6`}
        >
          <Link
            href="/dashboard"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            DASHBOARD
          </Link>
          {/* <Link
            href="/how-to-play"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer ${exo2.className}`}
          >
            RULES
          </Link> */}
          <Link
            href="/fixtures"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            FIXTURES
          </Link>
          <Link
            href="/table"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            TABLE
          </Link>
          <Link
            href="/players"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            PLAYERS
          </Link>
          <Link
            href="/super-league"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base xl:text-lg cursor-pointer ${exo2.className}`}
          >
            SUPER LEAGUE
          </Link>
        </div>
      )}

      {/* Conditional Elements: Signup/Login OR User Dropdown for Dashboard */}
      {(user === "nothing" || user === null) ? (
        <div className="flex  p-1">
          <div className="hidden space-x-2 md:flex">
            {pathname !== "/signup" && (
              <Link
                href="/signup"
                className={`fade-gradient relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base xl:text-lg border-2 cursor-pointer ${exo2.className}`}
              >
                SIGN UP
              </Link>
            )}
            {pathname !== "/login" && (
              <Link
                href="/login"
                className={`fade-gradient relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base xl:text-lg border-2 cursor-pointer ${exo2.className}`}
              >
                LOGIN
              </Link>
              //Un-comment for NEXT AUTH
              // <div
              //   onClick={() => signIn()}
              //   className={`fade-gradient relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className}`}
              // >
              //   LOGIN
              // </div>
            )}
          </div>

          {/* Notification Icon */}
          <div ref={dropdownRef} className="relative md:hidden">
            <button
              className="text-white focus:outline-none flex items-center hover:text-[#FF8A00]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                ></path>
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#0C1922] text-white rounded-lg py-2 z-10"
                style={{
                  zIndex: 100,
                  boxShadow:
                    "0px 4px 20px rgba(0, 0, 0, 0.6), 0px 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div className="lg:hidden border-b border-gray-600 py-2">
                  <a
                    href="/"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Home
                  </a>
                  <a
                    href="/how-to-play"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    How To Play
                  </a>

                  <a
                    href="/contact"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Contact Us
                  </a>
                </div>
                <div className=" py-2">
                  <a
                    href="/signup"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Sign Up
                  </a>
                  <a
                    href="/login"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Login
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      ) : (
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <div className="relative flex justify-center items-center w-11 lg:w-[3.2rem] h-11 lg:h-[3.2rem] rounded-full border-2 border-transparent fade-gradient p-1 cursor-pointer">
            <div className="flex justify-center items-center w-full h-full rounded-full">
              <FaBell className="text-white text-lg lg:text-xl" />
            </div>
          </div>

          {/* User Avatar and Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="fade-gradient flex items-center space-x-4 py-2 px-2 rounded-full"
            >
              {user && user.first_name ?
                <div className={`flex justify-center items-center w-7 h-7 lg:w-8 lg:h-8 rounded-full ${dropdownOpen ? 'bg-transparent md:bg-[#B5B5B5]' : 'bg-[#B5B5B5]'}`}>
                  <h2 className={`text-gray-900 text-base lg:text-xl flex justify-center items-center font-bold pr-[2px] ${exo2.className}`}>{user.first_name.charAt(0).toUpperCase()}</h2>
                </div>
                :
                <FaUserCircle className="text-2xl lg:text-3xl" />
              }

              {/* Username and Chevron */}
              <span className="hidden md:flex text-white ml-2">
                {(user && user.first_name) ? user.first_name + " " + user.last_name : ""}
              </span>
              <FiChevronDown className="text-white hidden md:flex" />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#0C1922] text-white rounded-lg py-2 z-10"
                style={{
                  zIndex: 100,
                  boxShadow:
                    "0px 4px 20px rgba(0, 0, 0, 0.6), 0px 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div className="lg:hidden border-b border-gray-600 py-2">
                  <a
                    href="/"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Home
                  </a>
                  <a
                    href="/how-to-play"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    How To Play
                  </a>

                  <a
                    href="/contact"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Contact Us
                  </a>
                </div>
                <div className=" py-2">
                  <a
                    href="/profile"
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Account
                  </a>
                  <a
                    href="/how-to-play"
                    className="hidden lg:block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    How To Play
                  </a>
                  <a
                    href="/contact"
                    className="hidden lg:block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Contact Us
                  </a>
                  <a
                    href="/dashboard"
                    className="block lg:hidden px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/fixtures"
                    className="block lg:hidden px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Fixtures
                  </a>
                  <a
                    href="/table"
                    className="block lg:hidden px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Table
                  </a>
                  <a
                    href="/players"
                    className="block lg:hidden px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Players
                  </a>
                  <a
                    href="/super-league"
                    className="block lg:hidden px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Super League
                  </a>
                  <div
                    onClick={() => {
                      setDropdownOpen(false);
                      sessionStorage.clear();
                      localStorage.clear();
                      router.push("/");
                    }}
                    style={{ cursor: "pointer" }}
                    className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                  >
                    Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
      }
    </nav >
  );
};

export default Nav;
