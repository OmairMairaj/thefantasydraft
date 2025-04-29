'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { FaBars, FaChevronDown, FaFutbol } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertContext/AlertContext";


const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const TeamPage = () => {
    const [leagueId, setLeagueId] = useState(null);
    const [user, setUser] = useState(null);
    const [team, setTeam] = useState(null);
    const [pitchView, setPitchView] = useState(true); // Toggle between Pitch and List views
    const [players, setPlayers] = useState();
    const [leagueTable, setLeagueTable] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [standings, setStandings] = useState();
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [matches, setMatches] = useState();
    const [totalPages, setTotalPages] = useState(1);
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
    const [showOptions, setShowOptions] = useState(null); // Track clicked player for showing options
    const optionsRef = useRef(null);

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
                }
            }
        }
    }, []);

    useEffect(() => {
        if (gameweekName) {
            console.log("Fetching data for gameweek: ", gameweekName);
            fetchMatches(gameweekName);
            fetchGameweekDetails(gameweekName);
        }
    }, [gameweekName]);

    const fetchCurrentGameweek = () => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`, { cache: 'no-store' })
            .then((response) => {
                console.log("current")
                console.log(response)
                if (!response.data.error) {
                    const currentGameweek = response.data.data;
                    console.log(currentGameweek);
                    if (currentGameweek) {
                        setGameweekName(parseInt(currentGameweek.name, 10)); // Convert gameweek name to integer
                        setGameweekDetails(currentGameweek);
                        fetchTotalGameweeks();
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

    const fetchTotalGameweeks = () => {
        axios
            .get(`/api/gameweek/count`)
            .then((response) => {
                setTotalPages(response.data.totalGameweeks);
                console.log("Total gameweeks: ", response.data.totalGameweeks);
            })
            .catch((err) => console.error("Error fetching total gameweeks: ", err));
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
            .get(process.env.NEXT_PUBLIC_BACKEND_URL + `/standing`)
            .then((response) => {
                console.log(response.data.data);
                setStandings(response.data.data);
            })
            .catch((err) => console.error("Error fetching table data: ", err));
    };

    const fetchUserTeamForLeague = async (userEmail, leagueId) => {
        try {
            // Step 1: Get all leagues for the user
            const leagueResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyleague?email=${userEmail}`);

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
            const teamResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyteam/${teamId}`);
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
                className="relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]"
            >
                <div className="w-20 h-20 rounded-lg bg-gray-600 animate-pulse mt-2" />
                <p className="text-sm mt-6 w-full bg-gray-700 h-4 animate-pulse" />
            </div>
        ));
    };

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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyteam/${team._id}`,
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
        <div ref={optionsRef} className="absolute bottom-0 bg-[#1c1c1cc9] w-full text-white rounded-lg shadow-md z-50">
            <button
                className="py-1 hover:text-[#ff8a00] hover:bg-[#1c1c1cde] w-full text-center"
                onClick={() => alert(`Viewing ${player.player.common_name}`)}
            >
                View
            </button>
            <button
                className="py-1 hover:text-[#ff8a00] hover:bg-[#1c1c1cde] w-full text-center"
                onClick={() => handleSwitchClick(player)}
            >
                {selectedPlayer ? "Switch with" : "Switch"}
            </button>
        </div>
    );

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 items-center text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            {/* Sidebar */}
            {/* <div
                className={`${sidebarCollapsed ? 'w-16' : 'w-64'} absolute left-0 top-0 transition-all duration-300 flex flex-col items-center px-2 py-4`}
            >
                <nav className="flex flex-col space-y-4 w-full">
                    <Link href="/team" className="flex items-center space-x-2">
                        <FaFutbol />
                        {!sidebarCollapsed && <span>My Team</span>}
                    </Link>
                    <Link href="/transfers" className="flex items-center space-x-2">
                        <FaFutbol />
                        {!sidebarCollapsed && <span>Transfers</span>}
                    </Link>
                    <Link href="/matchcenter" className="flex items-center space-x-2">
                        <FaFutbol />
                        {!sidebarCollapsed && <span>Match Center</span>}
                    </Link>
                    <Link href="/leaguetable" className="flex items-center space-x-2">
                        <FaFutbol />
                        {!sidebarCollapsed && <span>League Table</span>}
                    </Link>
                </nav>
            </div> */}
            {(!matches || !team || !players || !pitchViewList || !standings) ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-6 w-full">
                    {/* Left: Pitch/List View */}
                    <div className="col-span-3 bg-[#1C1C1C] rounded-xl p-6 relative">
                        {/* Header Section */}
                        <div className="rounded-lg flex flex-col relative w-full ">
                            {/* Team Stats */}
                            <div className="flex items-center w-full space-x-4 px-6">
                                <div className=" cols-span-2 text-white rounded-md flex items-center justify-center font-bold text-center overflow-hidden">
                                    {team?.team_image_path ? (
                                        <img src={team.team_image_path} alt="Team Logo" className="w-28 h-28 object-cover" />
                                    ) : (
                                        <img src={'/images/placeholder.png'} alt="Team Logo" className="p-7 w-28 h-28 object-cover border border-gray-600 rounded-md" />
                                    )}
                                </div>
                                {/* Team Name */}
                                <div className={`mt-1 text-3xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                    {team?.team_name || 'Your Team'}
                                </div>
                            </div>

                            <div className="absolute right-0 bottom-0 w-max" >
                                {/* <h3 className={`text-3xl font-bold text-[#FF8A00] ${exo2.className}`}>Team</h3> */}
                                <div className="flex items-center  rounded-lg overflow-hidden">
                                    <button
                                        className={`${view === 'List' ? 'bg-[#ff8800b7]' : 'bg-[#2c2c2c]'} text-white px-5 py-1`}
                                        onClick={() => setView('List')}
                                    >
                                        List View
                                    </button>
                                    <button
                                        className={`${view === 'Pitch' ? 'bg-[#ff8800b7]' : 'bg-[#2c2c2c]'} text-white px-5 py-1`}
                                        onClick={() => setView('Pitch')}
                                    >
                                        Pitch View
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1C1C1C] rounded-xl mt-6">


                            {view === 'Pitch' ? (
                                <div className="relative">
                                    <div className={`flex flex-col gap-2 ${selectedLeague?.draftID?.state !== "Ended" ? 'blur-sm' : ''}`}>
                                        {/* Pitch layout */}
                                        <div className="py-6 px-4 text-white rounded-lg border border-[#333333] bg-[#1C1C1C] pitch-view">
                                            <div className="flex flex-col gap-4">
                                                {/* Goalkeeper */}
                                                <div className="flex justify-center items-center gap-4">
                                                    {pitchViewList.lineup.Goalkeeper.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-8 h-8 rounded-full shadow-md" />

                                                            {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                </div>

                                                {/* Defenders */}
                                                <div className="flex justify-center items-center gap-4">
                                                    {pitchViewList.lineup.Defender.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-8 h-8 rounded-full shadow-md" />

                                                            {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                </div>

                                                {/* Midfielders */}
                                                <div className="flex justify-center items-center gap-4">
                                                    {pitchViewList.lineup.Midfielder.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-8 h-8 rounded-full shadow-md" />

                                                            {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-xs">
                                                                {player.player.position_name}
                                                            </p>
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                        </div>
                                                    ))}
                                                    {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                </div>

                                                {/* Attackers */}
                                                <div className="flex justify-center items-center gap-4">
                                                    {pitchViewList.lineup.Attacker.map((player) => (
                                                        <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`} onClick={() => handlePlayerClick(player)}>
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-8 h-8 rounded-full shadow-md" />

                                                            {player.captain && (
                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    C
                                                                </span>
                                                            )}
                                                            {player.vice_captain && !player.captain && (
                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                    VC
                                                                </span>
                                                            )}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-xs">
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
                                        <div className='w-full flex flex-col py-3 px-4 bg-[#131313] rounded-lg'>
                                            <div className="flex justify-center items-center gap-4">
                                                {pitchViewList.bench.map((player) => (
                                                    <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`} onClick={() => handlePlayerClick(player)}>
                                                        <img src={player.player.image_path} alt={player.player.name} className="w-20 rounded-lg" />
                                                        <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-8 h-8 rounded-full shadow-md" />

                                                        {player.captain && (
                                                            <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                C
                                                            </span>
                                                        )}
                                                        {player.vice_captain && !player.captain && (
                                                            <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                VC
                                                            </span>
                                                        )}
                                                        <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap">
                                                            {player.player.common_name}
                                                        </p>
                                                        <p className="px-2 truncate max-w-full whitespace-nowrap text-xs">
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
                                        <div className='ribbon-2 text-3xl text-[#ff7A00] text-center'>
                                            Drafting not completed yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // List View
                                <div className="relative w-full overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                    <div className="overflow-x-auto overflow-y-auto scrollbar">
                                        <table className="w-full text-left text-white">
                                            <thead className="bg-[#2f2f2f] sticky top-0 z-10">
                                                <tr className="text-center">
                                                    <th className="p-2 text-left pl-4">Player</th>
                                                    {/* <th className="p-2">Role</th> */}
                                                    <th className="p-2">Team</th>
                                                    <th className="p-2">Position</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {players.map((player) => (
                                                    <tr key={player.player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                        <td className="px-2 text-left truncate">
                                                            <div className="flex items-center space-x-2">
                                                                {player.player.image_path && (
                                                                    <img
                                                                        src={player.player.image_path}
                                                                        alt={player.player.team_name || 'Team Logo'}
                                                                        className="w-10 h-10 my-2 rounded-lg"
                                                                    />
                                                                )}
                                                                <div className="overflow-hidden">
                                                                    <p className="font-bold truncate">{player.player.common_name}
                                                                        <span className='p-2'>
                                                                            {player.captain && <span className="bg-yellow-500 text-black px-2 py-1 rounded-md text-xs">C</span>}
                                                                            {player.vice_captain && !player.captain && <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs">VC</span>}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* <td className="p-2 text-center truncate">
                                                        {player.captain && <span className="bg-yellow-500 text-black px-2 py-1 rounded-md text-xs">Captain</span>}
                                                        {player.vice_captain && !player.captain && <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs">Vice Captain</span>}
                                                    </td> */}
                                                        <td className="p-2 text-center truncate">
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="w-8 h-8 rounded-full mx-auto shadow-md" />
                                                        </td>
                                                        <td className="p-2 text-center truncate">
                                                            {player.player.position_name}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {selectedLeague?.draftID?.state !== "Ended" && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-gray-400">
                                                            No players found in Team.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right: Premier League Table, Fixtures, Ground Info */}
                    <div className="col-span-2 flex flex-col gap-6">
                        {/* Premier League Standings */}
                        <div className="bg-[#1C1C1C] rounded-xl p-6">
                            <h2 className={`text-2xl font-bold mb-4 ${exo2.className}`}>Premier League Table</h2>
                            <div className="overflow-hidden">
                                {/* Wrap the table in a container with fixed height */}
                                <div className="h-80 overflow-y-auto scrollbar">
                                    <table className="w-full text-gray-300">
                                        {/* Table Header */}
                                        <thead className="sticky top-0 bg-[#1C1C1C] border-b border-gray-600" >
                                            <tr className="text-left">
                                                {/* <th className="py-2 px-2 font-semibold text-[#FF8A00] text-center">#</th> */}
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
                                                            className='border-b border-gray-600'
                                                        >
                                                            {/* <td className="py-2 px-2 text-center">{team.position}</td> */}
                                                            <td className="py-2 flex items-center space-x-2">
                                                                <img
                                                                    src={team.image_path}
                                                                    alt={`${team.name} logo`}
                                                                    className="w-10 h-10 rounded-full flex-shrink-0"
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
                                                        <td colSpan="10" className="text-center py-4 text-gray-400">
                                                            No teams found in the Premier League.
                                                        </td>
                                                    </tr>
                                                )
                                                ) : (
                                                    <tr className="h-64">
                                                        <td colSpan="10" className="text-center text-gray-400">
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
                        <div className="bg-[#1C1C1C] rounded-xl p-6">
                            <h2 className={`text-2xl font-bold mb-0 ${exo2.className}`}>{`Gameweek ${gameweekName || ''}`}</h2>
                            {gameweekDetails?.starting_at ? (
                                <p className={`text-gray-400 ${exo2.className}`}>
                                    {`Gameweek starts: ${new Date(
                                        gameweekDetails.starting_at
                                    ).toLocaleString('en-US', {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}`}
                                </p>
                            ) : (
                                <p className="text-gray-400">Loading gameweek details...</p>
                            )}

                            {matches ?
                                (
                                    matches.length > 0 ? (
                                        <div className="w-full text-gray-300 mt-4 ">
                                            <div className="flex justify-between border-b border-gray-600 pb-2 px-2 mr-1">
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
                                                            className="flex justify-between items-center border-b border-gray-600 py-2 px-2"
                                                        >
                                                            {/* Home Team */}
                                                            <div className="w-2/5 flex items-center space-x-2">
                                                                <img
                                                                    src={homeTeam?.image_path}
                                                                    alt={homeTeam?.team_name}
                                                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                                                />
                                                                <span className="truncate block text-ellipsis overflow-hidden whitespace-normal break-words">
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
                                                                        timeZone: 'Australia/Brisbane',
                                                                        weekday: 'short',
                                                                        hour: 'numeric',
                                                                        minute: '2-digit',
                                                                    })}
                                                            </div>

                                                            {/* Away Team */}
                                                            <div className="w-2/5 flex items-center justify-end space-x-2">
                                                                <span className="truncate block text-ellipsis overflow-hidden whitespace-normal break-words text-right">
                                                                    {awayTeam?.team_name || 'N/A'}
                                                                </span>
                                                                <img
                                                                    src={awayTeam?.image_path}
                                                                    alt={awayTeam?.team_name}
                                                                    className="w-10 h-10 rounded-full flex-shrink-0"
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
                        <div className="bg-[#1C1C1C] rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-4 text-[#FF8A00]">Team Ground</h2>
                            <div className="h-56 rounded-xl overflow-hidden relative">
                                {team?.ground_image_path ? (
                                    <img
                                        src={team.ground_image_path}
                                        alt={team.ground_name || "Ground Image"}
                                        className="w-full h-full object-cover rounded-xl shadow-lg"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-[#222222] rounded-xl text-gray-300">
                                        No Ground Image Available
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-4 py-2">
                                    <p className="text-white font-semibold text-lg">
                                        {team?.ground_name || "Unknown Ground"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default TeamPage;
