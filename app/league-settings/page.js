'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAlert } from '@/components/AlertContext/AlertContext';

import { Exo_2 } from 'next/font/google';


const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const LeagueSettings = () => {
    const [user, setUser] = useState(null);
    const [leagueID, setLeagueID] = useState(null);
    const router = useRouter();
    const { addAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [leagueData, setLeagueData] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    


    useEffect(() => {
        // Check if window is defined to ensure we are on the client side
        if (typeof window !== 'undefined') {
            let userData = null;

            // Get user from session storage or local storage
            if (sessionStorage.getItem("user")) {
                userData = JSON.parse(sessionStorage.getItem("user"));
            } else if (localStorage.getItem("user")) {
                userData = JSON.parse(localStorage.getItem("user"));
            } else {
                router.push("/login?redirect=" + window.location.toString());
            }

            // Extract leagueID from the URL using window.location
            if (userData && userData.user) {
                setUser(userData.user);
                const urlParams = new URLSearchParams(window.location.search);
                const leagueIDFromURL = urlParams.get('leagueID');
                if (leagueIDFromURL) {
                    setLeagueID(leagueIDFromURL);
                } else {
                    console.error("League ID not found in URL");
                }
            }
        }
    }, []);

    useEffect(() => {
        // Fetch league data if user and leagueID are available
        if (user && leagueID) {
            fetchLeagueData();
        }
    }, [user, leagueID]);

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            // console.log("editData");    
            // console.log(editData);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague/edit`, {
                leagueData: editData
            });
            if (response.data && !response.data.error) {
                setLeagueData(response.data.data);
                console.log("League settings saved successfully:", response.data.data);
                addAlert("League settings saved successfully.", "success");
                setIsEditing(false);
            } else {
                console.error("Failed to save League data:", response.data.message);
                addAlert("Unable to edit League settings. Please try again later", "error");
            }
            setLoading(false);
        } catch (error) {
            console.error("Error saving League data:", error);
            setLoading(false);
        }
    };

    const fetchLeagueData = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague?leagueID=${leagueID}`
            );
            if (response.data && !response.data.error) {
                console.log("leagueData: ", response.data.data[0]);
                const league = response.data.data[0];

                // Check if the logged-in user is part of the league's teams
                const isUserPartOfLeague = league.teams.some(
                    (team) => team.user_email === user.email
                );
                if (!isUserPartOfLeague) {
                    // Redirect the user to the dashboard if they are not part of the league
                    addAlert("You are not a part of this league.", "error");
                    router.push("/dashboard");
                    return;
                }

                // Check if the current user is the creator of the league
                if (league.creator === user.email) {
                    setIsCreator(true);
                } else {
                    setIsCreator(false);
                }

                setLeagueData(league);
            } else {
                console.error("Failed to fetch draft data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching draft data:", error);
            addAlert("An error occurred while fetching draft data.", "error");
        } finally {
            setLoading(false);
        }
    };


    if (loading || leagueData === null) {
        return (
            <div className="w-full min-h-[70vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
            </div>
        )
    } else return (
        <div className="min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10">
            <h1 className={`text-4xl font-bold ${exo2.className}`}>League Settings</h1>
            <div className='grid grid-cols-3 gap-8 mt-10'>
                <div className='bg-[#32323226] rounded-xl shadow-lg p-6 flex flex-col space-y-4'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>LEAGUE</h2>
                    <p className='text-gray-400'>Edit your league's name and description.</p>
                    <div className='flex flex-col space-y-4'>
                        <input
                            type='text'
                            placeholder='League Name'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                        <textarea
                            placeholder='League Description'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                    </div>
                </div>
                <div className='bg-[#1C1C1C] rounded-xl shadow-lg p-6 flex flex-col space-y-4'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>League Info</h2>
                    <p className='text-gray-400'>Edit your league's name and description.</p>
                    <div className='flex flex-col space-y-4'>
                        <input
                            type='text'
                            placeholder='League Name'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                        <textarea
                            placeholder='League Description'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                    </div>
                </div>
                <div className='bg-[#1C1C1C] rounded-xl shadow-lg p-6 flex flex-col space-y-4'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>TEAM</h2>
                    <p className='text-gray-400'>Edit your league's name and description.</p>
                    <div className='flex flex-col space-y-4'>
                        <input
                            type='text'
                            placeholder='League Name'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                        <textarea
                            placeholder='League Description'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default LeagueSettings