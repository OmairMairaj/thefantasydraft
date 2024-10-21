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
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const router = useRouter();

  // const session = useSession();
  // console.log(session);

  React.useEffect(() => {
    if (sessionStorage.getItem("user")) {
      setUser(sessionStorage.getItem("user"));
    } else {
      if (localStorage.getItem("user")) {
        setUser(sessionStorage.getItem("user"));
      } else {
        setUser("nothing");
      }
    }
  }, [pathname]);

  React.useEffect(() => {
    if (pathname == "/dashboard" && user==="nothing") {
      router.push("/login");
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

  return (
    <nav
      className={`max-h-[120px] flex justify-between items-center border-b border-white py-10 m-auto mx-6 md:mx-10 lg:mx-16 xl:mx-20  relative`}
    >
      <div className="flex space-x-5 items-center">
        <Link href="/">
          <Image
            src="/images/logo.svg"
            width={100}
            height={100}
            className="object-cover cursor-pointer"
            alt="The Fantasy Draft Logo"
          />
        </Link>
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden">
        <button
          className="text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
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
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            ></path>
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      {pathname !== "/dashboard" ? (
        <div
          className={`md:flex ${menuOpen ? "block" : "hidden"} md:space-x-6`}
        >
          <Link
            href="/"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer ${exo2.className}`}
          >
            HOME
          </Link>
          <Link
            href="/how-to-play"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer ${exo2.className}`}
          >
            HOW TO PLAY
          </Link>
          <Link
            href="/contact"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer ${exo2.className}`}
          >
            CONTACT US
          </Link>
        </div>
      ) : (
        <div
          className={`md:flex ${menuOpen ? "block" : "hidden"} md:space-x-6`}
        >
          <Link
            href="/dashboard"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer ${exo2.className}`}
          >
            DASHBOARD
          </Link>
          <Link
            href="/how-to-play"
            className={`text-white hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer ${exo2.className}`}
          >
            RULES
          </Link>
        </div>
      )}

      {/* Conditional Elements: Signup/Login OR User Dropdown for Dashboard */}
      {user==="nothing" ? (
        <div className="flex space-x-2 p-1">
          {pathname !== "/signup" && (
            <Link
              href="/signup"
              className={`fade-gradient relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className}`}
            >
              SIGN UP
            </Link>
          )}
          {pathname !== "/login" && (
            <Link
              href="/login"
              className={`fade-gradient relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className}`}
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
      ) : (
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <div className="relative flex justify-center items-center w-14 h-14 rounded-full border-2 border-transparent fade-gradient p-1 cursor-pointer">
            <div className="flex justify-center items-center w-full h-full rounded-full">
              <FaBell className="text-white text-lg" />
            </div>
          </div>

          {/* User Avatar and Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="fade-gradient flex items-center space-x-4 py-2 px-5 rounded-full"
            >
              {/* Avatar */}
              {/* <div className="flex items-center bg-[#0C1922] rounded-full p-1">
                                <Image
                                    src="/path-to-avatar.jpg" // Replace with the path to the user's avatar
                                    alt="User Avatar"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                />
                            </div> */}

              <FaUserCircle className="text-4xl" />

              {/* Username and Chevron */}
              <span className="text-white ml-2">Omair Mairaj</span>
              <FiChevronDown className="text-white" />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#0C1922] text-white rounded-lg py-2 z-10"
                style={{
                  zIndex:100,
                  boxShadow:
                    "0px 4px 20px rgba(0, 0, 0, 0.6), 0px 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <a
                  href="/profile"
                  className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                >
                  Account
                </a>  
                <a
                  href="/dashboard"
                  className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                >
                  Dashboard
                </a>  
                <div
                  onClick={() => {
                    setDropdownOpen(false);
                    sessionStorage.clear();
                    localStorage.clear();
                    router.push("/");
                  }}
                  style={{cursor:"pointer"}}
                  className="block px-4 py-2 hover:bg-[#FF8A00A3] rounded-lg"
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
