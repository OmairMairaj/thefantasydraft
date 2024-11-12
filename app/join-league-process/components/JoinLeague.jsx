'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { FaSpinner, FaImage } from 'react-icons/fa';
import Image from 'next/image';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const debounce = (func, delay) => {
    let timerId;
    return (...args) => {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const JoinLeague = ({ onNext }) => {
    const savedData = sessionStorage.getItem('joinLeagueData') ? JSON.parse(sessionStorage.getItem('joinLeagueData')) : {} || {};

    const [inviteCode, setInviteCode] = useState(savedData.inviteCode || '');
    const [leagueDetails, setLeagueDetails] = useState(savedData.leagueDetails || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInviteCodeChange = (e) => {
        const code = e.target.value;
        setInviteCode(code);
        setError('');
        setLeagueDetails(null);
        setLoading(true);

        // Debounce the actual validation function
        debounceFetchLeagueDetails(code);
    };

    const fetchLeagueDetails = async (code) => {
        if (!code) {
            setLoading(false);
            return;
        }

        try {
            // Simulate API call to verify invite code
            const regex = /^[A-Z0-9]{6}$/i; // Example regex for a 6-character alphanumeric code
            if (!regex.test(code)) {
                throw new Error('Invalid Invite Code format.');
            }

            // Simulated data for league
            setLeagueDetails({
                name: 'Test League',
                owner: 'Test Owner',
                currentTeams: 5,
                maxTeams: 12,
                secPerPick: 30,
                startDraft: 'Manual',
                format: 'Classic',
                logo: '/images/barcelona-logo.svg', // Sample path for a logo image
            });

            // Uncomment this to replace with an actual API call to get league details
            // const response = await axios.get(`/api/league?inviteCode=${code}`);
            // if (response.status === 200) {
            //     setLeagueDetails(response.data);
            //     sessionStorage.setItem(
            //         'joinLeagueData',
            //         JSON.stringify({ inviteCode: code, leagueDetails: response.data })
            //     );
            // } else {
            //     throw new Error('Invite Code not found.');
            // }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Wrap fetchLeagueDetails in debounce function
    const debounceFetchLeagueDetails = useCallback(debounce(fetchLeagueDetails, 3000), []);

    const handleNext = () => {
        // if (leagueDetails) {
        onNext();
        // } else {
        // setError('Please fetch valid league details before proceeding.');
        // }
    };

    useEffect(() => {
        sessionStorage.setItem(
            'joinLeagueData',
            JSON.stringify({ inviteCode, leagueDetails })
        );
    }, [inviteCode, leagueDetails]);

    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
            <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
                <h1 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 1: Join League
                </h1>
                <p className="my-4">
                    Enter the invite code to join an existing league and access all its details. Confirm your entry once the league information appears.
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
                {error && <p className="text-red-500 mt-4">{error}</p>}

                {leagueDetails && (
                    <div className="w-1/2 mt-8 px-10 py-6 bg-[#070E13] rounded-3xl shadow-[0_0_1px_4px_rgba(12,25,34,1)] flex flex-col space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <div className="w-[100px] h-[100px] overflow-hidden relative">
                                    <Image
                                        src={leagueDetails.logo}
                                        alt="League Logo"
                                        fill
                                        className={`object-cover`}
                                    />
                                </div>
                                <div className="flex flex-col ml-6">
                                    <h2 className={`text-2xl font-bold ${exo2.className}`}>{leagueDetails.name}</h2>
                                    <div className={`text-lg ${exo2.className}`}>{`Current Teams: ${leagueDetails.currentTeams}/${leagueDetails.maxTeams}`}</div>
                                </div>
                            </div>
                            <div className="w-max text-right">
                                <p className={`font-medium text-sm ${exo2.className}`}>Owner</p>
                                <div className={`font-bold text-lg ${exo2.className}`}>{leagueDetails.owner}</div>
                            </div>
                        </div>

                        <div className={`${exo2.className} w-full mt-4 flex`}>
                            <div className="flex flex-col items-start space-y-2 mr-16">
                                <p>Maximum Teams: <strong className="text-lg text-white ml-2">{leagueDetails.maxTeams}</strong></p>
                                <p>Seconds per Pick: <strong className="text-lg text-white ml-2">{leagueDetails.secPerPick}</strong></p>
                            </div>
                            <div className="flex flex-col items-start space-y-2">
                                <p>Format: <strong className="text-lg text-white ml-2">{leagueDetails.format}</strong></p>
                                <p>Start Draft: <strong className="text-lg text-white ml-2">{leagueDetails.startDraft}</strong></p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    className={`absolute bottom-0 right-0 fade-gradient py-4 px-20 mx-6 md:mx-10 lg:mx-16 xl:mx-20 mt-36 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
                // disabled={!leagueDetails}
                >
                    NEXT : Create Team
                </button>
            </div>
        </div>
    );
};

export default JoinLeague;
