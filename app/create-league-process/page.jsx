"use client";

import React, { useEffect, useState } from "react";
import CreateTeam from "./components/CreateTeam";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import CreateLeague from "./components/CreateLeague";
import InviteMembers from "./components/InviteMembers";
import Confirmation from "./components/Confirmation";
import { useRouter } from "next/navigation";
import axios from "axios";

const CreateLeagueProcess = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 5; // Number of steps in the process

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleComplete = () => {
    //Variables
    const league = JSON.parse(sessionStorage.getItem("leagueData"));
    const team = JSON.parse(sessionStorage.getItem("teamData"));
    const invite = JSON.parse(sessionStorage.getItem("inviteData"));
    let user = {};
    if (sessionStorage.getItem("user"))
      user = JSON.parse(sessionStorage.getItem("user")).user;
    else user = JSON.parse(localStorage.getItem("user")).user;

    //Setting Body
    const body = {
      league_name: league.leagueName,
      league_image_path: league.leagueLogo,
      creator: user.email,
      users_invited: invite.emails,
      users_onboard: [user.email],
      draft_order: [user.email],
      draft_configuration: {
        time_per_pick: league.secPerPick,
        state: league.startDraft,
        start_date: "2025-01-01T00:00:00.000+00:00", //Date Picker Value here,
      },
      league_configuration: {
        auto_subs: true,
        waiver_format: "FAAB", //Waiver Drop Down value here
        starting_waiver: 250,
        format: league.format,
      },
      league_fixtures: [],
      teams: [{ user: user._id, team: null }],
    };

    //API Call
    try {
      const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "league";
      axios.post(URL, body).then((response) => {
        if (response.data && response.data.error === false) {
          alert("League successfully created!");
          sessionStorage.removeItem("leagueData");
          sessionStorage.removeItem("teamData");
          sessionStorage.removeItem("inviteData");
          router.push("/dashboard");
        } else {
          alert("Please recheck inputs and submit again or try to re-login");
        }
      });
    } catch {
      alert("An unexpected error occurred when creating league. Please check your internet connection");
    }
  };

  useEffect(() => {
    setStep(2);
  }, []);

  return (
    <div className="create-league-process mx-auto">
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      {step === 2 && <CreateLeague onNext={handleNext} onBack={handleBack} />}
      {step === 3 && <CreateTeam onNext={handleNext} onBack={handleBack} />}
      {step === 4 && <InviteMembers onNext={handleNext} onBack={handleBack} />}
      {step === 5 && (
        <Confirmation onNext={handleComplete} onBack={handleBack} />
      )}
    </div>
  );
};

export default CreateLeagueProcess;
