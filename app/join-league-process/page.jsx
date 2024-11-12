'use client';

import React, { useEffect, useState } from 'react';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import JoinLeague from './components/JoinLeague';
import CreateTeam from './components/CreateTeam';
import Confirmation from './components/Confirmation';
import { useRouter } from 'next/navigation';

const JoinLeagueProcess = () => {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const handleComplete = () => {
        // Logic for when the process is complete
        alert('Successfully joined the league!');
        sessionStorage.removeItem('joinLeagueData');
        sessionStorage.removeItem('joinLeagueTeamData');
        router.push('/dashboard');
    };

    useEffect(() => {
        setStep(2);
    }, []);

    return (
        <div className="join-league-process mx-6 mx-auto">
            <ProgressBar currentStep={step} totalSteps={totalSteps} />

            {step === 2 && <JoinLeague onNext={handleNext} />}
            {step === 3 && <CreateTeam onNext={handleNext} onBack={handleBack} />}
            {step === 4 && <Confirmation onComplete={handleComplete} onBack={handleBack} />}
        </div>
    );
};

export default JoinLeagueProcess;
