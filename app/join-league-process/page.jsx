"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import JoinLeague from "./components/JoinLeague";
import CreateTeam from "./components/CreateTeam";
import Confirmation from "./components/Confirmation";
import { useRouter } from "next/navigation";
import { useAlert } from "../../components/AlertContext/AlertContext";

const JoinLeagueProcess = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 4;
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
    const league = JSON.parse(sessionStorage.getItem("joinLeagueData"));
    const team = JSON.parse(sessionStorage.getItem("joinLeagueTeamData"));
    const body = {
      teamData: team,
      userData: user,
      leagueData: league,
    };
    console.log(body);
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyleague/join";
    axios.post(URL, body).then((response) => {
      console.log(response);
      addAlert(response.data.message, response.data.error ? "error" : "success");
      if (response.data.error == false) {
        sessionStorage.removeItem("joinLeagueData");
        sessionStorage.removeItem("joinLeagueTeamData");
        router.push("/dashboard");
      }
    });
  };

  useEffect(() => {
    setStep(2);
  }, []);

  return (
    <div className="join-league-process mx-6 mx-auto">
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      {step === 2 && <JoinLeague onNext={handleNext} />}
      {step === 3 && <CreateTeam onNext={handleNext} onBack={handleBack} />}
      {step === 4 && (
        <Confirmation onComplete={handleComplete} onBack={handleBack} />
      )}
    </div>
  );
};

export default JoinLeagueProcess;
