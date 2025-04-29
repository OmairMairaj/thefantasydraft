'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { FaBars, FaChevronDown, FaFutbol } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertContext/AlertContext";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import Image from 'next/image';
import { motion } from "framer-motion";
import PlayerModal from '@/components/PlayerModal/PlayerModal';
import FixtureModal from './components/FixtureModal';


const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const MatchCenter = () => {
    const [leagueId, setLeagueId] = useState(null);
    const [user, setUser] = useState(null);
    const [team, setTeam] = useState(null);
    const [pitchView, setPitchView] = useState(true); // Toggle between Pitch and List views
    const [players, setPlayers] = useState();
    const [leaguePoints, setLeaguePoints] = useState();
    const [leagueData, setLeagueData] = useState(null);
    const [leagueTable, setLeagueTable] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [standings, setStandings] = useState();
    const [matches, setMatches] = useState();
    const [totalPages, setTotalPages] = useState(1);
    const [userTeam, setUserTeam] = useState(null);
    const [leagueTeams, setLeagueTeams] = useState([]);
    const router = useRouter();
    const [gameweekName, setGameweekName] = useState(null);
    const [gameweekDetails, setGameweekDetails] = useState({});
    const [teamPoints, setTeamPoints] = useState(null);
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
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [openPlayerModal, setOpenPlayerModal] = useState(false);
    const [selectedFixture, setSelectedFixture] = useState(null);
    const [showFixtureModal, setShowFixtureModal] = useState(false);

    useEffect(() => {
        if (showFixtureModal || openPlayerModal) {
            document.body.style.overflow = 'hidden'; // Disable scrolling
        } else {
            document.body.style.overflow = 'auto'; // Enable scrolling back
        }

        // Cleanup when component unmounts (important if user navigates away)
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showFixtureModal, openPlayerModal]);


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
            // fetchMatches(gameweekName);
            fetchGameweekDetails(gameweekName);
        }
    }, [gameweekName]);

    const fetchCurrentGameweek = () => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`, { cache: 'no-store' })
            .then((response) => {
                if (!response.data.error) {
                    const currentGameweek = response.data.data;
                    if (currentGameweek) {
                        console.log("Current Gameweek Data: ", currentGameweek);
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

    // const fetchMatches = (gameweek) => {
    //     axios
    //         .get(`/api/match?gameweek=${gameweek}`)
    //         .then((response) => {
    //             setMatches(response.data.data);
    //             console.log(response.data.data);
    //         })
    //         .catch((err) => console.error("Error fetching match data: ", err));
    // };

    const fetchGameweekDetails = (gameweek) => {
        axios
            .get(`/api/gameweek/${gameweek}`)
            .then((response) => {
                console.log("GameWeek Details: ", response.data.data);
                setGameweekDetails(response.data.data);
            })
            .catch((err) => console.error("Error fetching gameweek data: ", err));
    };



    // useEffect(() => {
    //     // Fetch league and team data on load
    //     fetchStandings();
    // }, []);

    useEffect(() => {
        if (user?.email && leagueId) {
            fetchUserTeamForLeague(user.email, leagueId);
        }
    }, [user, leagueId]);

    useEffect(() => {
        if (team && team._id && gameweekDetails && gameweekDetails._id && leagueId) {
            fetchLeagueTeamPoints(leagueId, team._id, gameweekDetails._id);
        }
    }, [gameweekDetails, leagueId, team]);

    // const fetchStandings = () => {
    //     axios
    //         .get(process.env.NEXT_PUBLIC_BACKEND_URL + `/standing`)
    //         .then((response) => {
    //             console.log(response.data.data);
    //             setStandings(response.data.data);
    //         })
    //         .catch((err) => console.error("Error fetching table data: ", err));
    // };

    const fetchUserTeamForLeague = async (userEmail, leagueId) => {
        try {
            // Step 1: Get League Data
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyleague?leagueId=${leagueId}`);

            if (response.data && !response.data.error) {
                const league = response.data.data;
                setLeagueData(league);
                console.log(`League Data (leagueData): `, response.data.data);

                if (league) {
                    // Step 2: Find the user's team in the league
                    const userTeam = league.teams.find(team => team.user_email === userEmail);

                    if (userTeam) {
                        // Step 4: Fetch the fantasy team details using teamId
                        console.log("User's Team: ", userTeam.team);
                        setUserTeam(userTeam.team);
                        fetchTeamDetails(userTeam.team._id);


                    } else {
                        console.error("No team found for the user in this league.");
                        addAlert("No team found for the selected league.", "error");
                    }

                    const teams = league.teams;
                    console.log("League Teams: ", teams);
                    setLeagueTeams(teams);
                } else {
                    console.error("No matching league found.");
                    addAlert("No matching league found.", "error");
                }
            } else {
                console.error("Error fetching league Data: ", response.data.message);
                addAlert(response.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching league:', error);
            addAlert("An error occurred while fetching league.", "error");
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

    const fetchLeagueTeamPoints = async (league, team, gameweek) => {
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/points?teamID=` + team + `&leagueID=` + league + `&gameweekID=` + gameweek);
            if (response.data && !response.data.error) {
                console.log("Points Data", response.data.data);
                setLeaguePoints(response.data.data);
            } else {
                console.error("Error fetching league points : ", response.data.message);
                // addAlert(response.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching team details:', error);
            // addAlert("An error occurred while fetching team details.", "error");
        }
    };

    useEffect(() => {
        if (players && players.length == 15) {
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

    const closePlayerModal = () => {
        setSelectedPlayer(null);
        setOpenPlayerModal(false);
    };

    const closeFixtureModal = () => {
        setSelectedFixture(null);
        setShowFixtureModal(false);
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
    const handlePlayerClick = async (player) => {
        console.log("Clicked player:", player.player.common_name);
        console.log("Selected Player:", player.player);
        // alert(`Clicked player: ${player.player.common_name}`);
        const id = player.player._id;
        console.log(id);
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/player/with-points/${id}`);
            if (response.data && !response.data.error) {
                console.log("Player Data", response.data.data);

                setSelectedPlayer(response.data.data);
            } else {
                console.error("Error fetching player details: ", response.data.message);
                addAlert(response.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching player details:', error);
            addAlert("An error occurred while fetching team details.", "error");
        }
        setOpenPlayerModal(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setGameweekName(newPage);
        }
    };

    const handleTeamSelect = (team) => {
        if (selectedTeam?._id === team._id) {
            setSelectedTeam(null);
        } else {
            setSelectedTeam(team);
            fetchTeamDetails(team._id);
            setPlayers(null);
            setPitchViewList({
                lineup: {
                    Goalkeeper: [],
                    Defender: [],
                    Midfielder: [],
                    Attacker: [],
                },
                bench: [],
            });
        }
    };


    // Function to find the gameweek points of the team (for the selected gameweek)
    const getGameweekPoints = (players, gameweekID) => {
        console.log("Calculating gameweek points for team...");
        console.log(players, gameweekID);
        if (!players || !players?.player || players.length === 0 || !gameweekID) return 0;

        return players.reduce((total, player) => {
            if (player?.player) {
                const gameweekData = player.player.points.find(gw => gw.gameweek === gameweekID);
                return total + (gameweekData ? gameweekData.points : 0);
            }
        }, 0);
    };

    // Function to find the gameweek points of the captain (for the selected gameweek)
    const getCaptainGameweekPoints = (players) => {
        try {
            const captain = players.find(player => player.captain);
            if (!captain) return 0;
            return leaguePoints.players.find(x => x.playerDetails._id == captain.player._id).playerPoints
        }
        catch {
            return 0;
        }
    };

    // Function to find the total points of the team (all-time points)
    const getTotalPoints = (players) => {
        if (!players || !players?.player || players.length === 0) return 0;

        return players.reduce((total, player) => {
            if (player.player) {
                return total + player.player.points.reduce((sum, gw) => sum + gw.points, 0);
            }
        }, 0);
    };

    useEffect(() => {
        if (leagueData && gameweekName) {
            const fixtures = leagueData?.league_fixtures?.filter(fixture => fixture.gameweek == gameweekName);
            console.log("Fixtures: ", fixtures);
            setFixtures(fixtures);

            fetchPoints(fixtures);
        }
    }, [leagueData, gameweekName]);

    const fetchPoints = async (fixtures) => {
        if (!fixtures || fixtures.length === 0) return;

        try {
            const allTeamIds = fixtures.flatMap(f => f.teams.map(t => t._id));
            console.log("All Team ID's: ", allTeamIds);
            const pointsMap = {};

            await Promise.all(
                allTeamIds.map(async (teamId) => {
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/points/team?leagueID=${leagueId}&teamID=${teamId}&gameweekID=${gameweekDetails._id}`
                    );
                    if (res.data && !res.data.error) {
                        pointsMap[teamId] = res.data.data?.points || 0;
                    }
                })
            );

            setTeamPoints(pointsMap);
            console.log("Team Points (teamPoints): ", pointsMap);
        } catch (err) {
            console.error("Error fetching points: ", err);
        }
    };

    const handleFixtureClick = async (fixture) => {
        const teams = fixture.teams.flatMap((f) => f._id);
        setSelectedFixture(teams);
        setShowFixtureModal(true);
    }


    return (
        <div className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            {(!team || !pitchViewList || (leagueData?.league_configuration?.format === "Head to Head" && !teamPoints)) ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className='flex items-center justify-between w-full'>
                        <div className='flex flex-col mb-4'>
                            <h2 className="text-3xl font-bold">Game Week {gameweekName}</h2>
                            <p className="text-base">{gameweekDetails?.starting_at ? `Starts: ${new Date(gameweekDetails.starting_at).toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}` : "Loading Date...."}</p>
                        </div>
                        <div className="flex justify-center space-x-4 mb-4">
                            <button
                                className="fade-gradient w-40 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-start"
                                onClick={() => handlePageChange(gameweekName - 1)}
                                disabled={gameweekName === 1}
                            >
                                <FaChevronLeft className="mr-2" /> Previous
                            </button>
                            <button
                                className="fade-gradient w-40 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-center"
                                onClick={() => fetchCurrentGameweek()}
                            >
                                Current
                            </button>
                            <button
                                className="fade-gradient w-40 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-end"
                                onClick={() => handlePageChange(gameweekName + 1)}
                                disabled={gameweekName === totalPages}
                            >
                                Next <FaChevronRight className="ml-2" />
                            </button>
                        </div>
                    </div>

                    {leagueData?.league_configuration?.format === "Classic" && (
                        <div className="flex w-full transition-all duration-500 ease-in-out">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: selectedTeam ? "50%" : "100%" }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col"
                            >
                                {/* User Team Section */}
                                {userTeam && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        // initial={{ width: "50%" }}
                                        // animate={{ width: selectedTeam ? "100%" : "50%" }}
                                        // transition={{ duration: 0.5 }}
                                        className={`relative rounded-xl shadow-md shadow-gray-800 cursor-pointer transition-transform ease-in-out overflow-hidden 
                            ${selectedTeam?._id === userTeam._id ? "border border-orange-400" : ""}`}
                                        onClick={() => handleTeamSelect(userTeam)}
                                    >
                                        {/* Dark overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0C192250] to-[#0C1922]"></div>

                                        {/* Content */}
                                        <div className="relative z-10 flex items-center p-6  text-white">
                                            <img
                                                src={userTeam?.team_image_path || "/images/default_team_logo.png"}
                                                alt={userTeam?.team_name}
                                                className="object-cover w-28 h-28 rounded-md"
                                            />

                                            <div className="ml-4 space-y-2">
                                                <div className='flex flex-col'>
                                                    <h3 className="text-3xl font-bold">{userTeam.team_name}</h3>
                                                    <p>{userTeam.user_email}</p>
                                                </div>
                                                {/* <p>{`Points: ${(leaguePoints) ? leaguePoints.team.teamPoints : 0}`}</p> */}
                                                {/* <p>Form: {userTeam.form}</p> */}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* League Teams Section */}
                                <motion.div className="flex flex-wrap gap-6 w-full mt-6">
                                    {leagueTeams?.filter((t) => t.team._id !== userTeam._id).map((team) => {
                                        console.log(selectedTeam);
                                        console.log(selectedTeam?._id, team.team._id);
                                        return (
                                            <motion.div
                                                key={team.team._id}
                                                whileHover={{ scale: 1.02 }}
                                                className={`relative ${selectedTeam ? 'w-[48%]' : 'w-[32%]'} rounded-xl shadow-md shadow-gray-800 cursor-pointer transition-transform ease-in-out overflow-hidden  ${selectedTeam?._id === team.team._id ? "border border-orange-400" : ""}`}
                                                onClick={() => handleTeamSelect(team.team)}
                                            >
                                                {/* Dark overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#0C192250] to-[#0C1922]"></div>

                                                {/* Background Image */}
                                                {/* <div className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${userTeam?.ground_image_path})` }}>
                                                </div> */}

                                                {/* Content */}
                                                <div className="relative z-10 flex items-center p-3 text-white">
                                                    <img
                                                        src={team.team.team_image_path || "/images/default_team_logo.png"}
                                                        alt={team.team.team_name}
                                                        className="object-cover w-16 h-16 rounded-md"
                                                    />

                                                    <div className="ml-2 space-y-2">
                                                        <div className='flex flex-col'>
                                                            <h3 className="text-2xl font-bold">{team.team.team_name}</h3>
                                                            <p>{team.team.user_email}</p>
                                                        </div>
                                                        {/* <p>{`Points: ${getGameweekPoints(team.team.players, gameweekDetails._id)}`}</p> */}
                                                        {/* <p>Form: {team.team.form}</p> */}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </motion.div >
                            </motion.div>

                            {/* Right Section (PitchView/ListView) */}
                            {selectedTeam && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-1/2 transition-all duration-500 ease-in-out relative bg-gradient-to-r from-[#0C1922] to-[#0C192250] p-6 rounded-xl ml-4"
                                >

                                    <div className="rounded-lg flex flex-col items-center w-full ">
                                        {/* Team Stats */}
                                        <div className="flex items-center w-full space-x-4">

                                            <div className="text-white flex items-center justify-center font-bold text-center overflow-hidden">
                                                {selectedTeam?.team_image_path ? (
                                                    <img src={selectedTeam.team_image_path || "/images/default_team_logo.png"} alt="Team Logo" className="w-32 h-32 object-cover rounded-md" />
                                                ) : (
                                                    <img src={'/images/default_team_logo.png'} alt="Team Logo" className="w-32 h-32 object-cover rounded-md" />
                                                )}
                                            </div>
                                            <div className='flex flex-col space-y-4 w-3/4 '>
                                                {/* Team Name */}
                                                <div className={`mt-1 text-3xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                                    {selectedTeam?.team_name || 'Your Team'}
                                                </div>
                                                <div className='flex items-center justify-between'>
                                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                                        <p className='text-lg'>GameWeek Points</p>
                                                        <p className='text-lg font-semibold'>{(leaguePoints) ? leaguePoints.team.teamPoints : 0}</p>
                                                    </div>
                                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                                        <p className='text-lg'>Captain Points</p>
                                                        <p className='text-lg font-semibold'>{leaguePoints ? getCaptainGameweekPoints(players) : 0}</p>
                                                    </div>
                                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                                        <p className='text-lg'>Total Points</p>
                                                        <p className='text-lg font-semibold'>{(leaguePoints) ? leaguePoints.team.teamPoints : 0}</p>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>


                                    </div>

                                    <div className="rounded-xl">
                                        <div className="flex justify-end my-4" >
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

                                        {view === 'Pitch' ? (
                                            <div className="relative">
                                                <div className={`flex flex-col gap-2 ${players?.length === 0 ? 'blur-sm' : ''}`}>
                                                    {/* Pitch layout */}
                                                    <div className="py-6 px-4 text-white rounded-lg border border-[#333333] bg-[#1C1C1C] pitch-view">
                                                        <div className="flex flex-col gap-4">
                                                            {/* Goalkeeper */}
                                                            <div className="flex justify-center items-center gap-4">
                                                                {pitchViewList.lineup.Goalkeeper.map((player) => {
                                                                    // Find the specific gameweek points for the current gameweek
                                                                    const gameweekPoints = player.player.points.find(
                                                                        (p) => p.gameweek === gameweekDetails._id
                                                                    );
                                                                    return (
                                                                        <div key={player.player._id} className={`${selectedPlayer?._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388] cursor-pointer hover:scale-[1.05]`} onClick={() => handlePlayerClick(player)}>
                                                                            <img src={player.player.image_path} alt={player.player.name} className="w-16 rounded-lg" />
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
                                                                            <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                                            </p>

                                                                        </div>
                                                                    )
                                                                })}
                                                                {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                            </div>

                                                            {/* Defenders */}
                                                            <div className="flex justify-center items-center gap-4">
                                                                {pitchViewList.lineup.Defender.map((player) => {
                                                                    // Find the specific gameweek points for the current gameweek
                                                                    const gameweekPoints = player.player.points.find(
                                                                        (p) => p.gameweek === gameweekDetails._id
                                                                    );
                                                                    return (
                                                                        <div key={player.player._id} className={`${selectedPlayer?._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388] cursor-pointer hover:scale-[1.05]`} onClick={() => handlePlayerClick(player)}>
                                                                            <img src={player.player.image_path} alt={player.player.name} className="w-16 rounded-lg" />
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
                                                                            <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                })}
                                                                {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                            </div>

                                                            {/* Midfielders */}
                                                            <div className="flex justify-center items-center gap-4">
                                                                {pitchViewList.lineup.Midfielder.map((player) => {
                                                                    // Find the specific gameweek points for the current gameweek
                                                                    const gameweekPoints = player.player.points.find(
                                                                        (p) => p.gameweek === gameweekDetails._id
                                                                    );
                                                                    return (
                                                                        <div key={player.player._id} className={`${selectedPlayer?._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388] cursor-pointer hover:scale-[1.05]`} onClick={() => handlePlayerClick(player)}>
                                                                            <img src={player.player.image_path} alt={player.player.name} className="w-16 rounded-lg" />
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
                                                                            <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                })}
                                                                {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                            </div>

                                                            {/* Attackers */}
                                                            <div className="flex justify-center items-center gap-4">
                                                                {pitchViewList.lineup.Attacker.map((player) => {
                                                                    // Find the specific gameweek points for the current gameweek
                                                                    const gameweekPoints = player.player.points.find(
                                                                        (p) => p.gameweek === gameweekDetails._id
                                                                    );
                                                                    return (
                                                                        <div key={player.player._id} className={`${selectedPlayer?._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388] cursor-pointer hover:scale-[1.05]`} onClick={() => handlePlayerClick(player)}>
                                                                            <img src={player.player.image_path} alt={player.player.name} className="w-16 rounded-lg" />
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
                                                                            <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                })}
                                                                {renderSkeletons(2, pitchViewList.lineup.Attacker.length)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Substitute Players */}
                                                    <div className='w-full flex flex-col py-3 px-4 bg-[#131313] rounded-lg'>
                                                        <div className="flex justify-center items-center gap-4">
                                                            {pitchViewList.bench.map((player) => {
                                                                // Find the specific gameweek points for the current gameweek
                                                                const gameweekPoints = player.player.points.find(
                                                                    (p) => p.gameweek === gameweekDetails._id
                                                                );
                                                                return (
                                                                    <div key={player.player._id} className={`${selectedPlayer?._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388] cursor-pointer hover:scale-[1.05]`} onClick={() => handlePlayerClick(player)}>
                                                                        <img src={player.player.image_path} alt={player.player.name} className="w-16 rounded-lg" />
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
                                                                        <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                            {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                                        </p>
                                                                    </div>
                                                                )
                                                            })}
                                                            {renderSkeletons(4, pitchViewList.bench.length)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {players?.length === 0 && (
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
                                                                <th className="p-2">Points</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {players.map((player) => {
                                                                const gameweekPoints = player.player.points.find(
                                                                    (p) => p.gameweek === gameweekDetails._id
                                                                );
                                                                return (

                                                                    <tr key={player.player.id} onClick={() => handlePlayerClick(player)} className="border-b border-[#333333] text-center items-center justify-center cursor-pointer hover:scale-[1.01]">
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
                                                                        <td className="p-2 text-center truncate">
                                                                            {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                            {players.length === 0 && (
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
                                </motion.div>
                            )}
                        </div>
                    )}

                    {leagueData?.league_configuration?.format === "Head to Head" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                            {fixtures && fixtures.length > 0 ? fixtures.map((match) => {
                                const homeTeam = match.teams[0];
                                const awayTeam = match.teams[1];
                                return (
                                    <div key={match.id} onClick={() => handleFixtureClick(match)} className="bg-[#070E13] rounded-xl text-center space-y-4 pb-3 cursor-pointer hover:scale-[1.01]">
                                        {/* Teams Logos and VS */}
                                        <div className="flex justify-between items-center">
                                            {/* Home Team */}
                                            <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-r from-[#0C192200] to-[#0C1922] w-full max-w-[40%]">
                                                <img
                                                    src={homeTeam?.team_image_path || "/images/default_team_logo.png"}
                                                    alt={homeTeam?.team_name}
                                                    className="object-cover w-16 h-16 rounded-md"
                                                />
                                                <span className="text-white mt-2 text-sm md:text-base">
                                                    {homeTeam?.team_name}
                                                </span>
                                            </div>

                                            {/* VS */}
                                            <div className={`flex justify-center items-center relative ${exo2.className}`} style={{ height: '3rem', width: '2rem', fontSize: '2rem' }}>
                                                <span className="absolute text-[#FF8A00] font-bold" style={{ top: '-0.4rem', left: '0rem' }}>V</span>
                                                <span className="absolute text-[#FF8A00] font-bold" style={{ top: '0.4rem', left: '1rem' }}>S</span>
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-l from-[#0C192200] to-[#0C1922] w-full max-w-[40%]">
                                                <img
                                                    src={awayTeam?.team_image_path || "/images/default_team_logo.png"}
                                                    alt={awayTeam?.team_name}
                                                    className="object-cover w-16 h-16 rounded-md"
                                                />
                                                <span className="text-white mt-2 text-sm md:text-base">
                                                    {awayTeam?.team_name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`text-[#FF8A00] text-lg sm:text-xl md:text-2xl font-semibold ${exo2.className}`}>
                                            {teamPoints[homeTeam?._id] ?? 0} - {teamPoints[awayTeam?._id] ?? 0}
                                        </div>

                                        {/* Game Date and Time */}
                                        {/* <div className={`text-[#FF8A00] ${match.state === "Not Started" ? "text-sm sm:text-base md:text-lg" : "text-lg sm:text-xl md:text-2xl font-semibold"} ${exo2.className}`}>
                                            {match.state !== "Not Started"
                                                ? `${match.scores.find(
                                                    (score) =>
                                                        score.score_type_name === "Current" &&
                                                        score.team_id === homeTeam?.team_id
                                                )?.goals ?? 0
                                                } - ${match.scores.find(
                                                    (score) =>
                                                        score.score_type_name === "Current" &&
                                                        score.team_id === awayTeam?.team_id
                                                )?.goals ?? 0
                                                }`
                                                : new Date(match.starting_at).toLocaleString('en-US', {
                                                    timeZone: 'Australia/Brisbane', //Keeping this to cancel out the UK GMT
                                                    weekday: "long",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit"
                                                })}
                                        </div> */}
                                    </div>
                                )
                            }
                            ) : (
                                <p className="text-gray-400">Loading matches...</p>
                            )}
                        </div>
                    )}



                </>
            )}
            {showFixtureModal && selectedFixture && <FixtureModal fixture={selectedFixture} gameweek={gameweekDetails._id} leagueId={leagueId} onClose={closeFixtureModal} handlePlayerClick={handlePlayerClick} />}
            {openPlayerModal && selectedPlayer && <PlayerModal player={selectedPlayer} onClose={closePlayerModal} />}
        </div >
    );
};

export default MatchCenter;
