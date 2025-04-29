'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAlert } from '@/components/AlertContext/AlertContext';

import { Exo_2 } from 'next/font/google';
import Image from 'next/image';
import { FaEdit, FaRegCopy } from 'react-icons/fa';


const exo2 = Exo_2({
    weight: ['400', '500', '600', '700', '800'],
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
    const [saving, setSaving] = useState(false);
    const [gameweek, setGameweek] = useState(null);



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
                console.log("User: ", userData);
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

    useEffect(() => {
        const fetchCurrentGameweek = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}gameweek/current`);
                if (res.data && res.data.error) {
                    console.error("Error fetching current gameweek:", res.data.message);
                    addAlert("Unable to fetch current gameweek.", "error");
                    return;
                }
                console.log("Current Gameweek Response: ", res.data.data);
                const current = res.data?.data?.name;
                setGameweek(current);
                console.log("Current Gameweek: ", current);
            } catch (err) {
                console.error("Error fetching current gameweek:", err);
                addAlert("Unable to fetch current gameweek.", "error");
            }
        };

        fetchCurrentGameweek();
    }, []);



    const handleEditClick = async () => {
        setIsEditing(true);
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.type !== "image/png") {
            addAlert("Only PNG images are allowed.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setLeagueData({
                ...leagueData,
                league_image_path: reader.result, // This is the Base64-encoded image
            });
        };

        reader.readAsDataURL(file);
    };

    const handleSaveClick = async () => {
        // setLoading(true);
        try {
            // console.log("editData");    
            // console.log(editData);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague/edit`, {
                leagueData: leagueData
            });
            if (response.data && !response.data.error) {
                setLeagueData(response.data.data);
                console.log("League settings saved successfully:", response.data.data);
                addAlert("League settings saved successfully.", "success");
                setIsEditing(false);
            } else {
                console.error("Failed to save League data:", response.data.message);
                addAlert("Unable to edit League settings. Please try again later", "error");
                setIsEditing(false);
            }
            // setLoading(false);
        } catch (error) {
            console.error("Error saving League data:", error);
            // setLoading(false);
            setIsEditing(false);
        }
    };

    const fetchLeagueData = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague?leagueId=${leagueID}`
            );
            if (response.data && !response.data.error) {
                console.log("leagueData: ", response.data.data);
                const league = response.data.data;

                // Check if the logged-in user is part of the league's teams
                const isUserPartOfLeague = league.teams.some(
                    (team) => team.user_email === user.email
                );
                if (!isUserPartOfLeague) {
                    // Redirect the user to the dashboard if they are not part of the league
                    addAlert("You are not a part of this league.", "error");
                    // router.push("/dashboard");
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


    if (loading || leagueData === null || gameweek === null) {
        return (
            <div className="w-full min-h-[70vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
            </div>
        )
    } else return (
        <div className="min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10">
            <div className='flex justify-between items-center'>
                <h1 className={`text-4xl font-bold ${exo2.className}`}>League Settings</h1>
                {isCreator && (
                    <div className="flex justify-end">
                        {isEditing ? (
                            <button
                                className="fade-gradient px-12 py-2 rounded-3xl "
                                onClick={handleSaveClick}
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                className="fade-gradient px-12 py-2 rounded-3xl "
                                onClick={handleEditClick}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className={`flex flex-col mt-6 ${exo2.className}`}>
                {/* League Info Section */}
                <div className='bg-[#0C1922] rounded-xl shadow-lg p-6'>
                    <div className='flex items-center justify-between'>
                        <div className='flex flex-col'>
                            <h2 className={`text-2xl font-bold ${exo2.className}`}>LEAGUE DETAILS</h2>
                            <p className='text-gray-400'>Manage your league settings.</p>
                        </div>
                        <div className='flex items-center gap-4'>
                            <label className='block text-gray-300'>Invite Code:</label>
                            <div className={`w-40 cursor-none relative px-4 py-2 rounded-lg text-white bg-[#091218] focus:outline-none focus:border-[#FF8A00] border border-[#333333]`} >
                                {leagueData?.invite_code}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(leagueData?.invite_code || '');
                                        addAlert("Invite code copied to clipboard!", "success");
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-[#FF8A00] transition"
                                >
                                    <FaRegCopy className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-12 w-full items-center justify-between p-6 '>
                        <div className={`w-40 h-40 relative rounded-lg ${isEditing && 'border border-[#333333]'}`}>
                            {leagueData.league_image_path ? (
                                <Image
                                    src={leagueData.league_image_path}
                                    alt='League Logo'
                                    layout='fill'
                                    className='rounded-md object-contain '
                                />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 rounded-full'>No Image</div>
                            )}
                            {/* Edit Icon - Shown Only in Editing Mode */}
                            {isEditing && (
                                <>
                                    <label htmlFor="imageUpload" className="absolute top-2 right-2 bg-[#FF8A00] p-2 rounded-full cursor-pointer shadow-md hover:bg-[#ff7A00] transition">
                                        <FaEdit className="text-white text-lg" />
                                    </label>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        accept="image/png"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e)}
                                    />
                                </>
                            )}
                        </div>
                        <div className='grid grid-cols-2 gap-12 w-[85%]'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <label className='block w-1/4 text-gray-300'>League Name: </label>
                                    <input
                                        type='text'
                                        value={leagueData.league_name || ''}
                                        onChange={(e) => setLeagueData({ ...leagueData, league_name: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-3/4 bg-transparent px-4 py-2 rounded-lg text-white ${isEditing && 'focus:outline-none focus:border-[#FF8A00] border border-[#333333]'}`}
                                    />
                                </div>
                                <div className='flex items-center gap-4'>
                                    <label className='block w-1/4 text-gray-300'>Minimum Teams:</label>
                                    <input
                                        type='Number'
                                        value={leagueData.min_teams || ''}
                                        onChange={(e) => setLeagueData({ ...leagueData, min_teams: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-3/4 bg-transparent px-4 py-2 rounded-lg text-white ${isEditing && 'focus:outline-none focus:border-[#FF8A00] border border-[#333333]'}`}
                                    />
                                </div>
                                <div className='flex items-center gap-4'>
                                    <label className='block w-1/4 text-gray-300'>Maximum Teams:</label>
                                    <input
                                        type='Number'
                                        value={leagueData.max_teams || ''}
                                        onChange={(e) => setLeagueData({ ...leagueData, max_teams: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-3/4 bg-transparent px-4 py-2 rounded-lg text-white ${isEditing && 'focus:outline-none focus:border-[#FF8A00] border border-[#333333]'}`}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <label className='block w-1/4 text-gray-300'>Format: </label>
                                    <input
                                        type='text'
                                        value={leagueData.league_configuration?.format || ''}
                                        disabled
                                        className={`w-3/4 px-4 py-2 rounded-lg text-white ${isEditing ? 'bg-[#091218] focus:outline-none focus:border-[#FF8A00] border border-[#333333]' : 'bg-transparent'}`}
                                    />
                                </div>
                                <div className='flex items-center gap-4'>
                                    <label className='block w-1/4 text-gray-300'>League Creator:</label>
                                    <input
                                        type='text'
                                        value={leagueData.creator || ''}
                                        disabled
                                        className={`w-3/4 px-4 py-2 rounded-lg text-white ${isEditing ? 'bg-[#091218] focus:outline-none focus:border-[#FF8A00] border border-[#333333]' : 'bg-transparent'}`}
                                    />
                                </div>
                                <div className='flex items-center gap-4'>
                                    <label className='block w-1/4 text-gray-300'>Payment Status:</label>
                                    <div className={`w-3/4 px-4 py-2 rounded-lg font-semibold ${leagueData.paid ? 'text-green-400' : 'text-red-500'}`}>{leagueData.paid ? 'Paid' : 'Unpaid'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Points Configuration Section */}
                <div className='bg-[#0C1922] rounded-xl shadow-lg p-6 mt-6'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>POINTS CONFIGURATION</h2>
                    <p className='text-gray-400'>Manage points settings for various actions.</p>

                    <div className='grid grid-cols-4 gap-12 w-full p-6'>

                        {/* Column 1 */}
                        <div className='flex flex-col gap-4'>
                            {[
                                { label: "Goals", key: "goals" },
                                { label: "Assists", key: "assists" },
                                { label: "Minutes Played", key: "minutes-played" },
                                { label: "Bonus", key: "bonus" }
                            ].map(({ label, key }) => (
                                <div className='flex items-center gap-4' key={key}>
                                    <label className='block w-2/3 text-gray-300'>{label}:</label>
                                    <input
                                        type='number'
                                        step="0.1"
                                        value={leagueData.points_configuration?.[gameweek]?.[key] || ''}
                                        onChange={(e) => {
                                            const updatedPointsConfig = [...leagueData.points_configuration]; // Create a shallow copy of the array
                                            updatedPointsConfig[gameweek] = { // Modify the first object in the array
                                                ...updatedPointsConfig[gameweek],
                                                [key]: parseFloat(e.target.value) // Update the specific key
                                            };

                                            setLeagueData({
                                                ...leagueData,
                                                points_configuration: updatedPointsConfig // Update the state with the new array
                                            });
                                        }}
                                        disabled={!isEditing}
                                        className={`w-1/3 bg-transparent pl-2 py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Column 2 */}
                        <div className='flex flex-col gap-4'>
                            {[
                                { label: "Goals Conceded", key: "goals-conceded" },
                                { label: "Clean Sheet", key: "clean-sheet" },
                                { label: "Saves", key: "saves" }
                            ].map(({ label, key }) => (
                                <div className='flex items-center gap-4' key={key}>
                                    <label className='block w-2/3 text-gray-300'>{label}:</label>
                                    <input
                                        type='number'
                                        step="0.1"
                                        value={leagueData.points_configuration?.[gameweek]?.[key] || ''}
                                        onChange={(e) => {
                                            const updatedPointsConfig = [...leagueData.points_configuration]; // Create a shallow copy of the array
                                            updatedPointsConfig[gameweek] = { // Modify the first object in the array
                                                ...updatedPointsConfig[gameweek],
                                                [key]: parseFloat(e.target.value) // Update the specific key
                                            };

                                            setLeagueData({
                                                ...leagueData,
                                                points_configuration: updatedPointsConfig // Update the state with the new array
                                            });
                                        }}
                                        disabled={!isEditing}
                                        className={`w-1/3 bg-transparent pl-2 py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Column 3 */}
                        <div className='flex flex-col gap-4'>
                            {[
                                { label: "Penalty Save", key: "penalty_save" },
                                { label: "Penalty Miss", key: "penalty_miss" },
                                { label: "Interceptions", key: "interceptions" }
                            ].map(({ label, key }) => (
                                <div className='flex items-center gap-4' key={key}>
                                    <label className='block w-2/3 text-gray-300'>{label}:</label>
                                    <input
                                        type='number'
                                        step="0.1"
                                        value={leagueData.points_configuration?.[gameweek]?.[key] || ''}
                                        onChange={(e) => {
                                            const updatedPointsConfig = [...leagueData.points_configuration]; // Create a shallow copy of the array
                                            updatedPointsConfig[gameweek] = { // Modify the first object in the array
                                                ...updatedPointsConfig[gameweek],
                                                [key]: parseFloat(e.target.value) // Update the specific key
                                            };

                                            setLeagueData({
                                                ...leagueData,
                                                points_configuration: updatedPointsConfig // Update the state with the new array
                                            });
                                        }}
                                        disabled={!isEditing}
                                        className={`w-1/3 bg-transparent pl-2 py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Column 4 */}
                        <div className='flex flex-col gap-4'>
                            {[
                                { label: "Yellow Cards", key: "yellowcards" },
                                { label: "Red Cards", key: "redcards" },
                                { label: "Tackles", key: "tackles" },
                            ].map(({ label, key }) => (
                                <div className='flex items-center gap-4' key={key}>
                                    <label className='block w-2/3 text-gray-300'>{label}:</label>
                                    <input
                                        type='number'
                                        step="0.1"
                                        value={leagueData.points_configuration?.[gameweek]?.[key] || ''}
                                        onChange={(e) => {
                                            const updatedPointsConfig = [...leagueData.points_configuration]; // Create a shallow copy of the array
                                            updatedPointsConfig[gameweek] = { // Modify the first object in the array
                                                ...updatedPointsConfig[gameweek],
                                                [key]: parseFloat(e.target.value) // Update the specific key
                                            };

                                            setLeagueData({
                                                ...leagueData,
                                                points_configuration: updatedPointsConfig // Update the state with the new array
                                            });
                                        }}
                                        disabled={!isEditing}
                                        className={`w-1/3 bg-transparent pl-2 py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className='text-gray-400 text-sm'>Note: All changes in Points will be applied from the next gameweek.</p>
                </div>

            </div>
        </div>
    )
}

export default LeagueSettings