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

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleComplete = () => {
    const league = JSON.parse(sessionStorage.getItem("joinLeagueData"));
    const team = JSON.parse(sessionStorage.getItem("joinLeagueTeamData"));
    let user = {};
    if (sessionStorage.getItem("user"))
      user = JSON.parse(sessionStorage.getItem("user")).user;
    else user = JSON.parse(localStorage.getItem("user")).user;
    const body = {
      teamData: team,
      userData: user,
      leagueData: league,
    };
    console.log(body);
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyleague/join";
    axios.post(URL, body).then((response) => {
      console.log(response);
      if (response.data.error == false) {
        addAlert("Successfully joined the league!", "success");
        sessionStorage.removeItem("joinLeagueData");
        sessionStorage.removeItem("joinLeagueTeamData");
        router.push("/dashboard");
      } else addAlert(res.data.message, res.data.error ? "error" : "success");
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
