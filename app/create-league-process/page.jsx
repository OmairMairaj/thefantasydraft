'use client';

import React, { useEffect, useState } from 'react';
import CreateTeam from './components/CreateTeam';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import CreateLeague from './components/CreateLeague';
import InviteMembers from './components/InviteMembers';
import Confirmation from './components/Confirmation';
import { useRouter } from 'next/navigation';

const CreateLeagueProcess = () => {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const totalSteps = 5; // Number of steps in the process

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const handleComplete = () => {
        // Logic for when the process is complete
        alert('League successfully created!');
        sessionStorage.removeItem('leagueData');
        sessionStorage.removeItem('teamData');
        sessionStorage.removeItem('inviteData');
        router.push('/dashboard');
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
            {step === 5 && <Confirmation onNext={handleComplete} onBack={handleBack} />}
        </div>
    );
};

export default CreateLeagueProcess;

