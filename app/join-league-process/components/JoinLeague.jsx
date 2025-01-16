"use client";

import React, { useEffect, useState } from "react";
import { Exo_2 } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { useAlert } from "../../../components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ["400", "500", "700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const JoinLeague = ({ onNext }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [leagueDetails, setLeagueDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const { addAlert } = useAlert();
  const [user, setUser] = useState({});

  useEffect(() => {
    // Check if window is defined to ensure we are on the client side
    if (typeof window !== 'undefined') {
      let userData = null;
      if (sessionStorage.getItem("user")) {
        userData = JSON.parse(sessionStorage.getItem("user"));
      } else if (localStorage.getItem("user")) {
        userData = JSON.parse(localStorage.getItem("user"));
      } else {
        router.push("/login?redirect=" + window.location.toString());
        console.log(window.location.toString());
      }

      if (userData && userData.user) {
        setUser(userData.user);
        console.log(userData.user.email);
      }
    }
  }, []);

  const handleInviteCodeChange = (e) => {
    const code = e.target.value;
    setInviteCode(code);
  };

  const fetchLeagueDetails = async () => {
    if (!inviteCode || inviteCode.length < 8) {
      addAlert("Please type in a valid invite code", "error");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const URL =
        process.env.NEXT_PUBLIC_BACKEND_URL +
        "fantasyleague/code?code=" +
        inviteCode +
        "&email=" +
        user.email;

      const response = await axios.get(URL);
      console.log(response);
      if (!response.data.error) {
        setLeagueDetails(response.data.data);
        setValidated(true);
        sessionStorage.setItem(
          "joinLeagueData",
          JSON.stringify({
            inviteCode: inviteCode,
            leagueDetails: response.data,
          })
        );
      } else {
        setValidated(false);
        setLeagueDetails(null);
        addAlert(response.data.message, "error");
      }
    } catch (error) {
      addAlert("An unexpected error occurred. Please try again", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8 ">
      <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
        <h1 className={`text-2xl md:text-4xl font-bold ${exo2.className}`}>
          Step 1: Join League
        </h1>
        <p className="my-4 text-sm md:text-base lg:text-lg max-w-3xl">
          Enter the invite code to join an existing league and access all its
          details. Confirm your entry once the league information appears.
        </p>
        {/* Invite Code Input */}
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            placeholder="Enter Invite Code"
            className="w-full md:w-1/2 px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
          />
          {loading && (
            <div className="flex items-center mt-4 text-sm md:text-base">
              <FaSpinner className="animate-spin text-[#FF8A00] mr-2" />
              <p>Loading league details...</p>
            </div>
          )}
        </div>

        {/* League Details Card */}
        {leagueDetails && (
          <div className="w-full md:w-1/2 md:min-w-max mt-8 px-4 md:px-6 py-4 md:py-6 bg-[#070E13] rounded-3xl shadow-[0_0_1px_4px_rgba(12,25,34,1)] flex flex-col space-y-2 md:space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg">
                  {leagueDetails.league_image_path ? (
                    <Image
                      src={leagueDetails.league_image_path}
                      alt="League Logo"
                      fill
                      className="object-cover object-center"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col">
                  <h2
                    className={`text-xl md:text-2xl font-bold ${exo2.className}`}
                  >
                    {leagueDetails.league_name}
                  </h2>
                  <div
                    className={`text-sm md:text-base ${exo2.className}`}
                  >{`League Created On:`}</div>
                  <div className={`text-xs md:text-sm ${exo2.className}`}>
                    {new Date(leagueDetails.createdAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="w-max flex flex-row space-x-2 md:flex-col md:text-right md:pl-8">
                <p className={`font-medium text-sm ${exo2.className}`}>
                  Owner<span className="md:hidden">:</span>
                </p>
                <div
                  className={`font-bold text-sm md:text-base ${exo2.className}`}
                >
                  {leagueDetails.creator}
                </div>
              </div>
            </div>

            <div
              className={`${exo2.className} grid grid-cols-1 md:grid-cols-2 gap-2`}
            >
              <div className="space-y-2 text-sm md:text-base">
                <p>
                  Players Joined:{" "}
                  <strong className="text-sm md:text-lg text-white ml-2">
                    {leagueDetails.users_onboard.length}
                  </strong>
                </p>
                <p>
                  Auto Subs:{" "}
                  <strong className="text-sm md:text-lg text-white ml-2">
                    {leagueDetails.league_configuration.auto_subs
                      ? "Enabled"
                      : "Disabled"}
                  </strong>
                </p>
              </div>
              <div className="space-y-2 text-sm md:text-base">
                <p>
                  Format:{" "}
                  <strong className="text-sm md:text-lg text-white ml-2">
                    {leagueDetails.league_configuration.format}
                  </strong>
                </p>
                <p>
                  Waiver Format:{" "}
                  <strong className="text-sm md:text-lg text-white ml-2">
                    {leagueDetails.league_configuration.waiver_format}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={validated ? handleNext : fetchLeagueDetails}
          className={`absolute bottom-0 right-0 fade-gradient py-2 md:py-4 px-8 md:px-20 mx-6 md:mx-10 lg:mx-16 xl:mx-20 rounded-full text-white font-bold transition-all ease-in-out text-sm md:text-lg ${exo2.className}`}
        >
          {validated ? "NEXT : Create Team" : "VALIDATE : Check Invite Code"}
        </button>
      </div>
    </div>
  );
};

export default JoinLeague;
