'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Exo_2 } from 'next/font/google';
import { useAlert } from '@/components/AlertContext/AlertContext';
import { useRouter } from 'next/navigation';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const DraftSettings = ({ draftID, user, onBack }) => {
    const [draftData, setDraftData] = useState(null);
    const [gameweek, setGameweek] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [originalStartDate, setOriginalStartDate] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [inputLeagueName, setInputLeagueName] = useState("");
    // const [finalTable, setFinalTable] = useState([]);
    const [inputError, setInputError] = useState(false);
    const { addAlert } = useAlert();
    const router = useRouter();

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

    useEffect(() => {
        const fetchDraftData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft?draftID=${draftID}`
                );
                if (response.data && !response.data.error) {
                    setDraftData(response.data.data);
                    // console.log(response.data.data);
                    // Check if the current user is the creator of the league
                    if (response.data.data.creator === user.email) {
                        setIsCreator(true);
                    } else {
                        setIsCreator(false);
                    }
                    console.log("Draft data fetched successfully:", response.data.data);
                } else {
                    console.error("Failed to fetch draft data:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching draft data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDraftData();
    }, []);

    useEffect(() => {
        if (draftData) {
            setEditData({ ...draftData }); // Clone the data for editing
            console.log("Draft Data set for editing");
        }
    }, [draftData]);

    // useEffect(() => {
    //     if (draftData && gameweek) {
    //         const table = generatePointsTable(draftData?.leagueID?.points_configuration, gameweek);
    //         console.log("✅ Points Table Recalculated");
    //         console.log("Points Table: ", table);
    //         setFinalTable(table);
    //     }
    // }, [draftData, gameweek]);

    const handleEditClick = () => {
        setIsEditing(true);
        setEditData({ ...draftData });
    };

    const handleSaveClick = async () => {
        // setLoading(true);
        try {
            // Log lineup configurations for debugging
            console.log("Lineup configurations:", editData?.lineup_configurations);

            // Calculate the sum of lineup configurations
            const lineupSum = Object.values(editData?.lineup_configurations || {}).reduce((acc, curr) => {
                if (isNaN(Number(curr))) {
                    console.error("Invalid value detected:", curr);
                    return acc;
                }
                return acc + Number(curr);
            }, 0);

            const squadSum = Object.values(editData?.squad_configurations || {}).reduce((acc, curr) => {
                if (isNaN(Number(curr))) {
                    console.error("Invalid value detected:", curr);
                    return acc;
                }
                return acc + Number(curr);
            }, 0);

            console.log("Lineup sum:", lineupSum);
            console.log("Lineup players:", editData?.lineup_players);

            // Validate if the lineup sum is greater than lineup_players
            if (lineupSum > parseInt(editData?.lineup_players, 10)) {
                alert(
                    `The total lineup players in lineup configuration must be less than the specified lineup players (${editData?.lineup_players}).`
                );
                setLoading(false);
                return;
            }

            if (squadSum !== parseInt(editData?.squad_players, 10)) {
                alert(
                    `The total squad players in squad configuration must equal the specified squad players (${editData?.squad_players}).`
                );
                setLoading(false);
                return;
            }

            // console.log("editData");    
            // console.log(editData);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft/edit`, {
                draftData: editData
            });
            if (response.data && !response.data.error) {
                const updatedDraft = response.data.data;
                setDraftData(updatedDraft);
                addAlert("Draft settings saved successfully.", "success");
                setIsEditing(false);
                console.log("Draft settings saved successfully:", response.data.data);
            } else {
                console.error("Failed to save draft data:", response.data.message);
                addAlert("Unable to edit Draft settings. Please try again later", "error");
            }
            // setLoading(false);
        } catch (error) {
            console.error("Error saving draft data:", error);
            // setLoading(false);
        }
    };



    const handleInputChange = (field, value) => {
        setEditData((prev) => {
            // Handle state change
            if (field === "state") {
                if (value === "Manual") {
                    // Store the original start_date before clearing it
                    if (prev.start_date) {
                        setOriginalStartDate(prev.start_date);
                    }
                    return {
                        ...prev,
                        state: value,
                        start_date: null, // Clear start_date for Manual
                    };
                } else if (value === "Scheduled") {
                    // Restore the original start_date or use the current date
                    return {
                        ...prev,
                        state: value,
                        start_date: originalStartDate || draftData?.start_date || new Date(),
                    };
                }
            }

            // Handle other fields
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    // const handleDeleteLeague = async () => {
    //     if (!inputLeagueName) {
    //         setInputError(true);
    //         return;
    //     }

    //     if (inputLeagueName !== draftData?.leagueID?.league_name) {
    //         setInputError(true);
    //         return;
    //     }
    //     try {
    //         const response = await axios.delete(
    //             `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague?leagueId=${draftData?.leagueID?._id}`
    //         );

    //         if (response.data && !response.data.error) {
    //             addAlert("League deleted successfully.", "success");
    //             console.log("League deleted successfully");
    //             setShowDeletePopup(false);
    //             router.push('/dashboard');
    //         } else {
    //             addAlert(response.data.message || "Failed to delete league.", "error");
    //             console.error("Error deleting league:", response.data.message);
    //         }
    //     } catch (error) {
    //         console.error("Error deleting league:", error);
    //         addAlert("An unexpected error occurred while deleting the league.", "error");
    //     }
    // };

    // const handleDeleteInputChange = (e) => {
    //     setInputLeagueName(e.target.value);
    //     setInputError(false);
    // };

    // useEffect(() => {
    //     if (showDeletePopup) {
    //         document.body.style.overflow = 'hidden';
    //     } else {
    //         document.body.style.overflow = 'auto';
    //     }

    //     return () => {
    //         document.body.style.overflow = 'auto';
    //     };
    // }, [showDeletePopup]);

    // const generatePointsTable = (pointsConfig, gameweek) => {
    //     const gwPoints = pointsConfig?.find(p => p.gameweek === gameweek);
    //     if (!gwPoints) return [];
    //     console.log("Current Gameweek: ", gameweek);
    //     console.log("Current Gameweek Points: ", gwPoints);

    //     // Define which stat affects which positions
    //     const statMap = {
    //         'goals': ['GK', 'DEF', 'MID', 'FWD'],
    //         'assists': ['GK', 'DEF', 'MID', 'FWD'],
    //         'clean-sheet': ['GK', 'DEF'],
    //         'penalty_save': ['GK'],
    //         'saves': ['GK'],
    //         'goals-conceded': ['GK', 'DEF'],
    //         'redcards': ['GK', 'DEF', 'MID', 'FWD'],
    //         'yellowcards': ['GK', 'DEF', 'MID', 'FWD'],
    //         'bonus': ['GK', 'DEF', 'MID', 'FWD'],
    //         'minutes-played': ['GK', 'DEF', 'MID', 'FWD'],
    //         'interceptions': ['GK', 'DEF', 'MID'],
    //         'tackles': ['DEF', 'MID'],
    //         'penalty_miss': ['MID', 'FWD'],
    //     };

    //     const positions = ['GK', 'DEF', 'MID', 'FWD'];
    //     const finalTable = [];

    //     for (const stat in gwPoints) {
    //         if (['gameweek', '_id'].includes(stat)) continue;

    //         const row = {
    //             stat,
    //             GK: '--',
    //             DEF: '--',
    //             MID: '--',
    //             FWD: '--'
    //         };

    //         const value = gwPoints[stat];
    //         const appliesTo = statMap[stat];
    //         if (appliesTo) {
    //             appliesTo.forEach(pos => {
    //                 row[pos] = value;
    //             });
    //         }

    //         finalTable.push(row);
    //     }

    //     console.log("Final Points Table: ", finalTable);

    //     return finalTable;
    // };

    if (loading || !draftData || !gameweek) {
        return (
            <div className="w-full min-h-[70vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
            </div>
        )
    }
    return (
        <div className="min-h-[88vh] flex flex-col text-white relative">
            {/* {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
                    <div className={`bg-[#1c1c1c] p-6 rounded-xl shadow-md shadow-[#1f1f1f] text-center min-w-96 w-1/3 ${exo2.className}`}>
                        <h2 className="text-2xl font-bold text-[#FF8A00] mb-4">Delete League</h2>
                        <p className="mb-4 text-gray-300 mx-12">
                            Are you sure you want to delete this league? This will remove all <strong className='text-white'>teams</strong>, <strong className='text-white'>draft data</strong>, and related information.
                        </p>
                        <p className="mb-4 text-gray-400">
                            Type <span className="font-bold text-white">{draftData?.leagueID?.league_name}</span> to confirm:
                        </p>
                        <input
                            type="text"
                            value={inputLeagueName}
                            onChange={handleDeleteInputChange}
                            className={`w-full p-2 bg-[#2F2F2F] text-white rounded-lg mb-1 text-center 
                                ${inputError ? "border border-red-500" : "border-none"}
                            `}
                            placeholder="Enter league name"
                        />
                        {inputError && <p className="text-red-500 mb-1">League name does not match.</p>}
                        <div className="flex justify-between mt-4">
                            <button
                                className={` px-6 py-2 rounded-xl shadow-md ${!inputLeagueName ? "fade-gradient-no-hover opacity-50 cursor-not-allowed" : "fade-gradient"}`}
                                onClick={handleDeleteLeague}
                                disabled={!inputLeagueName}
                            >
                                Yes, I'm sure
                            </button>
                            <button
                                className="fade-gradient px-6 py-2 rounded-xl shadow-md"
                                onClick={() => {
                                    setShowDeletePopup(false);
                                    setInputLeagueName("");
                                    setInputError(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
            <div className='flex flex-col sm:flex-row justify-between mb-4'>
                <div className='flex items-center gap-4'>
                    <button
                        className={`hidden sm:flex items-center justify-center fade-gradient w-20 xl:w-28 px-4 py-2 bg-gray-300 rounded-xl text-sm xl:text-base ${exo2.className}`}
                        onClick={onBack}
                    >
                        Back
                    </button>
                    <div className='flex flex-col gap-0'>
                        <h1 className={`text-2xl xl:text-3xl font-bold ${exo2.className}`}>Draft Settings</h1>
                        {isCreator && (
                            <p className={`text-[10px] sm:text-xs lg:text-sm text-gray-400 items-center mr-3 ${exo2.className}`}> *Editing and removing teams is only available until the draft starts</p>
                        )}

                    </div>
                </div>
                <div className='flex justify-between mt-2 sm:mt-0'>
                    <button
                        className={`flex sm:hidden items-center justify-center fade-gradient w-20 xl:w-28 px-4 py-2 bg-gray-300 rounded-xl text-sm xl:text-base ${exo2.className}`}
                        onClick={onBack}
                    >
                        Back
                    </button>
                    {isCreator && (
                        <div className="flex justify-end items-center">
                            {draftData?.state === "Scheduled" || draftData?.state === "Manual" ?
                                isEditing ? (
                                    <button
                                        className={`fade-gradient w-20 xl:w-28 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-center text-sm xl:text-base ${exo2.className}`}
                                        onClick={handleSaveClick}
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        className={`fade-gradient w-20 xl:w-28 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-center text-sm xl:text-base ${exo2.className}`}
                                        onClick={handleEditClick}
                                    >
                                        Edit
                                    </button>
                                )
                                : null
                            }

                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-12 gap-2 lg:gap-4">
                {/* League Information */}
                <div className={`col-span-12 lg:col-span-6 bg-[#0c1922] rounded-lg py-6 px-4 sm:px-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4'>League Information</h2>
                    <div className='grid grid-cols-6 gap-4 '>
                        <div className='col-span-6 sm:col-span-2 flex items-center justify-center sm:justify-start'>
                            {/* <div className='>Logo:</div> */}
                            <img
                                src={draftData?.leagueID?.league_image_path ? draftData?.leagueID?.league_image_path : "/images/default_team_logo.png"}
                                alt="League Logo"
                                className="w-28 h-28 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-cover rounded-lg"
                            />
                        </div>
                        <div className='col-span-6 sm:col-span-4 space-y-1 text-sm xl:text-base'>
                            <div className='grid grid-cols-3'>
                                <div className='flex items-center'>Name:</div>
                                <div className='col-span-2 text-left p-1 flex items-center'> {draftData?.leagueID?.league_name || "Unknown"}</div>
                            </div>
                            <div className='grid grid-cols-3'>
                                <div className='flex items-center'>Min Teams:</div>
                                <div className='col-span-2 text-left p-1 flex items-center'> {draftData?.leagueID?.min_teams || "--"}</div>
                            </div>
                            <div className='grid grid-cols-3'>
                                <div className='flex items-center'>Max Teams:</div>
                                <div className='col-span-2 text-left p-1 flex items-center'> {draftData?.leagueID?.max_teams || "--"}</div>
                            </div>
                            <div className='grid grid-cols-3 truncate'>
                                <div className='flex items-center'>Creator:</div>
                                <div className='col-span-2 text-left p-1 flex items-center text-ellipsis'> {draftData?.creator || "Unknown"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Draft Settings */}
                <div className={`col-span-12 sm:col-span-6 bg-[#0c1922] rounded-lg space-y-1 py-6 px-4 sm:px-6 shadow-lg text-sm xl:text-base ${exo2.className}`}>
                    <h2 className='text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4'>Draft Settings</h2>
                    <div className='grid grid-cols-2 lg:grid-cols-5'>
                        <div className='lg:col-span-3 flex items-center'>Type:</div>
                        <div className='lg:col-span-2 text-left py-1 px-2 flex items-center'> {draftData?.type || "----"}</div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 ">
                        <div className="lg:col-span-3 flex items-center">State:</div>
                        {isEditing
                            && (draftData?.state === "Scheduled" || draftData?.state === "Manual")
                            ?
                            (
                                <div className="lg:col-span-2 text-left flex items-center">
                                    <select
                                        className="py-1 px-2 bg-[#1D374A] text-white rounded-md w-full focus:outline-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00] focus-visible:outline-none"
                                        value={editData?.state || ""}
                                        onChange={(e) => {
                                            handleInputChange("state", e.target.value);
                                            if (e.target.value === "Manual") {
                                                // Automatically set start_time to null when state is Manual
                                                handleInputChange("start_date", null);
                                            }
                                        }}
                                    >
                                        <option value="Manual">Manual</option>
                                        <option value="Scheduled">Scheduled</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="lg:col-span-2 text-left py-1 px-2 flex items-center">
                                    {draftData?.state || "Unknown"}
                                </div>
                            )
                        }
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-3 flex items-center">Start Time:</div>
                        {isEditing
                            && editData?.state === "Scheduled"
                            ?
                            (
                                <div className="lg:col-span-2 text-left flex items-center">
                                    <input
                                        type="datetime-local"
                                        className="py-1 px-2 bg-[#1D374A] text-white rounded-md w-full focus:outline-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00] focus-visible:outline-none"
                                        value={
                                            editData?.start_date
                                                ? new Date(new Date(editData.start_date).getTime() - new Date().getTimezoneOffset() * 60000)
                                                    .toISOString()
                                                    .slice(0, 16)
                                                : ""
                                        }
                                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                                        required // Ensures user must provide a start time
                                    />
                                </div>
                            ) : editData?.state === "Manual" ? (
                                <div className="lg:col-span-2 text-left py-1 px-2 flex items-center">
                                    Not Applicable
                                </div>
                            ) : (
                                <div className="lg:col-span-2 text-left py-1 px-2 flex items-center">
                                    {draftData?.start_date ? new Date(draftData.start_date).toLocaleString() : "None"}
                                </div>
                            )
                        }
                    </div>
                    <div className='grid grid-cols-2 lg:grid-cols-5'>
                        <div className='lg:col-span-3 flex items-center'>Seconds per Pick:</div>
                        {isEditing ?
                            (
                                <div className="lg:col-span-2 text-left flex items-center">
                                    <input
                                        type="number"
                                        min="30"
                                        step="15"
                                        className="py-1 px-2 bg-[#1D374A] text-white rounded-md w-full focus:outline-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00] focus-visible:outline-none"
                                        value={editData?.time_per_pick || ""}
                                        onChange={(e) => handleInputChange("time_per_pick", parseInt(e.target.value, 10))}
                                    />
                                </div>
                            ) : (
                                <div className="lg:col-span-2 text-left py-1 px-2 flex items-center">
                                    {draftData?.time_per_pick ? `${draftData.time_per_pick}s` : "--"}
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* Team Configurations */}
                <div className={`col-span-12 sm:col-span-6 lg:col-span-4 bg-[#0c1922] rounded-lg space-y-1 py-6 px-4 sm:px-6 shadow-lg text-sm xl:text-base ${exo2.className}`}>
                    <h2 className='text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4'>Team Configurations</h2>
                    {["max_players_per_club", "squad_players", "lineup_players", "bench_players"].map((field, index) => (
                        <div key={index} className="grid grid-cols-2 lg:grid-cols-3 gap-4 ">
                            <div className="lg:col-span-2 capitalize">
                                {field.replace(/_/g, " ")}:
                            </div>
                            {isEditing ? (
                                <div className="text-center flex justify-center items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        className="p-1 bg-[#1D374A] text-white rounded-md w-full text-center"
                                        value={editData?.[field] || ""}
                                        onChange={(e) => handleInputChange(field, parseInt(e.target.value, 10))}
                                    />
                                </div>
                            ) : (
                                <div className="text-center p-1 flex justify-center items-center">
                                    {draftData?.[field] || "--"}
                                </div>
                            )}

                        </div>
                    ))}
                </div>

                {/* Squad Configurations */}
                <div className={`col-span-12 sm:col-span-6 lg:col-span-4 bg-[#0c1922] rounded-lg space-y-1 py-6 px-4 sm:px-6 shadow-lg text-sm xl:text-base ${exo2.className}`}>
                    <h2 className='text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4'>Squad Configuration</h2>
                    {["goalkeepers", "defenders", "midfielders", "attackers"].map((field, index) => (
                        <div key={index} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 capitalize">
                                {field}:
                            </div>
                            {isEditing ? (
                                <div className="text-center flex justify-center items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        className="p-1 bg-[#1D374A] text-white rounded-md w-full text-center"
                                        value={editData?.squad_configurations?.[field] || ""}
                                        onChange={(e) =>
                                            setEditData((prev) => ({
                                                ...prev,
                                                squad_configurations: {
                                                    ...prev.squad_configurations,
                                                    [field]: parseInt(e.target.value, 10),
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="text-center p-1 flex justify-center items-center">
                                    {draftData?.squad_configurations?.[field] || "--"}
                                </div>
                            )}

                        </div>
                    ))}
                </div>

                {/* Lineup Configurations */}
                <div className={`col-span-12 sm:col-span-6 lg:col-span-4 bg-[#0c1922] rounded-lg space-y-1 py-6 px-4 sm:px-6 shadow-lg text-sm xl:text-base ${exo2.className}`}>
                    <h2 className="text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4">Lineup Configuration</h2>
                    {["goalkeepers", "defenders", "midfielders", "attackers"].map((field, index) => {
                        // Define min and max for each field
                        const fieldConstraints = {
                            goalkeepers: { min: 1, max: 1 },
                            defenders: { min: 3, max: 5 },
                            midfielders: { min: 2, max: 5 },
                            attackers: { min: 1, max: 5 },
                        };

                        const { min, max } = fieldConstraints[field];

                        return (
                            <div key={index} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 capitalize">{field}:</div>
                                {isEditing ? (
                                    <div className="text-center flex justify-center items-center">
                                        <input
                                            type="number"
                                            min={min}
                                            max={max}
                                            className="p-1 bg-[#1D374A] text-white rounded-md w-full text-center"
                                            value={editData?.lineup_configurations?.[field] || ""}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value, 10);
                                                // Ensure the value is within min and max range
                                                if (value >= min && value <= max) {
                                                    setEditData((prev) => ({
                                                        ...prev,
                                                        lineup_configurations: {
                                                            ...prev.lineup_configurations,
                                                            [field]: value,
                                                        },
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center p-1 flex justify-center items-center">
                                        {draftData?.lineup_configurations?.[field] || "--"}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Points Table
            <div className='mt-10 bg-[#1c1c1c] rounded-xl'>
                <h2 className={`text-xl font-bold text-[#FF8A00] pt-6 pl-6 pb-3 ${exo2.className}`}>Points Table</h2>
                <div className={`grid grid-cols-2 gap-6 bg-[#03070A] ${exo2.className}`}>
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
                                className="col-span-1 bg-[#1c1c1c] rounded-b-xl pb-6 shadow-lg"
                            >
                                <table className="table-auto w-full text-left">
                                    <thead className='bg-[#2f2f2f]'>
                                        <tr className='text-center'>
                                            <th className="p-2 border-b border-gray-700 text-left pl-6">Stat</th>
                                            <th className="p-2 border-b border-gray-700">GK</th>
                                            <th className="p-2 border-b border-gray-700">DEF</th>
                                            <th className="p-2 border-b border-gray-700">MID</th>
                                            <th className="p-2 border-b border-gray-700 pr-6">FWD</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center">
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
            </div> */}


            {/* Actions */}
            {/* <div className="flex flex-row mt-10 items-center gap-4">
                <h2 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className}`}>Actions</h2>
                {isCreator ? (
                    <div className='flex justify-center items-center gap-4'>
                        <button
                            className={`fade-gradient px-6 py-2 rounded-2xl transition duration-300 ${exo2.className}`}
                            onClick={() => {
                                // Handle Delete League logic here
                                console.log("Delete League clicked");
                                setShowDeletePopup(true);
                            }}
                        >
                            DELETE LEAGUE
                        </button>

                        {draftData?.state === "Scheduled" || draftData?.state === "Manual" ? (
                            <button
                                className={`bg-[#FF8A00] text-black px-6 py-2 rounded-2xl shadow-md hover:bg-[#FF8A00] hover:text-white hover:scale-105 transition duration-300 ${exo2.className}`}
                                onClick={() => {
                                    // Handle Remove a Team logic here
                                    console.log("Remove a Team clicked");
                                }}
                            >
                                REMOVE A TEAM
                            </button>
                        )
                            : null
                        }
                    </div>
                ) : (
                    <>
                        <button
                            className={`fade-gradient px-6 py-2 rounded-2xl transition duration-300 ${exo2.className}`}
                            onClick={() => {
                                // Handle Leave League logic here
                                console.log("Leave League clicked");
                            }}
                        >
                            LEAVE LEAGUE
                        </button>
                    </>
                )}
            </div> */}

        </div >
    );
};

export default DraftSettings;
