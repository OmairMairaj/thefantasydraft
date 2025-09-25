'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertContext/AlertContext";
import PlayerModal from '../../components/PlayerModal/PlayerModal';


const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const TeamPage = () => {
    const [leagueId, setLeagueId] = useState(null);
    const [user, setUser] = useState(null);
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState();
    const [standings, setStandings] = useState();
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [matches, setMatches] = useState();
    const router = useRouter();
    const [gameweekName, setGameweekName] = useState(null);
    const [gameweekDetails, setGameweekDetails] = useState({});
    const [pitchViewList, setPitchViewList] = useState({
        lineup: {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        },
        bench: [],
    });
    const [view, setView] = useState('Pitch');
    const { addAlert } = useAlert();
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showOptions, setShowOptions] = useState(null);
    const optionsRef = useRef(null);
    const [playerModalShow, setPlayerModalShow] = useState(false);
    const [viewPlayer, setViewPlayer] = useState(null);

    useEffect(() => {
        // Check if window is defined to ensure we are on the client side
        if (typeof window !== 'undefined') {
            let userData = null;

            if (sessionStorage.getItem("user")) {
                userData = JSON.parse(sessionStorage.getItem("user"));
            } else if (localStorage.getItem("user")) {
                userData = JSON.parse(localStorage.getItem("user"));
            } else {
                router.push("/login?redirect=" + window.location.toString());
            }

            if (userData && userData.user) {
                setUser(userData.user);
                fetchCurrentGameweek();
                console.log(userData.user.email);

                // Check if selectedLeagueID is in sessionStorage
                const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
                if (storedLeagueID) {
                    setLeagueId(storedLeagueID); // Temporarily set league with just ID
                } else {
                    // If no league ID is found, redirect to dashboard
                    router.push("/dashboard");
                    addAlert("No league selected. Please select a league from the dashboard.", "error");
                }
            }
        }
    }, []);

    useEffect(() => {
        if (playerModalShow) {
            // Prevent background scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll
            document.body.style.overflow = '';
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [playerModalShow]);

    useEffect(() => {
        if (gameweekName) {
            console.log("Fetching data for gameweek: ", gameweekName);
            fetchMatches(gameweekName);
            fetchGameweekDetails(gameweekName);
        }
    }, [gameweekName]);

    const fetchCurrentGameweek = () => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}gameweek/current`, { cache: 'no-store' })
            .then((response) => {
                console.log("current")
                console.log(response)
                if (!response.data.error) {
                    const currentGameweek = response.data.data;
                    console.log(currentGameweek);
                    if (currentGameweek) {
                        setGameweekName(parseInt(currentGameweek.name, 10)); // Convert gameweek name to integer
                        setGameweekDetails(currentGameweek);
                    }
                }
                else {
                    addAlert(response.data.message, "error");
                    console.log(response.data.message);
                }
            })
            .catch((err) =>
                console.error("Error fetching current gameweek data: ", err)
            );
    };

    const fetchMatches = (gameweek) => {
        axios
            .get(`/api/match?gameweek=${gameweek}`)
            .then((response) => {
                setMatches(response.data.data);
                console.log(response.data.data);
            })
            .catch((err) => console.error("Error fetching match data: ", err));
    };

    const fetchGameweekDetails = (gameweek) => {
        axios
            .get(`/api/gameweek/${gameweek}`)
            .then((response) => {
                console.log(response.data.data);
                setGameweekDetails(response.data.data);
            })
            .catch((err) => console.error("Error fetching gameweek data: ", err));
    };

    useEffect(() => {
        // Fetch league and team data on load
        fetchStandings();
    }, []);

    useEffect(() => {
        if (user?.email && leagueId) {
            fetchUserTeamForLeague(user.email, leagueId);
        }
    }, [user, leagueId]);

    const fetchStandings = () => {
        axios
            .get(process.env.NEXT_PUBLIC_BACKEND_URL + `standing`)
            .then((response) => {
                console.log(response.data.data);
                setStandings(response.data.data);
            })
            .catch((err) => console.error("Error fetching table data: ", err));
    };

    const fetchUserTeamForLeague = async (userEmail, leagueId) => {
        try {
            // Step 1: Get all leagues for the user
            const leagueResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `fantasyleague?email=${userEmail}`);

            if (leagueResponse.data && !leagueResponse.data.error) {
                console.log(leagueResponse.data.data);
                const leagues = leagueResponse.data.data;

                // Step 2: Find the correct league by matching the leagueId
                const selectedLeague = leagues.find(league => league._id === leagueId);

                if (selectedLeague) {
                    // Step 3: Find the user's team in the selected league
                    console.log(selectedLeague);
                    setSelectedLeague(selectedLeague);
                    const userTeam = selectedLeague.teams.find(team => team.user_email === userEmail);

                    if (userTeam) {
                        // Step 4: Fetch the fantasy team details using teamId
                        console.log(userTeam);
                        fetchTeamDetails(userTeam.team._id);
                    } else {
                        console.error("No team found for the user in this league.");
                        addAlert("No team found for the selected league.", "error");
                    }
                } else {
                    console.error("No matching league found.");
                    addAlert("No matching league found.", "error");
                }
            } else {
                console.error("Error fetching leagues: ", leagueResponse.data.message);
                addAlert(leagueResponse.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching user leagues:', error);
            addAlert("An error occurred while fetching leagues.", "error");
        }
    };

    const fetchTeamDetails = async (teamId) => {
        try {
            const teamResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `fantasyteam/${teamId}`);
            if (teamResponse.data && !teamResponse.data.error) {
                console.log("Team Data", teamResponse.data.data);
                setTeam(teamResponse.data.data);
                setPlayers(teamResponse.data.data.players);
            } else {
                console.error("Error fetching team details: ", teamResponse.data.message);
                addAlert(teamResponse.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching team details:', error);
            addAlert("An error occurred while fetching team details.", "error");
        }
    };

    useEffect(() => {
        if (players && players.length > 0) {
            console.log("Players", players);
            const segregatedPlayers = segregatePlayers(players);
            console.log("Segregated Players:", segregatedPlayers);
            if (segregatedPlayers) {
                setPitchViewList(segregatedPlayers);
            }
        }
    }, [players]);

    const segregatePlayers = (players) => {
        console.group("%cPlayer Segregation Process", "color: cyan; font-weight: bold; font-size: 14px;");

        // Define position categories with a max limit of 5
        const positionCategories = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
        const maxLimit = 5;

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

        console.log(`%cTotal Players to Segregate: ${players.length}`, "color: lightgreen; font-weight: bold;");

        // Group players based on in_team flag and position
        players.forEach((player, index) => {
            const position = player.player.position_name;
            const playerName = player.player.common_name;
            const isInTeam = player.in_team;
            const teamStatus = isInTeam ? "Starting XI" : "Bench";

            console.groupCollapsed(
                `%c[${index + 1}] ${playerName} - ${position} (${teamStatus})`,
                `color: ${isInTeam ? "yellow" : "gray"}; font-weight: bold;`
            );

            if (!positionCategories.includes(position)) {
                console.warn(`%cUnknown position detected for ${playerName}: ${position}`, "color: red;");
                console.groupEnd();
                return;
            }

            if (isInTeam) {
                if (result.lineup[position].length < maxLimit) {
                    result.lineup[position].push(player);
                    console.log(`✅ %cAdded to lineup (${position}).`, "color: green;");
                } else {
                    result.bench.push(player);
                    console.log(`⚠️ %cMax limit reached for ${position}. Sent to bench.`, "color: orange;");
                }
            } else {
                result.bench.push(player);
                console.log(`⬆️ %cPlayer starts on the bench.`, "color: lightblue;");
            }

            console.groupEnd();
        });

        // Final summary
        console.group("%cFinal Team Composition", "color: cyan; font-weight: bold;");
        console.log("%cLineup:", "color: green; font-weight: bold;", result.lineup);
        console.log("%cBench:", "color: orange; font-weight: bold;", result.bench);
        console.groupEnd();

        console.groupEnd(); // End of main group
        return result;
    };


    const renderSkeletons = (required, chosenCount) => {
        if (chosenCount >= required) return null;
        return Array.from({ length: Math.max(0, required - chosenCount) }).map((_, index) => (
            <div
                key={`skeleton-${index}`}
                className="relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]"
            >
                <div className="w-10 h-10 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-lg bg-gray-600 animate-pulse mt-2" />
                <p className="text-sm mt-4 sm:mt-5 xl:mt-6 w-full bg-gray-700 h-4 animate-pulse" />
            </div>
        ));
    };

    // Handle player click to show options menu
    const handlePlayerClick = (player) => {
        console.log('Clicked player:', player);
        if (showOptions?.player._id === player.player._id) {
            setShowOptions(null);
        } else {
            setShowOptions(player);
        }
    };

    // Close options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(null);
            }
        };

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    // Handle switch click
    const handleSwitchClick = (player) => {
        if (selectedPlayer) {
            performSwitch(selectedPlayer, player);
            setSelectedPlayer(null);
            setShowOptions(null);
        } else {
            setSelectedPlayer(player);
            setShowOptions(null);
        }
    };

    const handleViewClick = (player) => {
        console.log('View player details:', player);
        setViewPlayer(player.player);
        setPlayerModalShow(true);
        setShowOptions(null);
    };

    // Perform switch logic
    const performSwitch = async (player1, player2) => {
        let updatedPlayers;
        console.log("Before switch: ", players);
        console.log("Switching player1:", player1, "with player2:", player2);

        if (player1.in_team === player2.in_team) {
            // Swap players in the same category (lineup or bench)
            updatedPlayers = players.map((p) => {
                if (p.player._id === player1.player._id) {
                    return { ...player2 };
                }
                if (p.player._id === player2.player._id) {
                    return { ...player1 };
                }
                return p;
            });
        } else {
            // Swap between lineup and bench
            updatedPlayers = players.map((p) => {
                if (p.player._id === player1.player._id) return { ...player1, in_team: !player1.in_team };
                if (p.player._id === player2.player._id) return { ...player2, in_team: !player2.in_team };
                return p;
            });
        }

        // Update players state
        setPlayers(updatedPlayers);
        console.log("Updated players:", updatedPlayers);

        // Prepare the update payload
        const updatePayload = {
            players: updatedPlayers.map((p) => ({
                _id: p._id,  // Use the existing _id of the player object
                player: p.player,  // Ensure ObjectId reference is preserved
                in_team: p.in_team,
                captain: p.captain,
                vice_captain: p.vice_captain
            }))
        };

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyteam/${team._id}`,
                updatePayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.error) {
                console.error("Error updating team:", response.data.message);
                addAlert("Failed to update team. Please try again.", "error");
            } else {
                console.log("Team updated successfully:", response.data.data);
                addAlert("Team updated successfully!", "success");

                // Re-fetch the updated team details
                fetchTeamDetails(team._id);
            }
        } catch (error) {
            console.error("Error sending update request:", error);
            addAlert("An error occurred while updating the team.", "error");
        }

        // Clear selected player and options
        setSelectedPlayer(null);
        setShowOptions(null);
    };

    // Render options menu
    const renderOptionsMenu = (player) => (
        <div ref={optionsRef} className="absolute bottom-0 bg-[#1d374a] w-full text-white rounded-lg shadow-md z-50 text-xs sm:text-base">
            <button
                className={`${player === selectedPlayer ? "py-4" : "py-2"} hover:text-[#ff8a00] hover:bg-[#162631] w-full text-center`}
                onClick={() => handleViewClick(player)}
            >
                View
            </button>
            {player != selectedPlayer &&
                <button
                    className="py-2 hover:text-[#ff8a00] hover:bg-[#162631] w-full text-center"
                    onClick={() => handleSwitchClick(player)}
                >
                    {selectedPlayer ? "Switch with" : "Switch"}
                </button>
            }
        </div>
    );

    const positionIcon = (position) => {
        const positionStyles = {
            Attacker: { bg: 'bg-[#D3E4FE]', text: 'A' },
            Midfielder: { bg: 'bg-[#D5FDE1]', text: 'M' },
            Defender: { bg: 'bg-[#F8E1FF]', text: 'D' },
            Goalkeeper: { bg: 'bg-[#FEF9B6]', text: 'G' },
        };

        const { bg, text } = positionStyles[position] || { bg: 'bg-gray-500', text: '?' };

        return (
            <div
                className={`${bg} w-4 h-4 md:w-5 md:h-5 text-black font-bold flex items-center justify-center text-xs md:text-sm my-4 rounded-full `}
            >
                {text}
            </div>
        );
    };

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 items-center text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            {(!matches || !team || !players || !pitchViewList || !standings) ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-6 w-full">
                    {/* Left: Pitch/List View */}
                    <div className="col-span-5 lg:col-span-3 bg-[#0C1922] rounded-xl p-2 py-6 sm:p-6  relative">
                        {/* Header Section */}
                        <div className="rounded-lg flex flex-col relative w-full ">
                            {/* Team Stats */}
                            <div className="flex items-center w-full space-x-4 px-2 sm:px-0 pb-10 sm:pb-8 md:pb-4">
                                <div className="cols-span-2 text-white rounded-md flex items-center justify-center font-bold text-center overflow-hidden">
                                    <img src={team.team_image_path ? team.team_image_path : "/images/default_team_logo.png"} alt="Team Logo" className="w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16 xl:w-24 xl:h-24 object-cover " />
                                </div>
                                {/* Team Name */}
                                <div className={`mt-1 text-2xl md:text-3xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                    {team?.team_name || 'Your Team'}
                                </div>
                            </div>

                            {selectedLeague?.draftID?.state === "Ended" &&
                                <div className="absolute right-0 bottom-0 w-max px-2 sm:px-0" >
                                    {/* <h3 className={`text-3xl font-bold text-[#FF8A00] ${exo2.className}`}>Team</h3> */}
                                    <div className="flex items-center rounded-lg overflow-hidden text-xs sm:text-sm xl:text-base">
                                        <button
                                            className={`${view === 'List' ? 'bg-[#ff8800b7]' : 'bg-[#1d374a]'} text-white px-5 py-1`}
                                            onClick={() => setView('List')}
                                        >
                                            List View
                                        </button>
                                        <button
                                            className={`${view === 'Pitch' ? 'bg-[#ff8800b7]' : 'bg-[#1d374a]'} text-white px-5 py-1`}
                                            onClick={() => setView('Pitch')}
                                        >
                                            Pitch View
                                        </button>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="bg-[#0C1922] rounded-xl mt-3 md:mt-6">
                            {view === 'Pitch' ? (
                                <div className="relative">
                                    <div className={`flex flex-col gap-2 ${selectedLeague?.draftID?.state !== "Ended" ? 'blur-sm' : ''}`}>
                                        {/* Pitch layout */}
                                        <div className="py-6 px-0 sm:px-4 text-white rounded-lg border border-[#1d374a] bg-[#0c1922] pitch-view">
                                            <div className="flex flex-col gap-4">
                                                {/* Goalkeeper */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Goalkeeper.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                </div>

                                                {/* Defenders */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Defender.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                </div>

                                                {/* Midfielders */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Midfielder.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                </div>

                                                {/* Attackers */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Attacker.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(2, pitchViewList.lineup.Attacker.length)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Substitute Players */}
                                        <div className='w-full flex flex-col py-3 px-4 bg-[#071117] rounded-lg'>
                                            <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                {pitchViewList.bench.map((player) => (
                                                    <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                        <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                        <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                        {/* {player.captain && (
                                                            <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                C
                                                            </span>
                                                        )}
                                                        {player.vice_captain && !player.captain && (
                                                            <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                VC
                                                            </span>
                                                        )} */}
                                                        <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                            {player.player.common_name}
                                                        </p>
                                                        <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                            {player.player.position_name}
                                                        </p>
                                                        {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                    </div>
                                                ))}
                                                {renderSkeletons(4, pitchViewList.bench.length)}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedLeague?.draftID?.state !== "Ended" && (
                                        <div className='ribbon-2 text-base xl:text-xl text-[#ff7A00] text-center'>
                                            Drafting not completed yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // List View
                                <div className="relative w-full overflow-hidden rounded-lg border border-[#1d374a] bg-[#0C1922]">
                                    <div className="overflow-x-auto overflow-y-auto scrollbar">
                                        <table className="w-full text-left text-white text-xs sm:text-sm xl:text-base">
                                            <thead className="bg-[#1d374a] sticky top-0 z-10">
                                                <tr className="text-center">
                                                    <th className="p-2 text-left pl-4">Player</th>
                                                    <th className="p-2">Team</th>
                                                    <th className="p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Main positions */}
                                                {["Goalkeeper", "Defender", "Midfielder", "Attacker"].map((pos) => (
                                                    pitchViewList.lineup[pos].length > 0 && (
                                                        <React.Fragment key={pos}>
                                                            {/* Section Heading */}
                                                            <tr>
                                                                <td colSpan="3" className="py-2 px-4 text-left font-bold bg-[#192a37] text-[#FF8A00] uppercase text-xs sm:text-sm">
                                                                    {pos}
                                                                </td>
                                                            </tr>
                                                            {pitchViewList.lineup[pos].map((player) => (
                                                                <tr key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "bg-[#ff880025]" : "bg-transparent"} border-b border-[#1d374a] text-center items-center justify-center`}>
                                                                    {/* Player Name + Image */}
                                                                    <td className="px-2 text-left truncate max-w-28 sm:max-w-none">
                                                                        <div className="flex items-center space-x-2">
                                                                            {player.player.image_path && (
                                                                                <img
                                                                                    src={player.player.image_path}
                                                                                    alt={player.player.team_name || 'Team Logo'}
                                                                                    className="w-8 h-8 sm:w-10 sm:h-10 my-2 rounded-lg"
                                                                                />
                                                                            )}
                                                                            <div className="overflow-hidden">
                                                                                <p className="font-bold truncate">{player.player.common_name}</p>
                                                                            </div>
                                                                            <div className='flex items-center justify-center'>{positionIcon(player.player.position_name)}</div>
                                                                        </div>
                                                                    </td>
                                                                    {/* Team Logo */}
                                                                    <td className="p-2 text-center truncate">
                                                                        <img src={player.player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto shadow-md" />
                                                                    </td>
                                                                    {/* Controls */}
                                                                    <td className="p-2 text-center truncate">
                                                                        <div className="flex justify-center items-center gap-2">
                                                                            <button
                                                                                className="bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white"
                                                                                onClick={() => handleViewClick(player)}
                                                                                type="button"
                                                                            >
                                                                                View
                                                                            </button>
                                                                            <button
                                                                                className={`${selectedPlayer === player ? "bg-[#0b151c] opacity-50 cursor-default hover:bg-[#0b151c] hover:text-white" : "bg-[#1d374a]"} border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white`}
                                                                                onClick={() => { setSelectedPlayer(player); handleSwitchClick(player) }}
                                                                                type="button"
                                                                                disabled={selectedPlayer && selectedPlayer.player._id === player.player._id}
                                                                            >
                                                                                {selectedPlayer ? "Switch with" : "Switch"}
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    )
                                                ))}

                                                {/* Substitutes */}
                                                {pitchViewList.bench.length > 0 && (
                                                    <React.Fragment>
                                                        <tr>
                                                            <td colSpan="3" className="py-2 px-4 text-left font-bold bg-[#192a37] text-[#FF8A00] uppercase text-xs sm:text-sm">
                                                                Substitutes
                                                            </td>
                                                        </tr>
                                                        {pitchViewList.bench.map((player) => (
                                                            <tr key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "bg-[#ff880025]" : "bg-transparent"} border-b border-[#1d374a] text-center items-center justify-center`}>
                                                                {/* Player Name + Image */}
                                                                {/* Player Name + Image */}
                                                                <td className="px-2 text-left truncate max-w-28 sm:max-w-none">
                                                                    <div className="flex items-center space-x-2">
                                                                        {player.player.image_path && (
                                                                            <img
                                                                                src={player.player.image_path}
                                                                                alt={player.player.team_name || 'Team Logo'}
                                                                                className="w-8 h-8 sm:w-10 sm:h-10 my-2 rounded-lg"
                                                                            />
                                                                        )}
                                                                        <div className="overflow-hidden">
                                                                            <p className="font-bold truncate">{player.player.common_name}</p>
                                                                        </div>
                                                                        <div className='flex items-center justify-center'>{positionIcon(player.player.position_name)}</div>
                                                                    </div>
                                                                </td>
                                                                {/* Team Logo */}
                                                                <td className="p-2 text-center truncate">
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto shadow-md" />
                                                                </td>
                                                                {/* Controls */}
                                                                <td className="p-2 text-center truncate">
                                                                    <div className="flex justify-center items-center gap-2">
                                                                        <button
                                                                            className="bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white"
                                                                            onClick={() => handleViewClick(player)}
                                                                            type="button"
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <button
                                                                            className={`${selectedPlayer === player ? "bg-[#0b151c] opacity-50 cursor-default hover:bg-[#0b151c] hover:text-white" : "bg-[#1d374a]"} border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white`}
                                                                            onClick={() => { setSelectedPlayer(player); handleSwitchClick(player) }}
                                                                            type="button"
                                                                            disabled={selectedPlayer && selectedPlayer.player._id === player.player._id}
                                                                        >
                                                                            {selectedPlayer ? "Switch with" : "Switch"}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Premier League Table, Fixtures, Ground Info */}
                    <div className="col-span-5 lg:col-span-2 flex flex-col gap-6">
                        {/* Premier League Standings */}
                        <div className="bg-[#0C1922] rounded-xl p-4 sm:p-6">
                            <h2 className={`text-xl xl:text-2xl font-bold mb-4 ${exo2.className}`}>Premier League Table</h2>
                            <div className="overflow-hidden">
                                {/* Wrap the table in a container with fixed height */}
                                <div className="h-72 overflow-y-auto scrollbar">
                                    <table className="w-full text-gray-300 text-xs sm:text-sm xl:text-base">
                                        {/* Table Header */}
                                        <thead className="sticky top-0 bg-[#0C1922] border-b border-[#1d374a]" >
                                            <tr className="text-left">
                                                <th className="py-2 px-2 font-semibold text-left">Club</th>
                                                <th className="py-2 px-2 text-center font-semibold">P</th>
                                                <th className="py-2 px-2 text-center font-semibold">W</th>
                                                <th className="py-2 px-2 text-center font-semibold">D</th>
                                                <th className="py-2 px-2 text-center font-semibold">L</th>
                                                <th className="py-2 px-2 text-center font-semibold">GF</th>
                                                <th className="py-2 px-2 text-center font-semibold">GA</th>
                                                <th className="py-2 px-2 text-center font-semibold">GD</th>
                                                <th className="py-2 px-2 text-center font-semibold">Pts</th>
                                            </tr>
                                        </thead>
                                        {/* Table Body */}
                                        <tbody>
                                            {standings ?
                                                (standings.length > 0 ? (
                                                    standings.map((team, index) => (
                                                        <tr
                                                            key={team._id}
                                                            className='border-b border-[#1d374a]'
                                                        >
                                                            <td className="py-2 flex items-center space-x-2 max-w-40">
                                                                <img
                                                                    src={team.image_path}
                                                                    alt={`${team.name} logo`}
                                                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                                                                />
                                                                <span className="truncate">{team.name}</span>
                                                            </td>
                                                            <td className="py-2 px-2 text-center">{team.games_played}</td>
                                                            <td className="py-2 px-2 text-center">{team.wins}</td>
                                                            <td className="py-2 px-2 text-center">{team.draws}</td>
                                                            <td className="py-2 px-2 text-center">{team.lost}</td>
                                                            <td className="py-2 px-2 text-center">{team.goals_scored}</td>
                                                            <td className="py-2 px-2 text-center">{team.goals_conceded}</td>
                                                            <td className="py-2 px-2 text-center">
                                                                {team.goals_scored - team.goals_conceded}
                                                            </td>
                                                            <td className="py-2 px-2 text-center font-bold">{team.points}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr className="h-64">
                                                        <td colSpan="10" className="text-center py-4 text-gray-400 text-sm sm:text-base">
                                                            No teams found in the Premier League.
                                                        </td>
                                                    </tr>
                                                )
                                                ) : (
                                                    <tr className="h-64">
                                                        <td colSpan="10" className="text-center text-gray-400 text-sm lg:text-base">
                                                            Loading Premier League Table...
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Gameweek Fixtures */}
                        <div className="bg-[#0C1922] rounded-xl p-4 sm:p-6 ">
                            <h2 className={`text-xl xl:text-2xl font-bold mb-0 ${exo2.className}`}>{`Gameweek ${gameweekName || ''}`}</h2>
                            {gameweekDetails?.starting_at ? (
                                <p className={`text-xs sm:text-sm xl:text-base text-gray-400 ${exo2.className}`}>
                                    {`Gameweek starts: ${new Date(
                                        gameweekDetails.starting_at
                                    ).toLocaleString('en-US', {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        timeZone: 'Asia/Dhaka'
                                    })}`}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm lg:text-base">Loading gameweek details...</p>
                            )}
                            {matches ?
                                (
                                    matches.length > 0 ? (
                                        <div className="w-full text-gray-300 mt-4 ">
                                            <div className="flex justify-between border-b border-[#1d374a] py-2 px-4 text-xs sm:text-sm xl:text-base">
                                                <div className="w-2/5 text-left font-bold">Home</div>
                                                <div className="w-1/5 text-center font-bold">Time</div>
                                                <div className="w-2/5 text-right font-bold">Away</div>
                                            </div>
                                            <div className='h-72 overflow-y-auto scrollbar'>
                                                {matches.map((match) => {
                                                    const homeTeam = match.teams.find((team) => team.location === 'home');
                                                    const awayTeam = match.teams.find((team) => team.location === 'away');

                                                    return (
                                                        <div
                                                            key={match.id}
                                                            className="flex justify-between items-center border-b border-[#1d374a] py-2 px-2 text-xs sm:text-sm xl:text-base"
                                                        >
                                                            {/* Home Team */}
                                                            <div className="w-2/5 flex items-center space-x-2">
                                                                <img
                                                                    src={homeTeam?.image_path}
                                                                    alt={homeTeam?.team_name}
                                                                    className="w-6 h-6 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                                                                />
                                                                <span className="truncate text-ellipsis overflow-hidden">
                                                                    {homeTeam?.team_name || 'N/A'}
                                                                </span>
                                                            </div>

                                                            {/* Time */}
                                                            <div className="w-1/5 text-center">
                                                                {match.state !== 'Not Started'
                                                                    ? `${match.scores.find(
                                                                        (score) =>
                                                                            score.score_type_name === 'Current' &&
                                                                            score.team_id === homeTeam?.team_id
                                                                    )?.goals ?? 0} - ${match.scores.find(
                                                                        (score) =>
                                                                            score.score_type_name === 'Current' &&
                                                                            score.team_id === awayTeam?.team_id
                                                                    )?.goals ?? 0}`
                                                                    : new Date(match.starting_at).toLocaleString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        weekday: 'long',
                                                                        day: '2-digit',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        timeZone: 'Asia/Dhaka'
                                                                    })}
                                                            </div>

                                                            {/* Away Team */}
                                                            <div className="w-2/5 flex items-center justify-end space-x-2">
                                                                <span className="truncate text-ellipsis overflow-hidden text-right">
                                                                    {awayTeam?.team_name || 'N/A'}
                                                                </span>
                                                                <img
                                                                    src={awayTeam?.image_path}
                                                                    alt={awayTeam?.team_name}
                                                                    className="w-6 h-6 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="flex items-center justify-center text-center h-80 text-gray-400 mt-4">No matches found for this Gameweek.</p>
                                    )
                                ) : (
                                    <p className="flex items-center justify-center text-center h-80 text-gray-400 mt-4">Loading fixtures...</p>
                                )}
                        </div>

                        {/* Ground Info */}
                        <div className="bg-[#0C1922] rounded-xl p-4 sm:p-6">
                            <h2 className="text-xl xl:text-2xl font-bold mb-4 text-[#FF8A00]">Team Ground</h2>
                            <div className="h-48 sm:h-56 rounded-xl overflow-hidden relative">
                                {team?.ground_image_path ? (
                                    <img
                                        src={team.ground_image_path}
                                        alt={team.ground_name || "Ground Image"}
                                        className="w-full h-full object-cover rounded-xl shadow-lg"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-[#222222] rounded-xl text-gray-300 text-sm sm:text-base">
                                        No Ground Image Available
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-4 py-2">
                                    <p className="text-white font-semibold text-sm sm:text-base">
                                        {team?.ground_name || "Unknown Ground"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {playerModalShow && <PlayerModal player={viewPlayer} onClose={() => setPlayerModalShow(false)} />}
        </div >
    );
};

export default TeamPage;
