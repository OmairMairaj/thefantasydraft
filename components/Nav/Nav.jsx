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
import { HiTrophy } from 'react-icons/hi2';
import axios from "axios";

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
  const [achProgress, setAchProgress] = useState({ count: 0, total: 0 });

  // React.useEffect(() => {
  //   if (sessionStorage.getItem("user")) {
  //     setUser(JSON.parse(sessionStorage.getItem("user")).user);
  //   } else {
  //     if (localStorage.getItem("user")) {
  //       setUser(JSON.parse(localStorage.getItem("user")).user);
  //     } else {
  //       setUser("nothing");
  //     }
  //   }
  // }, [pathname]);

  React.useEffect(() => {
    // Check if window is defined to ensure we are on the client side
    if (typeof window === 'undefined') return;
    let userData = null;

    // Get user from session storage or local storage
    if (sessionStorage.getItem("user")) {
      userData = JSON.parse(sessionStorage.getItem("user"));
    } else if (localStorage.getItem("user")) {
      userData = JSON.parse(localStorage.getItem("user"));
    }

    if (userData && userData.user) {
      setUser(userData.user);
      console.log("User from Nav: ", userData.user.email);
    } else {
      setUser("nothing");
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

  // ——— Fetch achievements total + compute unlocked count ———
  useEffect(() => {
    let cancelled = false;

    const computeUnlockedCount = (u) => {
      if (!u || !Array.isArray(u.achievements)) return 0;
      // Ensure uniqueness by achievement id; only count unlocked
      const ids = new Set(
        u.achievements
          .filter((a) => a?.unlocked)
          .map((a) => (typeof a.achievement === "object" ? a.achievement?._id : a.achievement))
          .filter(Boolean)
      );
      return ids.size;
    };

    const load = async () => {
      try {
        const [{ data: achRes }] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyachievement`),
        ]);

        console.log("Achievements fetched: ", achRes);

        const total = Array.isArray(achRes?.data) ? achRes.data.length : 0;
        const count = computeUnlockedCount(user);

        if (!cancelled) setAchProgress({ count, total });
      } catch (e) {
        // If API fails, still show user's unlocked count with total=0 (or keep previous total)
        if (!cancelled) {
          setAchProgress((prev) => ({ total: prev.total || 0, count: computeUnlockedCount(user) }));
        }
      }
    };

    if (user && user !== "nothing") load();
    else setAchProgress({ count: 0, total: 0 });

    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

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
          <div className="hidden space-x-2 lg:flex">
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
          <div ref={dropdownRef} className="relative lg:hidden">
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
        <div className="flex items-center space-x-2">
          {/* Notification Icon */}
          {/* <div className="relative flex justify-center items-center w-11 lg:w-[3.2rem] h-11 lg:h-[3.2rem] rounded-full border-2 border-transparent fade-gradient p-1 cursor-pointer">
            <div className="flex justify-center items-center w-full h-full rounded-full">
              <FaBell className="text-white text-lg lg:text-xl" />
            </div>
          </div> */}

          {/* Achievements Progress (clickable) */}
          <div className="relative hidden sm:flex">
            <AchievementNavBadge
              count={achProgress.count}
              total={achProgress.total}
              onClick={() => router.push('/achievements')}
            />
          </div>

          {/* User Avatar and Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="fade-gradient flex items-center space-x-4 py-2 px-2 rounded-full"
            >
              {user && user.first_name ?
                <div className={`flex justify-center items-center w-7 h-7 lg:w-8 lg:h-8 rounded-full ${dropdownOpen ? 'bg-[#FF8A00] md:bg-[#1D374A]' : 'bg-[#1D374A]'}`}>
                  <h2 className={`text-gray-100 text-base lg:text-xl flex justify-center items-center font-bold pr-[2px] ${exo2.className}`}>{user.first_name.charAt(0).toUpperCase()}</h2>
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
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden
                 bg-[#0C1922] border border-[#1D374A]
                 shadow-[0_10px_25px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.25)]
                 z-50"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#1D374A]">
                  <div className="text-sm text-slate-300">Signed in as</div>
                  <div className="text-white font-semibold truncate">
                    {user?.first_name} {user?.last_name}
                  </div>
                  {/* <div className="text-xs text-slate-400 truncate">{user?.email}</div> */}
                </div>

                {/* Main nav (mobile shortcuts first) */}
                <Link href="/achievements" onClick={() => setDropdownOpen(false)} className="py-1 flex justify-between sm:hidden border-b border-[#1D374A]">
                  <div className="block  px-4 py-2 hover:bg-[#FF8A00]/10">Achievements</div>
                  <div className={`group relative flex justify-center items-center w-10 h-10 lg:w-[52px] lg:h-[52px] xl:w-14 xl:h-14 rounded-full p-[5px] cursor-pointer mr-2 ${exo2.className}`}>
                    {/* Spinning glow halo */}
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#FF8A0044_0%,transparent_25%,#FF8A0044_50%,transparent_75%,#FF8A0044_100%)] animate-[spin_10s_linear_infinite] blur-[2px] opacity-80" aria-hidden />

                    {/* Progress ring */}
                    <div className="absolute inset-[1px] rounded-full"
                      style={{
                        background: `conic-gradient(#FF8A00 ${achProgress.total > 0 ? Math.min(100, Math.round((achProgress.count / achProgress.total) * 100)) : 0}%, rgba(255,255,255,0.08) ${achProgress.total > 0 ? Math.min(100, Math.round((achProgress.count / achProgress.total) * 100)) : 0}% 100%)`,
                      }}
                      aria-hidden
                    />

                    {/* Inner disk */}
                    <div className="absolute inset-[3px] rounded-full bg-[#0C1922] border border-[#1D374A] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />

                    {/* Center content */}
                    <div className="relative z-10 flex items-center justify-center leading-none select-none">
                      <span className="text-xs lg:text-sm font-bold text-amber-200 pr-0.5">
                        {achProgress.count}
                      </span>
                      <HiTrophy className="text-[#FF8A00] w-3 text-base lg:text-lg drop-shadow-[0_0_8px_rgba(255,138,0,0.65)]" />
                    </div>

                    {/* Hover tooltip */}
                    <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#0C1922] border border-[#1D374A] text-[10px] text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {achProgress.count}/{achProgress.total} Achievements
                    </div>

                    {/* Tap/hover effects */}
                    <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-active:ring-[#FF8A00]/40 transition-all" />
                    <span className="absolute inset-[4px] rounded-full bg-[#FF8A00]/0 group-hover:bg-[#FF8A00]/[0.06] transition-colors" />
                  </div>
                </Link>

                <div className="py-1 block lg:hidden border-b border-[#1D374A]">
                  <a href="/dashboard" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Dashboard</a>
                  <a href="/team" className="block px-4 py-2 hover:bg-[#FF8A00]/10">My Team</a>
                  <a href="/league-table" className="block px-4 py-2 hover:bg-[#FF8A00]/10">My League</a>
                  <a href="/transfers" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Transfers</a>
                  <a href="/match-center" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Match Center</a>
                  <a href="/super-league" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Super League</a>
                </div>

                <div className="py-1 block lg:hidden border-b border-[#1D374A]">
                  <a href="/fixtures" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Fixtures</a>
                  <a href="/table" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Table</a>
                  <a href="/players" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Players</a>
                </div>

                {/* Secondary */}
                <div className="py-1 border-b border-[#1D374A]">
                  <a href="/" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Home</a>
                  <a href="/how-to-play" className="block px-4 py-2 hover:bg-[#FF8A00]/10">How To Play</a>
                  <a href="/contact" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Contact Us</a>
                </div>

                {/* Account actions */}
                <div className="py-1">
                  <a href="/profile" className="block px-4 py-2 hover:bg-[#FF8A00]/10">Account</a>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      sessionStorage.clear();
                      localStorage.clear();
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FF8A00]/10 text-rose-200"
                  >
                    Logout
                  </button>
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



function AchievementNavBadge({ count = 0, total = 41, onClick }) {
  const pct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;

  return (
    <button
      onClick={onClick}
      aria-label="View Achievements"
      title="View Achievements"
      className={`group relative flex justify-center items-center w-12 h-12 lg:w-[52px] lg:h-[52px] xl:w-14 xl:h-14 rounded-full p-[5px] cursor-pointer ${exo2.className}`}
    >
      {/* Spinning glow halo */}
      <div
        className="absolute inset-0 rounded-full
                   bg-[conic-gradient(from_0deg,#FF8A0044_0%,transparent_25%,#FF8A0044_50%,transparent_75%,#FF8A0044_100%)]
                   animate-[spin_10s_linear_infinite] blur-[2px] opacity-80"
        aria-hidden
      />

      {/* Progress ring */}
      <div
        className="absolute inset-[2px] rounded-full"
        style={{
          background: `conic-gradient(#FF8A00 ${pct}%, rgba(255,255,255,0.08) ${pct}% 100%)`,
        }}
        aria-hidden
      />

      {/* Inner disk */}
      <div className="absolute inset-[5px] rounded-full bg-[#0C1922] border border-[#1D374A] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />

      {/* Center content */}
      <div className="relative z-10 flex items-center justify-center leading-none select-none">
        <span className="text-xs lg:text-sm font-bold text-amber-200 pr-1">
          {count}
        </span>
        <HiTrophy className="text-[#FF8A00] w-3 text-base lg:text-lg drop-shadow-[0_0_8px_rgba(255,138,0,0.65)]" />
      </div>

      {/* Hover tooltip */}
      <div
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2
                   px-2 py-1 rounded-md bg-[#0C1922] border border-[#1D374A]
                   text-[10px] text-slate-200 whitespace-nowrap opacity-0
                   group-hover:opacity-100 transition-opacity"
      >
        {count}/{total} Achievements
      </div>

      {/* Tap/hover effects */}
      <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-active:ring-[#FF8A00]/40 transition-all" />
      <span className="absolute inset-[4px] rounded-full bg-[#FF8A00]/0 group-hover:bg-[#FF8A00]/[0.06] transition-colors" />
    </button>
  );
}