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
    const [loading, setLoading] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [originalStartDate, setOriginalStartDate] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [inputLeagueName, setInputLeagueName] = useState("");
    const [inputError, setInputError] = useState(false);
    const { addAlert } = useAlert();
    const router = useRouter();

    useEffect(() => {
        if (user && draftID) fetchDraftData();
    }, [user, draftID]);

    const fetchDraftData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft?draftID=${draftID}`
            );
            if (response.data && !response.data.error) {
                setDraftData(response.data.data[0]);

                // Check if the current user is the creator of the league
                if (response.data.data[0].creator === user.email) {
                    setIsCreator(true);
                } else {
                    setIsCreator(false);
                }
                console.log("Draft data fetched successfully:", response.data.data[0]);
            } else {
                console.error("Failed to fetch draft data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching draft data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (draftData) {
            setEditData({ ...draftData }); // Clone the data for editing
        }
    }, [draftData]);

    const handleEditClick = () => {
        setIsEditing(true);
        setEditData({ ...draftData });
    };

    const handleSaveClick = async () => {
        setLoading(true);
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
                setDraftData(response.data.data);
                console.log("Draft settings saved successfully:", response.data.data);
                addAlert("Draft settings saved successfully.", "success");
                setIsEditing(false);
            } else {
                console.error("Failed to save draft data:", response.data.message);
                addAlert("Unable to edit Draft settings. Please try again later", "error");
            }
            setLoading(false);
        } catch (error) {
            console.error("Error saving draft data:", error);
            setLoading(false);
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

    const handleDeleteLeague = async () => {
        if (!inputLeagueName) {
            setInputError(true);
            return;
        }

        if (inputLeagueName !== draftData?.leagueID?.league_name) {
            setInputError(true);
            return;
        }
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague?leagueId=${draftData?.leagueID?._id}`
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
    };

    useEffect(() => {
        if (showDeletePopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showDeletePopup]);

    if (loading || !draftData) {
        return (
            <div className="w-full min-h-[70vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
            </div>
        )
    }
    return (
        <div className="min-h-[88vh] flex flex-col text-white relative">
            {showDeletePopup && (
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
            )}
            <div className='flex justify-between mb-4'>
                <div className='flex items-center gap-4'>
                    <button
                        className={`fade-gradient px-6 py-2 rounded-2xl transition duration-300 ${exo2.className}`}
                        onClick={onBack}
                    >
                        Back
                    </button>
                    <h1 className={`text-4xl font-bold ${exo2.className}`}>Draft Settings</h1>
                </div>
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
            <div className="grid grid-cols-12 gap-6">
                {/* League Information */}
                <div className={`col-span-6 bg-[#1c1c1c] rounded-lg p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>League Information</h2>
                    <div className='grid grid-cols-6 gap-4 '>
                        <div className='col-span-2'>
                            {/* <div className='>Logo:</div> */}
                            <img
                                src={draftData?.leagueID?.league_image_path}
                                alt="League Logo"
                                className="w-16 h-16 object-cover rounded-lg sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32"
                            />
                        </div>
                        <div className='col-span-4 space-y-1'>
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
                            <div className='grid grid-cols-3'>
                                <div className='flex items-center'>Creator:</div>
                                <div className='col-span-2 text-left p-1 flex items-center'> {draftData?.creator || "Unknown"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Draft Settings */}
                <div className={`col-span-6 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Draft Settings</h2>
                    <div className='grid grid-cols-5'>
                        <div className='col-span-3 flex items-center'>Type:</div>
                        <div className='col-span-2 text-left p-1 flex items-center'> {draftData?.type || "----"}</div>
                    </div>
                    <div className="grid grid-cols-5 ">
                        <div className="col-span-3 flex items-center">State:</div>
                        {isEditing
                            && (draftData?.state === "Scheduled" || draftData?.state === "Manual")
                            ?
                            (
                                <div className="col-span-2 text-left flex items-center">
                                    <select
                                        className="p-1 bg-[#2f2f2f] text-white rounded-lg w-full"
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
                                <div className="col-span-2 text-left p-1 flex items-center">
                                    {draftData?.state || "Unknown"}
                                </div>
                            )
                        }
                    </div>
                    <div className="grid grid-cols-5">
                        <div className="col-span-3 flex items-center">Start Time:</div>
                        {isEditing
                            && editData?.state === "Scheduled"
                            ?
                            (
                                <div className="col-span-2 text-left flex items-center">
                                    <input
                                        type="datetime-local"
                                        className="p-1 bg-[#2f2f2f] text-white rounded-lg w-full"
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
                                <div className="col-span-2 text-left p-1 flex items-center">
                                    Not Applicable
                                </div>
                            ) : (
                                <div className="col-span-2 text-left p-1 flex items-center">
                                    {draftData?.start_date ? new Date(draftData.start_date).toLocaleString() : "None"}
                                </div>
                            )
                        }
                    </div>
                    <div className='grid grid-cols-5 '>
                        <div className='col-span-3 flex items-center'>Seconds per Pick:</div>
                        {isEditing ?
                            (
                                <div className="col-span-2 text-left flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        className="p-1 bg-[#2f2f2f] text-white rounded-lg w-full"
                                        value={editData?.time_per_pick || ""}
                                        onChange={(e) => handleInputChange("time_per_pick", parseInt(e.target.value, 10))}
                                    />
                                </div>
                            ) : (
                                <div className="col-span-2 text-left p-1 flex items-center">
                                    {draftData?.time_per_pick ? `${draftData.time_per_pick}s` : "--"}
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* Team Configurations */}
                <div className={`col-span-4 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Team Configurations</h2>
                    {["max_players_per_club", "squad_players", "lineup_players", "bench_players"].map((field, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 capitalize">
                                {field.replace(/_/g, " ")}:
                            </div>
                            {isEditing ? (
                                <div className="text-center flex justify-center items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        className="p-1 bg-[#2f2f2f] text-white rounded-lg w-full text-center"
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
                <div className={`col-span-4 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Squad Configuration</h2>
                    {["goalkeepers", "defenders", "midfielders", "attackers"].map((field, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 capitalize">
                                {field}:
                            </div>
                            {isEditing ? (
                                <div className="text-center flex justify-center items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        className="p-1 bg-[#2f2f2f] text-white rounded-lg w-full text-center"
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
                <div className={`col-span-4 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className="text-xl font-bold text-[#FF8A00] mb-4">Lineup Configuration</h2>
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
                            <div key={index} className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 capitalize">{field}:</div>
                                {isEditing ? (
                                    <div className="text-center flex justify-center items-center">
                                        <input
                                            type="number"
                                            min={min}
                                            max={max}
                                            className="p-1 bg-[#2f2f2f] text-white rounded-lg w-full text-center"
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

            {/* Points Table */}
            <div className='mt-10 bg-[#1c1c1c] rounded-xl'>
                <h2 className={`text-xl font-bold text-[#FF8A00] pt-6 pl-6 pb-3 ${exo2.className}`}>Points Table</h2>
                <div className={`grid grid-cols-2 gap-6 bg-[#03070A] ${exo2.className}`}>
                    <div className="col-span-1 rounded-b-xl shadow-lg pb-6 bg-[#1c1c1c]">
                        <table className="table-auto w-full text-left ">
                            <thead className='bg-[#2f2f2f]'>
                                <tr className='text-center'>
                                    <th className="p-2 border-b border-gray-700 text-left pl-6">Stat</th>
                                    <th className="p-2 border-b border-gray-700">GK</th>
                                    <th className="p-2 border-b border-gray-700">DEF</th>
                                    <th className="p-2 border-b border-gray-700">MID</th>
                                    <th className="p-2 border-b border-gray-700 pr-6">FWD</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">{`< 60 mins played`}</td>
                                    <td className="p-2 border-b border-gray-700">1</td>
                                    <td className="p-2 border-b border-gray-700">1</td>
                                    <td className="p-2 border-b border-gray-700">1</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">1</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">60+ mins played</td>
                                    <td className="p-2 border-b border-gray-700">2</td>
                                    <td className="p-2 border-b border-gray-700">2</td>
                                    <td className="p-2 border-b border-gray-700">2</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">2</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Goal scored</td>
                                    <td className="p-2 border-b border-gray-700">6</td>
                                    <td className="p-2 border-b border-gray-700">6</td>
                                    <td className="p-2 border-b border-gray-700">5</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Assist</td>
                                    <td className="p-2 border-b border-gray-700">3</td>
                                    <td className="p-2 border-b border-gray-700">3</td>
                                    <td className="p-2 border-b border-gray-700">3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Clean sheet</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Yellow card</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Red card</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Save</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Negative Points Table */}
                    <div className="col-span-1 bg-[#1c1c1c] rounded-b-xl pb-6 shadow-lg">
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
                            <tbody className='text-center'>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Own goal</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-2</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty missed</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-2</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty conceeded</td>
                                    <td className="p-2 border-b border-gray-700">-1</td>
                                    <td className="p-2 border-b border-gray-700">-1</td>
                                    <td className="p-2 border-b border-gray-700">-1</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-1</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty earned</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty saved</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Pass</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Accurate pass %</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Key pass</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* Actions */}
            <div className="flex flex-row mt-10 items-center gap-4">
                <h2 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className}`}>Actions</h2>
                {/* <div className="flex gap-4 px-6 pb-6"> */}
                {isCreator ? (
                    <div className='flex justify-center items-center gap-4'>
                        {/* Delete League Button */}
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

                        {/* Remove a Team Button */}
                        <button
                            className={`bg-[#FF8A00] text-black px-6 py-2 rounded-2xl shadow-md hover:bg-[#FF8A00] hover:text-white hover:scale-105 transition duration-300 ${exo2.className}`}
                            onClick={() => {
                                // Handle Remove a Team logic here
                                console.log("Remove a Team clicked");
                            }}
                        >
                            REMOVE A TEAM
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Leave League Button */}
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
                {/* </div> */}
            </div>

        </div >
    );
};

export default DraftSettings;
