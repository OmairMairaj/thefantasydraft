'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    // const [editData, setEditData] = useState(null);
    // const [saving, setSaving] = useState(false);
    const [gameweek, setGameweek] = useState(null);
    const [finalTable, setFinalTable] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [inputLeagueName, setInputLeagueName] = useState("");
    const [inputError, setInputError] = useState(false);
    const [isMdOnly, setIsMdOnly] = useState(false);

    const [showRemovePopup, setShowRemovePopup] = useState(false);
    const [showLeavePopup, setShowLeavePopup] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [removeConfirmInput, setRemoveConfirmInput] = useState("");
    const [leaveConfirmInput, setLeaveConfirmInput] = useState("");

    // selected team to remove (admin modal)
    const [selectedRemoveTeamId, setSelectedRemoveTeamId] = useState(null);

    // anti double-click locks
    const removeLockRef = useRef(false);
    const leaveLockRef = useRef(false);

    // convenience flags
    const draftState = leagueData?.draftID?.state;
    const canModifyTeams = draftState === "Manual" || draftState === "Scheduled";

    // helpers to get id/name safely (leagueData.teams may be populated or just IDs)
    const getTeamId = (t) => t?.team?._id ?? t?.team;
    const getTeamName = (t) => t?.team?.team_name ?? "(Unnamed Team)";
    const getTeamEmail = (t) => t?.user_email ?? "";

    // lists
    const teamsAll = leagueData?.teams ?? [];
    const teamsRemovable = teamsAll.filter(t => getTeamEmail(t) !== leagueData?.creator); // backend also blocks admin removal

    // my team (for leave modal)
    const myTeamEntry = teamsAll.find(t => getTeamEmail(t) === user?.email);
    const myTeamId = getTeamId(myTeamEntry);
    const myTeamName = getTeamName(myTeamEntry);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMdOnly(width >= 768 && width < 1024);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);


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


    const normalizePointsCfg = (cfgArr) =>
        cfgArr.map(cfg => {
            const out = { ...cfg };
            Object.keys(out).forEach(k => {
                if (k === 'gameweek' || k === '_id') return;
                const raw = out[k];
                if (raw === '' || raw == null) out[k] = 0;
                else {
                    const num = Number(raw);
                    out[k] = Number.isNaN(num) ? 0 : num;
                }
            });
            return out;
        });

    const handleSaveClick = async () => {
        // setLoading(true);
        try {
            // console.log("editData");    
            // console.log(editData);
            const payload = {
                ...leagueData,
                points_configuration: normalizePointsCfg(leagueData.points_configuration),
            };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyleague/edit`, {
                leagueData: payload
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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyleague?leagueId=${leagueID}`
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

    useEffect(() => {
        if (leagueData && gameweek) {
            const table = generatePointsTable(leagueData?.points_configuration, gameweek);
            console.log("✅ Points Table Recalculated");
            console.log("Points Table: ", table);
            setFinalTable(table);
        }
    }, [leagueData, gameweek]);

    const generatePointsTable = (pointsConfig, gameweek) => {
        const gwPoints = pointsConfig?.find(p => Number(p.gameweek) === Number(gameweek));
        if (!gwPoints) return [];
        console.log("Current Gameweek: ", gameweek);
        console.log("Current Gameweek Points: ", gwPoints);

        // Define which stat affects which positions
        const statMap = {
            'goals': ['GK', 'DEF', 'MID', 'FWD'],
            'assists': ['GK', 'DEF', 'MID', 'FWD'],
            'clean-sheet': ['GK', 'DEF'],
            'penalty_save': ['GK'],
            'saves': ['GK'],
            'goals-conceded': ['GK', 'DEF'],
            'redcards': ['GK', 'DEF', 'MID', 'FWD'],
            'yellowcards': ['GK', 'DEF', 'MID', 'FWD'],
            'bonus': ['GK', 'DEF', 'MID', 'FWD'],
            'minutes-played': ['GK', 'DEF', 'MID', 'FWD'],
            'interceptions': ['GK', 'DEF', 'MID'],
            'tackles': ['DEF', 'MID'],
            'penalty_miss': ['MID', 'FWD'],
        };

        const positions = ['GK', 'DEF', 'MID', 'FWD'];
        const finalTable = [];

        for (const stat in gwPoints) {
            if (['gameweek', '_id'].includes(stat)) continue;

            const row = {
                stat,
                GK: '--',
                DEF: '--',
                MID: '--',
                FWD: '--'
            };

            const value = gwPoints[stat];
            const appliesTo = statMap[stat];
            if (appliesTo) {
                appliesTo.forEach(pos => {
                    row[pos] = value;
                });
            }

            finalTable.push(row);
        }

        console.log("Final Points Table: ", finalTable);

        return finalTable;
    };


    const handleDeleteLeague = async () => {
        console.log("Attempting to delete league:", leagueData?.league_name.length);
        console.log("Input League Name:", inputLeagueName.length);
        console.log("C", inputError);
        if (!inputLeagueName) {
            setInputError(true);
            return;
        }

        if (inputLeagueName !== leagueData?.league_name) {
            setInputError(true);
            return;
        }
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyleague?leagueId=${leagueData?._id}`
            );

            if (response.data && !response.data.error) {
                addAlert("League deleted successfully.", "success");
                console.log("League deleted successfully");
                setShowDeletePopup(false);
                router.push('/dashboard');
            } else {
                addAlert(response.data.message || "Failed to delete league.", "error");
                console.error("Error deleting league:", response.data.message);
            }
        } catch (error) {
            console.error("Error deleting league:", error);
            addAlert("An unexpected error occurred while deleting the league.", "error");
        }
    };

    const handleDeleteInputChange = (e) => {
        setInputLeagueName(e.target.value);
        setInputError(false);
        console.log("B", inputError);
    };

    useEffect(() => {
        if (showDeletePopup || showRemovePopup || showLeavePopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showDeletePopup, showRemovePopup, showLeavePopup]);

    useEffect(() => {
        if (showRemovePopup) {
            setSelectedRemoveTeamId(prev => prev ?? (teamsRemovable[0] ? getTeamId(teamsRemovable[0]) : null));
        }
    }, [showRemovePopup, teamsRemovable]);


    const handleRemoveTeam = async () => {
        if (!canModifyTeams) {
            addAlert("You can only remove teams before the draft starts.", "error");
            return;
        }
        if (!selectedRemoveTeamId) {
            addAlert("Please select a team to remove.", "error");
            return;
        }
        if (removeLockRef.current) return;
        removeLockRef.current = true;
        setRemoveLoading(true);
        try {
            const URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyteam/remove`;
            const payload = { teamID: selectedRemoveTeamId, leagueID: leagueData?._id };
            const res = await axios.post(URL, payload);
            if (res.data?.error) {
                addAlert(res.data?.message || "Could not remove team.", "error");
            } else {
                addAlert("Team removed from league.", "success");
                setShowRemovePopup(false);
                setRemoveConfirmInput("");
                // refresh data
                await fetchLeagueData();
            }
        } catch (e) {
            console.error(e);
            addAlert("Unexpected error removing team.", "error");
        } finally {
            setRemoveLoading(false);
            removeLockRef.current = false;
        }
    };

    const handleLeaveLeague = async () => {
        if (!canModifyTeams) {
            addAlert("You can only leave the league before the draft starts.", "error");
            return;
        }
        if (!myTeamId) {
            addAlert("Your team was not found in this league.", "error");
            return;
        }
        if (leaveLockRef.current) return;
        leaveLockRef.current = true;
        setLeaveLoading(true);
        try {
            const URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyteam/remove`;
            const payload = { teamID: myTeamId, leagueID: leagueData?._id };
            const res = await axios.post(URL, payload);
            if (res.data?.error) {
                addAlert(res.data?.message || "Could not leave league.", "error");
            } else {
                addAlert("You left the league.", "success");
                setShowLeavePopup(false);
                setLeaveConfirmInput("");
                // send user back to dashboard
                router.push("/dashboard");
            }
        } catch (e) {
            console.error(e);
            addAlert("Unexpected error leaving the league.", "error");
        } finally {
            setLeaveLoading(false);
            leaveLockRef.current = false;
        }
    };


    // Normalize the current GW to a number (your API returns a string sometimes)
    const currGwNum = Number(gameweek ?? 0);

    // Object for the current GW (so inputs can read from it)
    const gwCfg =
        leagueData?.points_configuration?.find(
            (p) => Number(p.gameweek) === currGwNum
        ) || {};

    // Update one stat for current + all upcoming gameweeks
    const updatePointsConfiguration = (key, rawValue) => {
        setLeagueData((prev) => {
            if (!prev?.points_configuration) return prev;

            const next = prev.points_configuration.map((cfg) => {
                const gwNum = Number(cfg.gameweek);
                if (gwNum >= currGwNum) {
                    return { ...cfg, [key]: rawValue };
                }
                return cfg;
            });

            return { ...prev, points_configuration: next };
        });
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
                <h1 className={`text-2xl md:text-3xl xl:text-4xl font-bold ${exo2.className}`}>League Settings</h1>
                {isCreator && (
                    <div className="flex justify-end">
                        {isEditing ? (
                            <button
                                className="fade-gradient rounded-3xl px-8 sm:px-10 xl:px-12 py-1 md:py-2 text-sm xl:text-base "
                                onClick={handleSaveClick}
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                className="fade-gradient rounded-3xl px-8 sm:px-10 xl:px-12 py-1 md:py-2 text-sm xl:text-base "
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
                <div className='bg-[#0C1922] rounded-xl shadow-lg p-4 md:p-6'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <div className='flex flex-col'>
                            <h2 className={`text-lg md:text-xl xl:text-2xl font-bold ${exo2.className}`}>LEAGUE DETAILS</h2>
                            <p className='text-sm xl:text-base text-gray-400'>Manage your league settings.</p>
                        </div>
                        {isCreator &&
                            <div className='flex items-center gap-4 text-sm xl:text-base'>
                                <label className='block text-sm xl:text-base text-gray-300'>Invite Code:</label>
                                <div className={`w-40 cursor-default relative px-4 py-1 md:py-2 rounded-lg text-white bg-[#091218] focus:outline-none focus:border-[#FF8A00] border border-[#333333]`} >
                                    {leagueData?.invite_code}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(leagueData?.invite_code || '');
                                            addAlert("Invite code copied to clipboard!", "success");
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-[#FF8A00] transition"
                                    >
                                        <FaRegCopy className="text-base md:text-lg" />
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                    <div className='flex flex-col md:flex-row gap-4 xl:gap-12 w-full md:items-center justify-between p-0 xl:p-6 mt-4 '>
                        <div className={`w-28 h-28 xl:w-40 xl:h-40 relative rounded-lg ${isEditing && 'border border-[#333333]'}`}>
                            <Image
                                src={leagueData.league_image_path ? leagueData.league_image_path : "/images/default_team_logo.png"}
                                alt='League Logo'
                                fill
                                className='rounded-md object-cover '
                            />
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
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-12 w-full md:w-[85%]'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex text-sm xl:text-base items-center gap-4'>
                                    <label className='block w-2/5 text-gray-300'>{isMdOnly ? 'League:' : 'League Name:'}</label>
                                    <input
                                        type='text'
                                        value={leagueData.league_name || ''}
                                        onChange={(e) => setLeagueData({ ...leagueData, league_name: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-3/5 md:w-3/4 bg-transparent px-4 py-2 rounded-lg text-white ${isEditing && 'focus:outline-none focus:border-[#FF8A00] border border-[#333333]'}`}
                                    />
                                </div>
                                <div className='flex text-sm xl:text-base items-center gap-4'>
                                    <label className='block w-2/5 text-gray-300'>{isMdOnly ? 'Min Teams:' : 'Minimum Teams:'}</label>
                                    <input
                                        type='Number'
                                        value={leagueData.min_teams || ''}
                                        onChange={(e) => setLeagueData({ ...leagueData, min_teams: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-3/5 md:w-3/4 bg-transparent px-4 py-2 rounded-lg text-white ${isEditing && 'focus:outline-none focus:border-[#FF8A00] border border-[#333333]'}`}
                                    />
                                </div>
                                <div className='flex text-sm xl:text-base items-center gap-4'>
                                    <label className='block w-2/5 text-gray-300'>{isMdOnly ? 'Max Teams:' : 'Maximum Teams:'}</label>
                                    <input
                                        type='Number'
                                        value={leagueData.max_teams || ''}
                                        onChange={(e) => setLeagueData({ ...leagueData, max_teams: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-3/5 md:w-3/4 bg-transparent px-4 py-2 rounded-lg text-white ${isEditing && 'focus:outline-none focus:border-[#FF8A00] border border-[#333333]'}`}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='flex text-sm xl:text-base items-center gap-4'>
                                    <label className='block w-2/5 text-gray-300'>Format: </label>
                                    <input
                                        type='text'
                                        value={leagueData.league_configuration?.format || ''}
                                        disabled
                                        className={`w-3/5 md:w-3/4 px-4 py-2 rounded-lg text-white ${isEditing ? 'bg-[#091218] focus:outline-none focus:border-[#FF8A00] border border-[#333333]' : 'bg-transparent'}`}
                                    />
                                </div>
                                <div className='flex text-sm xl:text-base items-center gap-4'>
                                    <label className='block w-2/5 text-gray-300'>{isMdOnly ? 'Creator:' : 'League Creator:'}</label>
                                    <input
                                        type='text'
                                        value={leagueData.creator || ''}
                                        disabled
                                        className={`w-3/5 md:w-3/4 pl-4 truncate py-2 rounded-lg text-white ${isEditing ? 'bg-[#091218] focus:outline-none focus:border-[#FF8A00] border border-[#333333]' : 'bg-transparent'}`}
                                    />
                                </div>
                                <div className='flex text-sm xl:text-base items-center gap-4'>
                                    <label className='block w-2/5 text-gray-300'>{isMdOnly ? 'Status:' : 'Payment Status:'}</label>
                                    <div className={`w-3/5 md:w-3/4 px-4 py-2 rounded-lg font-semibold ${leagueData.paid ? 'text-green-400' : 'text-red-500'}`}>{leagueData.paid ? 'Paid' : 'Unpaid'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Points Configuration Section */}
                <div className='bg-[#0C1922] rounded-xl shadow-lg p-4 md:p-6 mt-6'>
                    <h2 className={`text-lg md:text-xl xl:text-2xl font-bold ${exo2.className}`}>POINTS CONFIGURATION</h2>
                    <p className='text-sm xl:text-base text-gray-400'>Manage points settings for various actions.</p>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-x-6 xl:gap-12 w-full p-0 xl:p-6 mt-4 xl:mt-0 text-sm xl:text-base'>

                        {/* Column 1 */}
                        <div className='flex flex-col gap-2 xl:gap-4'>
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
                                        value={
                                            isEditing
                                                ? (gwCfg?.[key] ?? '')          // show '' while editing so backspace doesn't pop a 0
                                                : (gwCfg?.[key] ?? 0)           // when not editing, show actual number or 0
                                        }
                                        onChange={(e) => updatePointsConfiguration(key, e.target.value)}
                                        onBlur={(e) => {
                                            const v = e.target.value;
                                            if (v === '' || v === '.' || v === '-' || v === '-.') return; // let truly empty stay empty
                                            updatePointsConfiguration(key, String(Number(v))); // normalize '05' -> '5', '0.50' -> '0.5'
                                        }}
                                        disabled={!isEditing || leagueData?.draftID?.state === "In Process" || leagueData?.draftID?.state === "Ended"}
                                        className={`w-1/3 bg-transparent py-1 xl:py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Column 2 */}
                        <div className='flex flex-col gap-2 xl:gap-4'>
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
                                        value={
                                            isEditing
                                                ? (gwCfg?.[key] ?? '')          // show '' while editing so backspace doesn't pop a 0
                                                : (gwCfg?.[key] ?? 0)           // when not editing, show actual number or 0
                                        }
                                        onChange={(e) => updatePointsConfiguration(key, e.target.value)}
                                        onBlur={(e) => {
                                            const v = e.target.value;
                                            if (v === '' || v === '.' || v === '-' || v === '-.') return; // let truly empty stay empty
                                            updatePointsConfiguration(key, String(Number(v))); // normalize '05' -> '5', '0.50' -> '0.5'
                                        }}
                                        disabled={!isEditing || leagueData?.draftID?.state === "In Process" || leagueData?.draftID?.state === "Ended"}
                                        className={`w-1/3 bg-transparent py-1 xl:py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Column 3 */}
                        <div className='flex flex-col gap-2 xl:gap-4'>
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
                                        value={
                                            isEditing
                                                ? (gwCfg?.[key] ?? '')          // show '' while editing so backspace doesn't pop a 0
                                                : (gwCfg?.[key] ?? 0)           // when not editing, show actual number or 0
                                        }
                                        onChange={(e) => updatePointsConfiguration(key, e.target.value)}
                                        onBlur={(e) => {
                                            const v = e.target.value;
                                            if (v === '' || v === '.' || v === '-' || v === '-.') return; // let truly empty stay empty
                                            updatePointsConfiguration(key, String(Number(v))); // normalize '05' -> '5', '0.50' -> '0.5'
                                        }}
                                        disabled={!isEditing || leagueData?.draftID?.state === "In Process" || leagueData?.draftID?.state === "Ended"}
                                        className={`w-1/3 bg-transparent py-1 xl:py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Column 4 */}
                        <div className='flex flex-col gap-2 xl:gap-4'>
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
                                        value={
                                            isEditing
                                                ? (gwCfg?.[key] ?? '')          // show '' while editing so backspace doesn't pop a 0
                                                : (gwCfg?.[key] ?? 0)           // when not editing, show actual number or 0
                                        }
                                        onChange={(e) => updatePointsConfiguration(key, e.target.value)}
                                        onBlur={(e) => {
                                            const v = e.target.value;
                                            if (v === '' || v === '.' || v === '-' || v === '-.') return; // let truly empty stay empty
                                            updatePointsConfiguration(key, String(Number(v))); // normalize '05' -> '5', '0.50' -> '0.5'
                                        }}
                                        disabled={!isEditing || leagueData?.draftID?.state === "In Process" || leagueData?.draftID?.state === "Ended"}
                                        className={`w-1/3 bg-transparent py-1 xl:py-2 rounded-lg text-white border border-[#333333] text-center ${isEditing ? 'focus:outline-none focus:border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className='text-gray-400 text-xs xl:text-sm mt-4 xl:mt-0'>Note: Points configuration can not be changed after drafting.</p>
                </div>

                {/* Points Table */}
                <div className='bg-[#0C1922] rounded-xl shadow-lg pt-4 md:pt-6 mt-6 overflow-hidden'>
                    <h2 className={`text-lg md:text-xl xl:text-2xl pl-4 md:pl-6 font-bold ${exo2.className}`}>POINTS TABLE</h2>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 bg-[#03070A] mt-2 ${exo2.className}`}>
                        {[true, false].map((isPositive, index) => {
                            const filteredStats = finalTable.filter(row => {
                                const values = [row.GK, row.DEF, row.MID, row.FWD].map(Number);
                                // Keep only rows with at least one valid number
                                const numeric = values.filter(val => !isNaN(val));
                                if (numeric.length === 0) return false;
                                return isPositive ? numeric.some(val => val > 0) : numeric.some(val => val < 0);
                            });

                            return (
                                <div
                                    key={index}
                                    className="col-span-1 bg-[#0C1922] md:rounded-b-xl pb-6 shadow-lg"
                                >
                                    <table className="table-auto w-full text-left text-xs sm:text-sm xl:text-base">
                                        <thead className='bg-[#091218]'>
                                            <tr className='text-center'>
                                                <th className="p-2 border-b border-gray-700 text-left pl-6">Stat</th>
                                                <th className="p-2 border-b border-gray-700">GK</th>
                                                <th className="p-2 border-b border-gray-700">DEF</th>
                                                <th className="p-2 border-b border-gray-700">MID</th>
                                                <th className="p-2 border-b border-gray-700 pr-6">FWD</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-center text-gray-300">
                                            {filteredStats.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="p-2 border-b border-gray-700 text-left pl-6 capitalize">
                                                        {row.stat.replace(/_/g, " ")}
                                                    </td>
                                                    {['GK', 'DEF', 'MID', 'FWD'].map(pos => (
                                                        <td key={pos} className={`p-2 border-b border-gray-700 ${pos === 'FWD' ? 'pr-6' : ''}`}>
                                                            {typeof row[pos] === "number" ? row[pos] : '--'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row mt-6 items-center gap-2 sm:gap-4">
                    <h2 className={`text-lg md:text-xl xl:text-2xl font-bold text-[#FF8A00] ${exo2.className}`}>Actions</h2>
                    {/* <div className="flex gap-4 px-6 pb-6"> */}
                    {isCreator ? (
                        <div className='flex justify-center items-center gap-1 sm:gap-4'>
                            {/* Delete League */}
                            <button
                                className={`fade-gradient px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-xs sm:text-sm xl:text-base rounded-2xl transition duration-300 ${exo2.className}`}
                                onClick={() => setShowDeletePopup(true)}
                            >
                                DELETE LEAGUE
                            </button>

                            {/* Remove a Team (admin only) */}
                            <button
                                className={`bg-[#FF8A00] text-black px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-xs sm:text-sm xl:text-base rounded-2xl shadow-md transition duration-300 ${exo2.className} ${!canModifyTeams ? "opacity-60 cursor-not-allowed" : "hover:bg-[#FF8A00] hover:text-white hover:scale-105"}`}
                                onClick={() => {
                                    if (!canModifyTeams) { addAlert("You can only remove teams before the draft starts.", "error"); return; }
                                    setShowRemovePopup(true);
                                }}
                                disabled={!canModifyTeams}
                            >
                                REMOVE A TEAM
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Leave League (non-admin) */}
                            <button
                                className={` px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-2xl transition duration-300 ${exo2.className} ${!canModifyTeams ? "opacity-60 cursor-not-allowed fade-gradient-no-hover" : "fade-gradient"}`}
                                onClick={() => {
                                    if (!canModifyTeams) { addAlert("You can only leave before the draft starts.", "error"); return; }
                                    setShowLeavePopup(true);
                                }}
                                disabled={!canModifyTeams}
                            >
                                LEAVE LEAGUE
                            </button>
                        </>
                    )}
                    {/* </div> */}
                </div>
            </div>
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
                    <div className={`bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm p-6 rounded-xl shadow-md shadow-[#1f1f1f] text-center max-w-96 w-[90vw] ${exo2.className}`}>
                        <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4">Delete League</h2>
                        <p className="text-sm xl:text-base mb-4 text-gray-300 mx-2 sm:mx-6">
                            Are you sure you want to delete this league? This will remove all <strong className='text-white'>teams</strong>, <strong className='text-white'>draft data</strong>, and related information.
                        </p>
                        <p className="text-sm xl:text-base mb-4 text-gray-400">
                            Type <span className="font-bold text-white">{leagueData?.league_name}</span> to confirm:
                        </p>
                        <input
                            type="text"
                            value={inputLeagueName}
                            onChange={handleDeleteInputChange}
                            className={`w-full p-1 md:p-2 bg-[#1b3546] text-white rounded-lg mb-1 text-center text-sm xl:text-base focus:placeholder-transparent focus:outline-none  ${inputError ? "border border-[#832626]" : "focus:ring-1 focus:ring-[#425460]"}`}
                            placeholder="Enter league name"
                        />
                        {inputError && <p className="text-sm xl:text-base text-[#ca3c3c] mb-1">League name does not match.</p>}
                        <div className="flex justify-between mt-4">
                            <button
                                className={`px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md ${!inputLeagueName ? "fade-gradient-no-hover opacity-50 cursor-not-allowed" : "fade-gradient"}`}
                                onClick={handleDeleteLeague}
                                disabled={!inputLeagueName}
                            >
                                Yes, I'm sure
                            </button>
                            <button
                                className="fade-gradient px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md"
                                onClick={() => {
                                    setShowDeletePopup(false);
                                    setInputLeagueName("");
                                    setInputError(false);
                                    console.log("A", inputError);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showRemovePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm p-6 rounded-xl shadow-md shadow-[#1f1f1f] text-center max-w-[28rem] w-[90vw] ${exo2.className}`}>
                        <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4">Remove a Team</h2>
                        {teamsRemovable.length === 0 ? (
                            <p className="text-sm xl:text-base text-gray-300 mb-4">No removable teams found.</p>
                        ) : (
                            <>
                                <div className="text-left text-sm xl:text-base mb-3">
                                    <label className="text-gray-300">Select team to remove</label>
                                    <select
                                        className="mt-1 w-full p-2 bg-[#1b3546] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#425460]"
                                        value={selectedRemoveTeamId ?? ""}
                                        onChange={(e) => setSelectedRemoveTeamId(e.target.value)}
                                    >
                                        {teamsRemovable.map((t) => (
                                            <option key={getTeamId(t)} value={getTeamId(t)}>
                                                {getTeamName(t)} — {getTeamEmail(t)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <p className="text-xs xl:text-sm text-gray-400 mb-2">
                                    Type the team name to confirm removal.
                                </p>
                                <input
                                    type="text"
                                    value={removeConfirmInput}
                                    onChange={(e) => setRemoveConfirmInput(e.target.value)}
                                    placeholder="Type the exact team name"
                                    className="w-full p-2 bg-[#1b3546] text-white rounded-lg mb-1 text-center focus:outline-none focus:ring-1 focus:ring-[#425460]"
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        className={`px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md ${(!selectedRemoveTeamId || removeConfirmInput !== (getTeamName(teamsRemovable.find(t => getTeamId(t) === selectedRemoveTeamId)) ?? "")) || removeLoading
                                            ? "fade-gradient-no-hover opacity-50 cursor-not-allowed"
                                            : "fade-gradient"
                                            }`}
                                        onClick={handleRemoveTeam}
                                        disabled={
                                            !selectedRemoveTeamId ||
                                            removeConfirmInput !== (getTeamName(teamsRemovable.find(t => getTeamId(t) === selectedRemoveTeamId)) ?? "") ||
                                            removeLoading
                                        }
                                    >
                                        {removeLoading ? "Removing..." : "Remove Team"}
                                    </button>
                                    <button
                                        className="fade-gradient px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md"
                                        onClick={() => {
                                            setShowRemovePopup(false);
                                            setRemoveConfirmInput("");
                                            setSelectedRemoveTeamId(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {showLeavePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm p-6 rounded-xl shadow-md shadow-[#1f1f1f] text-center max-w-[28rem] w-[90vw] ${exo2.className}`}>
                        <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4">Leave League</h2>
                        <p className="text-sm xl:text-base text-gray-300 mb-2">
                            You’re about to leave <span className="text-white font-semibold">{leagueData?.league_name}</span>.
                        </p>
                        <p className="text-xs xl:text-sm text-gray-400 mb-4">
                            This will remove your team <span className="text-white font-semibold">{myTeamName}</span> from the league.
                        </p>
                        <p className="text-xs xl:text-sm text-gray-400 mb-2">Type <span className="text-white font-semibold">LEAVE</span> to confirm.</p>
                        <input
                            type="text"
                            value={leaveConfirmInput}
                            onChange={(e) => setLeaveConfirmInput(e.target.value)}
                            placeholder="LEAVE"
                            className="w-full p-2 bg-[#1b3546] text-white rounded-lg mb-1 text-center focus:outline-none focus:ring-1 focus:ring-[#425460]"
                        />
                        <div className="flex justify-between mt-4">
                            <button
                                className={`px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md ${leaveConfirmInput !== "LEAVE" || leaveLoading
                                    ? "fade-gradient-no-hover opacity-50 cursor-not-allowed"
                                    : "fade-gradient"
                                    }`}
                                onClick={handleLeaveLeague}
                                disabled={leaveConfirmInput !== "LEAVE" || leaveLoading}
                            >
                                {leaveLoading ? "Leaving..." : "Leave League"}
                            </button>
                            <button
                                className="fade-gradient px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md"
                                onClick={() => {
                                    setShowLeavePopup(false);
                                    setLeaveConfirmInput("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeagueSettings