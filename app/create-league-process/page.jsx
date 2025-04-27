"use client";

import React, { useEffect, useState } from "react";
import CreateTeam from "./components/CreateTeam";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import CreateLeague from "./components/CreateLeague";
import InviteMembers from "./components/InviteMembers";
import Confirmation from "./components/Confirmation";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAlert } from "../../components/AlertContext/AlertContext";

const CreateLeagueProcess = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 5; // Number of steps in the process
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
      }

      if (userData && userData.user) {
        setUser(userData.user);
        console.log(userData.user.email);
      }
    }
  }, []);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleComplete = () => {
    //Variables
    const league = JSON.parse(sessionStorage.getItem("leagueData"));
    const team = JSON.parse(sessionStorage.getItem("teamData"));
    const invite = JSON.parse(sessionStorage.getItem("inviteData"));

    //Setting Body
    const body = {
      league_name: league.leagueName,
      league_image_path: league.leagueLogo,
      max_teams : league.maxTeams,
      creator: user.email,
      creator_name: user.first_name + " " + user.last_name,
      users_invited: invite.emails,
      users_onboard: [user.email],
      draft_order: [user.email],
      draft_configuration: {
        time_per_pick: league.secPerPick,
        state: league.startDraft,
        start_date: league.draftTime, //Date Picker Value here,
      },
      league_configuration: {
        auto_subs: true,
        waiver_format: "FAAB", //Waiver Drop Down value here
        starting_waiver: 250,
        format: league.format,
      },
      league_fixtures: [],
      teams: [{ userID: user._id, user_email: user.email, team: null }],
      teamData: team,
    };

    //API Call
    try {
      console.log(body);
      const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyleague";
      axios.post(URL, body).then((response) => {
        console.log(response)
        if (response.data && response.data.error === false) {
          addAlert("League successfully created!", "success");
          sessionStorage.removeItem("leagueData");
          sessionStorage.removeItem("teamData");
          sessionStorage.removeItem("inviteData");
          router.push("/dashboard");
        } else {
          addAlert("Please recheck inputs and submit again or try to re-login", "error");
        }
      });
    } catch {
      addAlert(
        "An unexpected error occurred when creating league. Please check your internet connection", "error"
      );
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
