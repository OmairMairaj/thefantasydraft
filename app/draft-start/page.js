'use client';

import React, { useEffect, useState } from 'react';
import { Suspense } from "react";
import { Exo_2 } from 'next/font/google';
import { FaBell, FaCog, FaDraft2Digital, FaPlay, FaLink, FaChevronRight } from 'react-icons/fa';
import { LuGrip } from "react-icons/lu";
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAlert } from '@/components/AlertContext/AlertContext';
import { useRef } from "react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from '@/components/Modal/Modal';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const DraftStart = () => {

    const [user, setUser] = useState(null);
    const [draftID, setDraftID] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [players, setPlayers] = useState([]);
    const [autoPickList, setAutoPickList] = useState([]);
    const [chosenPlayers, setChosenPlayers] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('name'); // Default sorting by name
    const [filter, setFilter] = useState('');
    const [draftOrder, setDraftOrder] = useState(draftData?.order || []);
    const [loading, setLoading] = useState(false);
    const [turnEmail, setTurnEmail] = useState(null);
    const [currentTurnTeam, setCurrentTurnTeam] = useState(null);
    const [pitchViewList, setPitchViewList] = useState({
        lineup: {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        },
        bench: [],
    });
    const [view, setView] = useState('List');
    const turnContainerRef = useRef(null);
    // const router = useRouter();
    const { addAlert } = useAlert();

    useEffect(() => {
        // Get user from session storage
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser).user);
        } else {
            console.error("User not found in session storage");
        }
        // Extract draftID from the URL using window.location
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const draftIDFromURL = urlParams.get('draftID');
            console.log("DraftID from URL: ", draftIDFromURL);

            if (draftIDFromURL) {
                setDraftID(draftIDFromURL);
            } else {
                console.error("League ID not found in URL");
            }
        }
    }, []);

    useEffect(() => {
        // Fetch league data if user and draftID are available
        if (user && draftID) fetchdraftData();
    }, [user, draftID]);

    const fetchdraftData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft?draftID=${draftID}`
            );
            if (response.data && !response.data.error) {
                setDraftData(response.data.data);
                console.log("draftData: ", response.data.data);

                setTurnEmail(response.data.data.turn);
                // Check if the current user is the creator of the league
                // if (response.data.data.creator === user.email) {
                //     setIsCreator(true);
                // } else {
                //     setIsCreator(false);
                // }

                if (response.data.data.state === 'In Process') {
                    const now = Date.now();
                    const lastUpdated = new Date(response.data.data.updatedAt).getTime(); // Updated time
                    const turnEndTime = lastUpdated + response.data.data.time_per_pick * 1000; // End time for the current turn
                    const remainingTime = Math.max(turnEndTime - now, 0); // Prevent negative time
                    setTimeRemaining(remainingTime);
                }
            } else {
                console.error("Failed to fetch league data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching league data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        let pollingInterval;
        if (draftData?.state === 'In Process') {
            // Calculate the remaining time for the new turn
            const now = Date.now();
            const lastUpdated = new Date(draftData.updatedAt).getTime(); // When the last turn was updated
            const turnEndTime = lastUpdated + draftData.time_per_pick * 1000; // End time for the current turn
            const remainingTime = Math.max(turnEndTime - now, 0); // Prevent negative time
            setTimeRemaining(remainingTime);

            // Start a new interval to update the countdown
            interval = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 1000) {
                        clearInterval(interval); // Stop the timer when it reaches 0
                        return 0;
                    }
                    return prevTime - 1000;
                });
            }, 1000);

            // pollingInterval = setInterval(() => {
            //     fetchdraftData();
            // }, 5000);
        }

        return () => clearInterval(interval); // Cleanup the interval on unmount or turn change
    }, [draftData?.state, draftData?.turn, draftData?.updatedAt]);

    useEffect(() => {
        if (timeRemaining === 0) {
            // Fetch updated draft data when the timer reaches 0
            fetchdraftData();
        }
    }, [timeRemaining]);

    useEffect(() => {
        if (draftData) {
            fetchTurnTeam();
            fetchPlayers();
            fetchPickList();
            fetchChosenPlayers();
        }
    }, [draftData]);

    const formatTime = (ms) => {
        const minutes = String(Math.floor((ms / 1000 / 60) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
        return `${minutes}:${seconds} s`;
    };

    useEffect(() => {
        if (draftData?.order) {
            setDraftOrder([...draftData.order]); // Ensure it's a new array
        }
    }, [draftData]);

    useEffect(() => {
        const savedView = sessionStorage.getItem('draftView');
        if (savedView) {
            setView(savedView);
        }
    }, []);

    const handleViewChange = (newView) => {
        setView(newView);
        sessionStorage.setItem('draftView', newView);
    };

    // Fetch players from API
    const fetchPlayers = async () => {
        try {
            // Ensure draftID and teamID are available
            if (!draftID || !draftData) {
                console.error("Missing draftID or teamID.");
                return;
            }
            // Find the teamID for the current user
            const teamID = draftData.teams.find(team => team.user_email === user.email)?.team._id;
            if (!teamID) {
                console.error("Team ID not found for the current user.");
                return;
            }
            // Make the API call
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft/players?draftID=${draftID}&teamID=${teamID}`
            );
            if (response.data && !response.data.error) {
                setPlayers(response.data.data || []);
                console.log("Players:", response.data.data);
            } else {
                console.error("Failed to fetch league data:", response.data.message);
            }


        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    // Fetch players from API
    const fetchPickList = async () => {
        try {
            let teamID = ""
            draftData.teams.map((item) => { if (item.user_email === user.email) teamID = item.team._id });
            const link = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyteam/" + teamID + "/picklist"
            const response = await axios.get(link);
            if (response.data && !response.data.error) {

                // const selectedPlayerIds = draftData.players_selected;
                // console.log("Selected Player Ids:", selectedPlayerIds);
                // console.log("PickList:", response.data.data);
                // const updatedPickList = response.data.data.filter(
                //     (player) => !selectedPlayerIds.includes(player._id)
                // );
                // setAutoPickList(updatedPickList);
                setAutoPickList(response.data.data);
                // setOriginalPickList(response.data.data);
                // console.log("PickList:", response.data.data);
            } else {
                console.error("Failed to fetch league data:", response.data.message);
            }

        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    // const updateAutoPickList = () => {
    //     if (!draftData?.players_selected || !autoPickList) return;

    //     const selectedPlayerIds = draftData.players_selected.map((player) => player.id);

    //     // Filter out players already selected
    //     const updatedPickList = autoPickList.filter(
    //         (player) => !selectedPlayerIds.includes(player.id)
    //     );

    //     setAutoPickList(updatedPickList);
    // };

    const handlePick = async (player) => {
        try {
            console.log("Picking player:", player);
            const requestBody = {
                user_email: user.email,
                draftID: draftID,
                playerObj: player,
            };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft/players`, requestBody);
            if (response.data && !response.data.error) {
                console.log("Player successfully picked:", response.data);
                // Fetch updated draft data
                await fetchdraftData();
                addAlert("Player successfully picked!", "success");
            } else {
                console.error("Failed to pick player:", response.data.message);
                addAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('Failed to add player:', error);
        }
    };

    const fetchChosenPlayers = () => {
        if (draftData) {
            const players = draftData.teams.find((team) => team.user_email === user.email).team?.players || [];
            if (players) {
                setChosenPlayers(players);
                console.log("Chosen Players:", players);
            }
        }
    };

    useEffect(() => {
        if (chosenPlayers && chosenPlayers.length > 0) {
            const lineupConfigurations = {
                goalkeeper: 1,
                defender: 4,
                midfielder: 4,
                attacker: 2,
            };
            const segregatedPlayers = segregatePlayers(chosenPlayers, lineupConfigurations);
            console.log("Segregated Players:", segregatedPlayers);
            if (segregatedPlayers) {
                setPitchViewList(segregatedPlayers);
            }
        }
    }, [chosenPlayers]);

    const segregatePlayers = (players, lineupConfigurations) => {
        console.log("Players list:", players);
        // Object to store the players grouped by positions
        const groupedPlayers = {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        };

        // Object to store the final lineup and bench players
        const result = {
            lineup: {
                Goalkeeper: [],
                Defender: [],
                Midfielder: [],
                Attacker: [],
            },
            bench: [],
        };

        // Group players by positions
        players.forEach((player) => {
            console.log("Player:", player);
            if (groupedPlayers[player.player.position_name]) {
                groupedPlayers[player.player.position_name].push(player);
                console.log("Grouped Players:", groupedPlayers);
            }
        });

        // Process each position to segregate players into lineup and bench
        Object.keys(groupedPlayers).forEach((position) => {
            const positionPlayers = groupedPlayers[position];
            const maxInLineup = lineupConfigurations[position.toLowerCase()]; // Get the limit for this position

            // First, add players to the lineup up to the allowed limit
            result.lineup[position] = positionPlayers.slice(0, maxInLineup);

            // Add any extra players to the bench
            const extras = positionPlayers.slice(maxInLineup);
            result.bench.push(...extras);
        });

        return result;
    };

    const renderSkeletons = (required, chosenCount) => {
        if (chosenCount >= required) return null;
        return Array.from({ length: Math.max(0, required - chosenCount) }).map((_, index) => (
            <div
                key={`skeleton-${index}`}
                className="flex flex-col py-2 items-center w-[20%] max-w-[20%] text-center overflow-hidden rounded-lg border border-[#333333] bg-[#33333388]"
            >
                <div className="w-12 h-12 rounded-lg bg-gray-600 animate-pulse mt-2" />
                <p className="text-sm mt-2 w-full bg-gray-700 h-4 animate-pulse" />
            </div>
        ));
    };


    const handleSearch = (value) => {
        setSearch(value);
    }

    const filteredPlayers = players
        .filter((player) =>
            // Filter players by name or common_name
            player.name.toLowerCase().includes(search.toLowerCase()) ||
            player.common_name?.toLowerCase().includes(search.toLowerCase()) ||
            player.team_name?.toLowerCase().includes(search.toLowerCase())
        )
        .filter((player) =>
            // Filter by position if filter is set
            !filter || player.position_name?.toLowerCase() === filter.toLowerCase()
        )
        .sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'rating') return b.rating - a.rating; // Example for sorting by rating
            return 0;
        });

    const fetchTurnTeam = () => {
        const turn = draftData?.turn;
        const team = draftData?.teams.find((team) => team.user_email === turn);
        setCurrentTurnTeam(team);
        console.log("Current Turn Team:", team);
    };

    useEffect(() => {
        if (turnEmail) fetchTurnTeam();
    }, [turnEmail]);

    const positionIcon = (position) => {
        const positionStyles = {
            Attacker: { bg: 'bg-[#D3E4FE]', text: 'F' },
            Midfielder: { bg: 'bg-[#D5FDE1]', text: 'M' },
            Defender: { bg: 'bg-[#F8E1FF]', text: 'D' },
            Goalkeeper: { bg: 'bg-[#FEF9B6]', text: 'G' },
        };

        const { bg, text } = positionStyles[position] || { bg: 'bg-gray-500', text: '?' };

        return (
            <div
                className={`${bg} w-5 h-5 text-black flex items-center justify-center text-xs my-4 rounded-full `}
            >
                {text}
            </div>
        );
    };

    useEffect(() => {
        if (draftData?.turn && turnContainerRef.current) {
            const currentTurnBox = turnContainerRef.current.querySelector(
                `[data-turn="${draftData.turn}"]`
            );
            if (currentTurnBox) {
                currentTurnBox.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                });
            }
        }
    }, [draftData?.turn]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-[88vh] flex flex-col my-16 text-white px-6 md:px-10 lg:px-16 xl:px-20 pb-10">
                <h1 className={`text-4xl font-bold ${exo2.className} mb-8`}>Drafting</h1>
                {loading && !draftData ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {/* Drafting Info Section */}
                        <div className="flex justify-between mb-8">
                            <div className="flex flex-col space-y-4 w-1/3 pr-4 border-r border-[#404040]">
                                <div className="bg-[#333333] px-4 py-4 rounded-lg text-center">
                                    {draftData?.turn &&
                                        currentTurnTeam && (
                                            <p className="text-lg">
                                                {`${currentTurnTeam.user_email === user.email ? 'Its Your Turn' : `It's Team ${currentTurnTeam?.team.team_name}'s Turn`}`}
                                            </p>
                                        )}
                                    {draftData?.state === 'Ended' && (
                                        <p className="text-lg">The draft has ended.</p>
                                    )}
                                </div>

                                <div className="bg-[#333333] px-8 py-4 rounded-lg text-center">

                                    {draftData?.state === 'In Process' && (
                                        <>
                                            <p className="text-2xl">Time Remainings</p>
                                            <p className="text-5xl text-white mt-2"> {formatTime(timeRemaining)}</p>
                                        </>
                                    )}
                                    {draftData?.state === 'Ended' && (
                                        <>
                                            <p className="text-2xl">Draft Status</p>
                                            <p className="text-5xl text-white mt-2">{draftData?.state}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2 w-2/3 pl-4">
                                <div className='flex justify-between'>
                                    <div className={`flex text-xl items-center ${exo2.className}`}>Draft Order:<span className='text-base ml-2 text-gray-400'>{`(Round ${draftData?.draft_round} order)`}</span></div>
                                </div>
                                <div ref={turnContainerRef} className="overflow-x-auto pb-2 scrollbar">
                                    <div className="flex gap-4 min-w-max">
                                        {draftData?.order.map((email, index) => {
                                            // Find the team corresponding to the current email in the order
                                            const teamData = draftData?.teams.find((team) => team.user_email === email);
                                            return (
                                                <div key={index} data-turn={email} className={`bg-[#1C1C1C] flex flex-col items-center justify-center text-center h-[140px] w-[200px] rounded-lg ${email === draftData?.turn ? 'border-2 border-[#FF8A00] shadow-lg' : 'hover:bg-[#444444]'
                                                    }`}>
                                                    {teamData ? (
                                                        <>
                                                            <p className="text-sm text-[#FF8A00] mb-2">{`Turn ${index + 1}`}</p>
                                                            {/* Show the team logo */}
                                                            {teamData.team?.team_image_path && (
                                                                <img
                                                                    src={teamData.team.team_image_path}
                                                                    alt={teamData.team.team_name}
                                                                    className="w-14 h-14 rounded-lg mb-2"
                                                                />
                                                            )}
                                                            {/* Show the team name */}
                                                            <p className="text-sm">{teamData.team?.team_name || "Unnamed Team"}</p>
                                                        </>
                                                    ) : (
                                                        <p>No Team Found</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <p className='text-sm text-gray-400'>* After every round draft order will be reversed.</p>
                            </div>
                        </div>

                        {/* Main Draft Section */}
                        <div className="grid grid-cols-8 gap-4 ">
                            {/* Players Section */}
                            <div className="col-span-3 bg-[#1C1C1C] rounded-xl p-6 h-full ">
                                <div className='flex justify-between'>
                                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>
                                        Players
                                    </h3>
                                    {/* Search, Filter, and Sort */}
                                    <div className="flex gap-2 mb-4 w-9/12">
                                        <div className='flex items-center gap-2 w-3/12'>
                                            {/* <p className="text-gray-400 text-sm">Sort:</p> */}
                                            <select
                                                value={sort}
                                                onChange={(e) => setSort(e.target.value)}
                                                className="p-1 rounded-lg bg-[#333333] text-white text-sm w-full"
                                            >
                                                <option value="name">Name</option>
                                                <option value="rating">Rating</option>
                                            </select>
                                        </div>
                                        <div className='flex items-center gap-2 w-4/12'>
                                            {/* <p className="text-gray-400 text-sm">Filter:</p> */}
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="p-1 rounded-lg bg-[#333333] text-white text-sm w-full"
                                            >
                                                <option value="">Position</option>
                                                <option value="attacker">Attacker</option>
                                                <option value="midfielder">Midfielder</option>
                                                <option value="defender">Defender</option>
                                                <option value="goalkeeper">Goalkeeper</option>
                                            </select>
                                        </div>
                                        <div className='flex items-center gap-2 w-5/12 '>
                                            <input
                                                type="text"
                                                placeholder="Search ..."
                                                value={search}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                className="p-1 rounded-lg bg-[#333333] text-white text-sm w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Table */}
                                <div className="relative w-full h-[655px] overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                    {/* Scrollable Wrapper */}
                                    <div className="overflow-x-auto overflow-y-auto h-[655px] scrollbar">
                                        <table className="table-auto w-full text-left text-white">
                                            {/* Table Header */}
                                            <thead className="bg-[#2f2f2f] sticky top-0 z-10 text-sm">
                                                <tr className="text-center">
                                                    <th className="p-2 max-w-[100px]">Name</th>
                                                    <th className="p-2"></th>
                                                    <th className="p-2">Rating</th>
                                                    <th className="p-2 sticky right-0 z-20">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-sm'>
                                                {filteredPlayers.map((player) => (
                                                    <tr key={player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                        <td className="p-2 max-w-[100px] text-left truncate">
                                                            <div className="flex items-center space-x-2">
                                                                {player.image_path && (
                                                                    <img
                                                                        src={player.image_path}
                                                                        alt={player.team_name || "Team Logo"}
                                                                        className="w-10 h-10 rounded-lg"
                                                                    />
                                                                )}
                                                                <div className="overflow-hidden">
                                                                    <p className="font-bold truncate">{player.common_name}</p>
                                                                    <p className="text-xs text-gray-400 truncate">{player.team_name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='h-full flex justify-center items-center' style={{ verticalAlign: "middle" }}>{positionIcon(player.position_name)}</td>
                                                        <td className="p-2">{player.rating}</td>
                                                        <td className="p-2 sticky right-0 bg-[#1C1C1C]">
                                                            <button
                                                                className={`${draftData?.turn !== user.email ? 'bg-[#454545]' : 'bg-[#FF8A00] hover:bg-[#e77d00]'} text-white px-6 py-1 rounded-lg `}
                                                                onClick={() => handlePick(player)}
                                                                disabled={draftData?.turn !== user.email}
                                                            >
                                                                Pick
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Auto Pick List Section */}
                            <div className="col-span-2 bg-[#1C1C1C] rounded-xl p-6 h-full">
                                <div className='flex justify-between'>
                                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>
                                        Auto Pick List
                                    </h3>
                                    {/* <button className={`save-button ${hasUnsavedChanges ? "enabled bg-[#FF8A00] hover:bg-[#e77d00]" : "disabled bg-[#4e4e4e]"} text-white px-3 py-1 mb-4 rounded-lg `} disabled={!hasUnsavedChanges} onClick={() => { saveAutoPickList() }}>Save Changes</button> */}
                                </div>
                                {autoPickList ?
                                    autoPickList.length > 0 ?
                                        <div className="relative w-full h-[655px] overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                            {/* Scrollable Wrapper */}
                                            <div className="overflow-x-auto overflow-y-auto h-[655px] scrollbar scroll-m-28">
                                                <table className="table-auto w-full text-left text-white">
                                                    {/* Table Header */}
                                                    <thead className="bg-[#2f2f2f] sticky top-0 z-10">
                                                        <tr className="text-center text-sm">
                                                            {/* <th className="p-2 w-10"></th> */}
                                                            <th className="p-2 max-w-[100px] text-left pl-4">Name</th>
                                                            <th className="p-2"></th>
                                                            <th className="p-2 sticky right-0 z-20"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm">
                                                        {autoPickList.map((player, index) => (
                                                            <tr className={`${draftData.players_selected.includes(player._id) ? 'opacity-50' : ''} border-b border-[#333333] text-center items-center justify-center`} >
                                                                <td className="p-2 max-w-[100px] text-left truncate">
                                                                    <div className="flex items-center space-x-2">
                                                                        {player.image_path && (
                                                                            <img
                                                                                src={player.image_path}
                                                                                alt={player.team_name || "Team Logo"}
                                                                                className="w-10 h-10 rounded-lg"
                                                                            />
                                                                        )}
                                                                        <div className="overflow-hidden">
                                                                            <p className="font-bold truncate">{player.common_name}</p>
                                                                            <p className="text-xs text-gray-400 truncate">{player.team_name}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="h-full flex justify-center items-center">
                                                                    {positionIcon(player.position_name)}
                                                                </td>
                                                                <td className="p-2 sticky right-0 bg-[#1C1C1C]">
                                                                    <button
                                                                        disabled={draftData?.turn !== user.email || draftData.players_selected.includes(player._id)}
                                                                        className={`${draftData?.turn !== user.email || draftData.players_selected.includes(player._id) ? 'bg-[#3c3c3c]' : 'bg-[#FF8A00] hover:bg-[#e77d00]'} text-white px-3 py-1 rounded-lg `}
                                                                        onClick={() => handlePick(player)}
                                                                    >
                                                                        <FaChevronRight />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        : (
                                            <div className="h-[85%] overflow-auto flex flex-col justify-center space-y-2">
                                                <div className="text-gray-400 text-center">No players selected for auto pick.</div>
                                            </div>
                                        )
                                    : (
                                        <div className="h-[85%] overflow-auto flex flex-col justify-center space-y-2">
                                            <div className="text-gray-400 text-center">Fetching auto pick list...</div>
                                        </div>
                                    )
                                }
                            </div>

                            {/* Chosen Players Section */}
                            <div className="col-span-3 bg-[#1C1C1C] rounded-xl p-6 h-full ">
                                <div className="flex justify-between">
                                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>Picks</h3>
                                    <div className="flex items-center rounded-lg overflow-hidden mb-4">
                                        <button
                                            className={`${view === 'List' ? 'bg-[#ff8800b7]' : 'bg-[#2c2c2c]'} text-white px-5 py-1`}
                                            onClick={() => handleViewChange('List')}
                                        >
                                            List View
                                        </button>
                                        <button
                                            className={`${view === 'Pitch' ? 'bg-[#ff8800b7]' : 'bg-[#2c2c2c]'} text-white px-5 py-1`}
                                            onClick={() => handleViewChange('Pitch')}
                                        >
                                            Pitch View
                                        </button>
                                    </div>
                                </div>
                                {chosenPlayers && pitchViewList ? (
                                    chosenPlayers.length > 0 ? (
                                        view === 'List' ? (
                                            <div className="relative w-full h-[655px] overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                                <div className="overflow-x-auto overflow-y-auto h-[655px] scrollbar">
                                                    <table className="table-auto w-full text-left text-white">
                                                        <thead className="bg-[#2f2f2f] sticky top-0 z-10">
                                                            <tr className="text-center text-sm">
                                                                <th className="p-2 max-w-[100px] text-left pl-4">Name</th>
                                                                <th className="p-2"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-sm">
                                                            {chosenPlayers.map((player) => (
                                                                <tr
                                                                    key={player.player.id}
                                                                    className="border-b border-[#333333] text-center items-center justify-center"
                                                                >
                                                                    <td className="p-2 max-w-[100px] text-left truncate">
                                                                        <div className="flex items-center space-x-2">
                                                                            {player.player.image_path && (
                                                                                <img
                                                                                    src={player.player.image_path}
                                                                                    alt={player.player.team_name || 'Team Logo'}
                                                                                    className="w-10 h-10 rounded-lg"
                                                                                />
                                                                            )}
                                                                            <div className="overflow-hidden">
                                                                                <p className="font-bold truncate">
                                                                                    {player.player.common_name}
                                                                                </p>
                                                                                <p className="text-xs text-gray-400 truncate">
                                                                                    {player.player.team_name}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="h-full flex justify-center items-center">
                                                                        {positionIcon(player.player.position_name)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='flex flex-col gap-1'>
                                                <div className="py-6 px-4 text-white rounded-lg border border-[#333333] bg-[#1C1C1C] pitch-view">
                                                    <div className="flex flex-col gap-6">
                                                        {/* Goalkeepers */}
                                                        <div className="flex justify-center items-center gap-4">
                                                            {pitchViewList.lineup.Goalkeeper.map((player) => (
                                                                <div
                                                                    key={player.player.id}
                                                                    className="flex flex-col py-2 items-center w-[20%] max-w-[20%] text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]"
                                                                >
                                                                    <img
                                                                        src={player.player.image_path}
                                                                        alt={player.player.team_name || 'Player'}
                                                                        className="w-12 h-12 rounded-lg mt-2"
                                                                    />
                                                                    <p className="text-sm mt-2 truncate w-full" title={player.player.common_name}>
                                                                        {player.player.common_name}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                        </div>
                                                        {/* Defenders */}
                                                        <div className="flex justify-center items-center gap-4">
                                                            {pitchViewList.lineup.Defender.map((player) => (
                                                                <div
                                                                    key={player.player.id}
                                                                    className="flex flex-col py-2 items-center w-[20%] max-w-[20%] text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]"
                                                                >
                                                                    <img
                                                                        src={player.player.image_path}
                                                                        alt={player.player.team_name || 'Player'}
                                                                        className="w-12 h-12 rounded-lg mt-2"
                                                                    />
                                                                    <p className="text-sm mt-2 truncate w-full" title={player.player.common_name}>
                                                                        {player.player.common_name}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                        </div>
                                                        {/* Midfielders */}
                                                        <div className="flex justify-center items-center gap-4">
                                                            {pitchViewList.lineup.Midfielder.map((player) => (
                                                                <div
                                                                    key={player.player.id}
                                                                    className="flex flex-col py-2 items-center w-[20%] max-w-[20%] text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]"
                                                                >
                                                                    <img
                                                                        src={player.player.image_path}
                                                                        alt={player.player.team_name || 'Player'}
                                                                        className="w-12 h-12 rounded-lg mt-2"
                                                                    />
                                                                    <p className="text-sm mt-2 truncate w-full" title={player.player.common_name}>
                                                                        {player.player.common_name}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                        </div>
                                                        {/* Attackers */}
                                                        <div className="flex justify-center items-center gap-4">
                                                            {pitchViewList.lineup.Attacker.map((player) => (
                                                                <div
                                                                    key={player.player.id}
                                                                    className="flex flex-col py-2 items-center w-[20%] max-w-[20%] text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]"
                                                                >
                                                                    <img
                                                                        src={player.player.image_path}
                                                                        alt={player.player.team_name || 'Player'}
                                                                        className="w-12 h-12 rounded-lg mt-2"
                                                                    />
                                                                    <p className="text-sm mt-2 truncate w-full" title={player.player.common_name}>
                                                                        {player.player.common_name}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {renderSkeletons(2, pitchViewList.lineup.Attacker.length)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Substitute Players */}
                                                <div className='w-full py-1 px-4 bg-[#131313] rounded-lg'>
                                                    <div className="flex justify-center items-center gap-4">
                                                        {pitchViewList.bench.map((player) => (
                                                            <div
                                                                key={player.player.id}
                                                                className="flex flex-col py-2 items-center w-[20%] max-w-[20%] text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]"
                                                            >
                                                                <img
                                                                    src={player.player.image_path}
                                                                    alt={player.player.team_name || 'Player'}
                                                                    className="w-12 h-12 rounded-lg mt-2"
                                                                />
                                                                <p className="text-sm mt-2 truncate w-full" title={player.player.common_name}>
                                                                    {player.player.common_name}
                                                                </p>
                                                            </div>
                                                        ))}
                                                        {renderSkeletons(4, pitchViewList.bench.length)}
                                                    </div>
                                                </div>
                                            </div>

                                        )
                                    ) : (
                                        <div className="h-[85%] overflow-auto flex flex-col justify-center space-y-2">
                                            <div className="text-gray-400 text-center">No players selected for Team.</div>
                                        </div>
                                    )
                                ) : (
                                    <div className="h-[85%] overflow-auto flex flex-col justify-center space-y-2">
                                        <div className="text-gray-400 text-center">Fetching Team Players list...</div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </>
                )}
            </div >
        </Suspense>
    );
};

export default DraftStart;
