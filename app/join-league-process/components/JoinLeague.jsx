"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Exo_2 } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation"; // Import useRouter to use client-side navigation
import { FaSpinner, FaImage } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";

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

  let user = null;
  if (sessionStorage.getItem("user"))
    user = JSON.parse(sessionStorage.getItem("user")).user;
  else if (localStorage.getItem("user"))
    user = JSON.parse(localStorage.getItem("user")).user;
  else router.push("/login?redirect=" + window.location.toString());

  const handleInviteCodeChange = (e) => {
    const code = e.target.value;
    setInviteCode(code);
  };

  const fetchLeagueDetails = async () => {
    if (!inviteCode || inviteCode.length < 8) {
      alert("Please type in a valid invite code");
      setLoading(false);
      return;
    }
    try {
      const URL =
        process.env.NEXT_PUBLIC_BACKEND_URL +
        "fantasyleague/code?code=" +
        inviteCode +
        "&email=" +
        user.email;
      axios.get(URL).then((response) => {
        if (response.data.error == false) {
          console.log(response.data.data);
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
          alert(response.data.message);
        }
      });
    } catch (error) {
      alert("An unexpected error occurred. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
      <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
        <h1 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
          Step 1: Join League
        </h1>
        <p className="my-4">
          Enter the invite code to join an existing league and access all its
          details. Confirm your entry once the league information appears.
        </p>
        <input
          type="text"
          value={inviteCode}
          onChange={handleInviteCodeChange}
          placeholder="Enter Invite Code"
          className="w-1/2 min-w-max px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
        />
        {loading && (
          <div className="flex items-center mt-4">
            <FaSpinner className="animate-spin text-[#FF8A00] mr-2" />
            <p>Loading league details...</p>
          </div>
        )}

        {leagueDetails && (
          <div className="w-1/2 mt-8 px-10 py-6 bg-[#070E13] rounded-3xl shadow-[0_0_1px_4px_rgba(12,25,34,1)] flex flex-col space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="w-[100px] h-[100px] overflow-hidden relative">
                  <Image
                    src={leagueDetails.league_image_path}
                    alt="League Logo"
                    fill
                    className={`object-cover`}
                  />
                </div>
                <div className="flex flex-col ml-6">
                  <h2 className={`text-2xl font-bold ${exo2.className}`}>
                    {leagueDetails.league_name}
                  </h2>
                  <div
                    className={`text-lg ${exo2.className}`}
                  >{`Draft Start Date :`}</div>
                  <div className={`text-lg ${exo2.className}`}>{`${new Date(
                    leagueDetails.draft_configuration.start_date
                  ).toGMTString()}`}</div>
                </div>
              </div>
              <div className="w-max text-right">
                <p className={`font-medium text-sm ${exo2.className}`}>Owner</p>
                <div className={`font-bold text-lg ${exo2.className}`}>
                  {leagueDetails.creator}
                </div>
              </div>
            </div>

            <div className={`${exo2.className} w-full mt-4 flex`}>
              <div className="flex flex-col items-start space-y-2 mr-16">
                <p>
                  Players Joined:{" "}
                  <strong className="text-lg text-white ml-2">
                    {leagueDetails.users_onboard.length}
                  </strong>
                </p>
                <p>
                  Seconds per Pick:{" "}
                  <strong className="text-lg text-white ml-2">
                    {leagueDetails.draft_configuration.time_per_pick}
                  </strong>
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                <p>
                  Format:{" "}
                  <strong className="text-lg text-white ml-2">
                    {leagueDetails.league_configuration.format}
                  </strong>
                </p>
                <p>
                  Waiver Format:{" "}
                  <strong className="text-lg text-white ml-2">
                    {leagueDetails.league_configuration.waiver_format}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={validated ? handleNext : fetchLeagueDetails}
          className={`absolute bottom-0 right-0 fade-gradient py-4 px-20 mx-6 md:mx-10 lg:mx-16 xl:mx-20 mt-36 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
        >
          {validated ? "NEXT : Create Team" : "VALIDATE : Check Invite Code"}
        </button>
      </div>
    </div>
  );
};

export default JoinLeague;
