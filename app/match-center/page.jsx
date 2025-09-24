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
import TeamModal from './components/TeamModal';


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
    const [showTeamModal, setShowTeamModal] = useState(false);

    useEffect(() => {
        if (showFixtureModal || openPlayerModal || showTeamModal) {
            document.body.style.overflow = 'hidden'; // Disable scrolling
        } else {
            document.body.style.overflow = 'auto'; // Enable scrolling back
        }

        // Cleanup when component unmounts (important if user navigates away)
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showFixtureModal, openPlayerModal, showTeamModal]);


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
        if (gameweekName) {
            console.log("Fetching data for gameweek: ", gameweekName);
            // fetchMatches(gameweekName);
            fetchGameweekDetails(gameweekName);
        }
    }, [gameweekName]);

    const fetchCurrentGameweek = () => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}gameweek/current`, { cache: 'no-store' })
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
    //         .get(process.env.NEXT_PUBLIC_BACKEND_URL + `standing`)
    //         .then((response) => {
    //             console.log(response.data.data);
    //             setStandings(response.data.data);
    //         })
    //         .catch((err) => console.error("Error fetching table data: ", err));
    // };

    const fetchUserTeamForLeague = async (userEmail, leagueId) => {
        try {
            // Step 1: Get League Data
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `fantasyleague?leagueId=${leagueId}`);

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

    const fetchLeagueTeamPoints = async (league, team, gameweek) => {
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `points?teamID=` + team + `&leagueID=` + league + `&gameweekID=` + gameweek);
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
                className="relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]"
            >
                <div className="w-10 h-10 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-lg bg-gray-600 animate-pulse mt-2" />
                <p className="text-sm mt-4 sm:mt-5 xl:mt-6 w-full bg-gray-700 h-4 animate-pulse" />
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

    // Handle player click to show options menu
    const handlePlayerClick = async (player) => {
        console.log("Clicked player:", player.player.common_name);
        console.log("Selected Player:", player.player);
        // alert(`Clicked player: ${player.player.common_name}`);
        const id = player.player._id;
        console.log(id);
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `player/with-points/${id}`);
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
            if (window.innerWidth < 1024) {
                setShowTeamModal(true);
            }
        }
    };

    const closeTeamModal = () => {
        setSelectedTeam(null);
        setShowTeamModal(false);
    }


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
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}points/team?leagueID=${leagueId}&teamID=${teamId}&gameweekID=${gameweekDetails._id}`
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
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between w-full'>
                        <div className='flex flex-col mb-4'>
                            <h2 className="text-2xl xl:text-3xl  font-bold">Game Week {gameweekName}</h2>
                            <p className="text-xs md:text-sm xl:text-base">{gameweekDetails?.starting_at ? `Starts: ${new Date(gameweekDetails.starting_at).toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}` : "Loading Date...."}</p>
                        </div>
                        <div className="flex sm:justify-center space-x-2 md:space-x-4 mb-4">
                            <button
                                className="fade-gradient w-1/3 sm:w-28 md:w-32 xl:w-40 px-2 sm:px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-start text-sm xl:text-base"
                                onClick={() => handlePageChange(gameweekName - 1)}
                                disabled={gameweekName === 1}
                            >
                                <FaChevronLeft className="mr-2" /> Previous
                            </button>
                            <button
                                className="fade-gradient w-1/3 sm:w-28 md:w-32 xl:w-40 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-center text-sm xl:text-base"
                                onClick={() => fetchCurrentGameweek()}
                            >
                                Current
                            </button>
                            <button
                                className="fade-gradient w-1/3 sm:w-28 md:w-32 xl:w-40 px-4 py-2 bg-gray-300 rounded-xl flex items-center justify-end text-sm xl:text-base"
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
                                        className={`relative rounded-xl shadow-sm shadow-[#1D374A] cursor-pointer transition-transform ease-in-out overflow-hidden 
                                        ${selectedTeam?._id === userTeam._id ? "border border-orange-400" : ""}`}
                                        onClick={() => handleTeamSelect(userTeam)}
                                    >
                                        {/* Dark overlay */}
                                        <div className="absolute inset-0 bg-[#0c1922]"></div>

                                        {/* Content */}
                                        <div className="relative z-10 flex items-center p-4 xl:p-6 text-white">
                                            <img
                                                src={userTeam?.team_image_path || "/images/default_team_logo.png"}
                                                alt={userTeam?.team_name}
                                                className="object-cover w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-md"
                                            />

                                            <div className="ml-2 space-y-2">
                                                <div className='flex flex-col'>
                                                    <h3 className="text-xl sm:text-2xl xl:text-3xl font-bold">{userTeam.team_name}</h3>
                                                    <p className='text-xs sm:text-sm xl:text-base'>{userTeam.user_email}</p>
                                                </div>
                                                {/* <p>{`Points: ${(leaguePoints) ? leaguePoints.team.teamPoints : 0}`}</p> */}
                                                {/* <p>Form: {userTeam.form}</p> */}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* League Teams Section */}
                                <motion.div className="flex flex-wrap gap-2 sm:gap-4 w-full mt-4">
                                    {leagueTeams?.filter((t) => t.team._id !== userTeam._id).map((team) => {
                                        // console.log('selectedTeam');
                                        console.log(selectedTeam);
                                        console.log(selectedTeam?._id, team.team._id);
                                        return (
                                            <motion.div
                                                key={team.team._id}
                                                whileHover={{ scale: 1.02 }}
                                                className={`relative ${selectedTeam ? 'w-full xl:w-[48%]' : 'w-full sm:w-[48%] lg:w-[32%]'} rounded-xl shadow-sm shadow-[#1D374A] cursor-pointer transition-transform ease-in-out overflow-hidden  ${selectedTeam?._id === team.team._id ? "border border-orange-400" : ""}`}
                                                onClick={() => handleTeamSelect(team.team)}
                                            >
                                                {/* Dark overlay */}
                                                <div className="absolute inset-0 bg-[#0c1922]"></div>

                                                {/* Background Image */}
                                                {/* <div className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${userTeam?.ground_image_path})` }}>
                                                </div> */}

                                                {/* Content */}
                                                <div className="relative z-10 flex items-center p-3 text-white">
                                                    <img
                                                        src={team.team.team_image_path || "/images/default_team_logo.png"}
                                                        alt={team.team.team_name}
                                                        className="object-cover w-14 h-14 xl:w-16 xl:h-16 rounded-md"
                                                    />

                                                    <div className="ml-2 space-y-2">
                                                        <div className='flex flex-col'>
                                                            <h3 className={`${selectedTeam ? 'text-lg 2xl:text-xl' : 'text-xl xl:text-2xl'} font-bold`}>{team.team.team_name}</h3>
                                                            <p className={`${selectedTeam ? 'text-xs 2xl:text-sm' : 'text-xs sm:text-sm xl:text-base'}`}>{team.team.user_email}</p>
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
                                    className="hidden lg:block w-1/2 transition-all duration-500 ease-in-out relative bg-[#0C1922] p-4 xl:p-6 rounded-xl ml-4"
                                >
                                    <div className="flex items-center justify-between w-full ">
                                        {/* Team Stats */}
                                        <div className="flex items-center relative space-x-2 xl:space-x-4">
                                            <div className="text-white flex items-center justify-center font-bold text-center overflow-hidden">
                                                <img src={selectedTeam?.team_image_path ? selectedTeam.team_image_path : "/images/default_team_logo.png"} alt="Team Logo" className="w-10 h-10 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-cover rounded-md" />
                                            </div>
                                            <div className='flex flex-col space-y-4 '>
                                                {/* Team Name */}
                                                <div className={`mt-1 text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold break-words text-[#FF8A00] mr-2 ${exo2.className}`}>
                                                    {selectedTeam?.team_name || 'Your Team'}
                                                </div>

                                            </div>
                                        </div>
                                        <div className='flex items-center justify-between gap-2 mr-0 text-[10px] lg:text-sm xl:text-base'>
                                            <div className='flex flex-col items-center justify-center space-y-1'>
                                                <p className='flex gap-1 text-center'><span className='hidden 2xl:block'>GameWeek</span><span className='block 2xl:hidden'>GW</span> Points</p>
                                                <p className='font-semibold'>{(leaguePoints) ? leaguePoints.team.teamPoints : 0}</p>
                                            </div>
                                            {/* <div className='flex flex-col items-center justify-center space-y-1'>
                                                <p className='text-sm'>Captain Points</p>
                                                <p className='text-sm font-semibold'>{leaguePoints ? getCaptainGameweekPoints(players) : 0}</p>
                                            </div> */}
                                            <div className='flex flex-col items-center justify-center space-y-1'>
                                                <p className='flex text-center'>Total Points</p>
                                                <p className='font-semibold'>{(leaguePoints) ? leaguePoints.team.teamPoints : 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl">
                                        {leagueData?.draftID?.state === "Ended" &&
                                            <div className="flex justify-end my-2" >
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

                                        <div className="bg-[#0C1922] rounded-xl mt-3">
                                            {view === 'Pitch' ? (
                                                <div className="relative">
                                                    <div className={`flex flex-col gap-2 ${leagueData?.draftID?.state !== "Ended" ? 'blur-sm' : ''}`}>
                                                        {/* Pitch layout */}
                                                        <div className="py-6 px-0 sm:px-4 text-white rounded-lg border border-[#1d374a] bg-[#0c1922] pitch-view">
                                                            <div className="flex flex-col gap-4">
                                                                {/* Goalkeeper */}
                                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                                    {pitchViewList.lineup.Goalkeeper.map((player) => {
                                                                        const gameweekPoints = player.player.points.find(
                                                                            (p) => p.gameweek._id === gameweekDetails._id
                                                                        );
                                                                        return (
                                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                                <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-16 rounded-lg" />
                                                                                <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                                                <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                                    {player.player.common_name}
                                                                                </p>
                                                                                <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {player.player.position_name}
                                                                                </p>
                                                                                <p className="px-2 mt-1 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                                </p>

                                                                            </div>
                                                                        )
                                                                    })}
                                                                    {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                                </div>

                                                                {/* Defenders */}
                                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                                    {pitchViewList.lineup.Defender.map((player) => {
                                                                        const gameweekPoints = player.player.points.find(
                                                                            (p) => p.gameweek._id === gameweekDetails._id
                                                                        );
                                                                        return (
                                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                                <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-16 rounded-lg" />
                                                                                <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                                                <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                                    {player.player.common_name}
                                                                                </p>
                                                                                <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {player.player.position_name}
                                                                                </p>
                                                                                <p className="px-2 mt-1 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                                </p>

                                                                            </div>
                                                                        )
                                                                    })}
                                                                    {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                                </div>

                                                                {/* Midfielders */}
                                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                                    {pitchViewList.lineup.Midfielder.map((player) => {
                                                                        const gameweekPoints = player.player.points.find(
                                                                            (p) => p.gameweek._id === gameweekDetails._id
                                                                        );
                                                                        return (
                                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                                <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-16 rounded-lg" />
                                                                                <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                                                <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                                    {player.player.common_name}
                                                                                </p>
                                                                                <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {player.player.position_name}
                                                                                </p>
                                                                                <p className="px-2 mt-1 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                                </p>

                                                                            </div>
                                                                        )
                                                                    })}
                                                                    {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                                </div>

                                                                {/* Attackers */}
                                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                                    {pitchViewList.lineup.Attacker.map((player) => {
                                                                        const gameweekPoints = player.player.points.find(
                                                                            (p) => p.gameweek._id === gameweekDetails._id
                                                                        );
                                                                        return (
                                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                                <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-16 rounded-lg" />
                                                                                <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                                                <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                                    {player.player.common_name}
                                                                                </p>
                                                                                <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {player.player.position_name}
                                                                                </p>
                                                                                <p className="px-2 mt-1 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                    {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                                </p>

                                                                            </div>
                                                                        )
                                                                    })}
                                                                    {renderSkeletons(2, pitchViewList.lineup.Attacker.length)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Substitute Players */}
                                                        <div className='w-full flex flex-col py-3 px-4 bg-[#071117] rounded-lg'>
                                                            <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                                {pitchViewList.bench.map((player) => {
                                                                    const gameweekPoints = player.player.points.find(
                                                                        (p) => p.gameweek._id === gameweekDetails._id
                                                                    );
                                                                    return (
                                                                        <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-16 rounded-lg" />
                                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                                {player.player.common_name}
                                                                            </p>
                                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                {player.player.position_name}
                                                                            </p>
                                                                            <p className="px-2 mt-1 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                                {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                            </p>

                                                                        </div>
                                                                    )
                                                                })}
                                                                {renderSkeletons(4, pitchViewList.bench.length)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {leagueData?.draftID?.state !== "Ended" && (
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
                                                                    <th className="p-2">Points</th>
                                                                    {/* <th className="p-2">Actions</th> */}
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
                                                                            {pitchViewList.lineup[pos].map((player) => {
                                                                                const gameweekPoints = player.player.points.find(
                                                                                    (p) => p.gameweek._id === gameweekDetails._id
                                                                                );
                                                                                return (
                                                                                    <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
                                                                                        {/* Player Name + Image */}
                                                                                        <td className="px-2 text-left truncate max-w-40">
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
                                                                                        <td className="p-2 text-center truncate">
                                                                                            {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                                        </td>
                                                                                        {/* Controls */}
                                                                                        {/* <td className="p-2 text-center truncate">
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
                                                                                                                </td> */}
                                                                                    </tr>
                                                                                )
                                                                            })}
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
                                                                        {pitchViewList.bench.map((player) => {
                                                                            const gameweekPoints = player.player.points.find(
                                                                                (p) => p.gameweek._id === gameweekDetails._id
                                                                            );
                                                                            return (
                                                                                <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
                                                                                    {/* Player Name + Image */}
                                                                                    {/* Player Name + Image */}
                                                                                    <td className="px-2 text-left truncate max-w-28">
                                                                                        <div className="flex items-center space-x-2">
                                                                                            {player.player.image_path && (
                                                                                                <img
                                                                                                    src={player.player.image_path}
                                                                                                    alt={player.player.common_name || 'Player Logo'}
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
                                                                                    <td className="p-2 text-center min-w-48">
                                                                                        <img src={player.player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto shadow-md" />
                                                                                    </td>
                                                                                    <td className="p-2 text-center truncate">
                                                                                        {gameweekPoints?.points ? gameweekPoints.points : 0}
                                                                                    </td>
                                                                                    {/* Controls */}
                                                                                    {/* <td className="p-2 text-center truncate">
                                                                                                                <div className="flex justify-center items-center gap-2">
                                                                                                                    <button
                                                                                                                        className="bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white"
                                                                                                                        onClick={() => handleViewClick(player)}
                                                                                                                        type="button"
                                                                                                                    >
                                                                                                                        View
                                                                                                                    </button>
                                                                                                                    <button
                                                                                                                        className={`bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white`}
                                                                                                                        onClick={() => { setSelectedPlayer(player); handleSwitchClick(player) }}
                                                                                                                        type="button"
                                                                                                                        disabled={selectedPlayer && selectedPlayer.player._id === player.player._id}
                                                                                                                    >
                                                                                                                        {selectedPlayer ? "Switch with" : "Switch"}
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </td> */}
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </React.Fragment>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {leagueData?.league_configuration?.format === "Head to Head" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8 w-full">
                            {fixtures && fixtures.length > 0 ? fixtures.map((match) => {
                                const homeTeam = match.teams[0];
                                const awayTeam = match.teams[1];
                                const overlayColor = 'rgba(12,25,34,0.7)'
                                return (
                                    <div key={match.id} onClick={() => handleFixtureClick(match)} className="bg-[#0C1922] rounded-xl text-center space-y-2 xl:space-y-4 pb-3 cursor-pointer hover:scale-[1.01]"
                                    style={{
                                        backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${homeTeam.ground_image_path})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    >
                                        {/* Teams Logos and VS */}
                                        <div className="flex justify-between items-center">
                                            {/* Home Team */}
                                            <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-r from-[#0C1922] to-[#1d374a7d] w-full max-w-[40%]">
                                                <img
                                                    src={homeTeam?.team_image_path || "/images/default_team_logo.png"}
                                                    alt={homeTeam?.team_name}
                                                    className="object-cover w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 rounded-md"
                                                />
                                                <span className="text-white mt-2 px-2 text-xs sm:text-sm xl:text-base">
                                                    {homeTeam?.team_name}
                                                </span>
                                            </div>

                                            {/* VS */}
                                            <div className={`flex justify-center items-center w-8 h-12 xl:w-8 xl:h-12 text-2xl xl:text-3xl relative ${exo2.className}`}>
                                                <span className="absolute text-[#FF8A00] font-bold top-[0.2rem] xl:top-[-0.4rem] left-0">V</span>
                                                <span className="absolute text-[#FF8A00] font-bold top-[0.8rem] xl:top-[0.4rem] left-3 xl:left-4">S</span>
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-l from-[#0C1922] to-[#1d374a7d] w-full max-w-[40%]">
                                                <img
                                                    src={awayTeam?.team_image_path || "/images/default_team_logo.png"}
                                                    alt={awayTeam?.team_name}
                                                    className="object-cover w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 rounded-md"
                                                />
                                                <span className="text-white mt-2 px-2 text-xs sm:text-sm xl:text-base">
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
                                                    year: 'numeric',
                                                    month: 'short',
                                                    weekday: 'long',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
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
            {showTeamModal && selectedTeam && window.innerWidth < 1024 && <TeamModal selectedTeam={selectedTeam} gameweek={gameweekDetails._id} leagueData={leagueData} onClose={closeTeamModal} handlePlayerClick={handlePlayerClick} />}
            {showFixtureModal && selectedFixture && <FixtureModal fixture={selectedFixture} gameweek={gameweekDetails._id} leagueData={leagueData} onClose={closeFixtureModal} handlePlayerClick={handlePlayerClick} />}
            {openPlayerModal && selectedPlayer && <PlayerModal player={selectedPlayer} onClose={closePlayerModal} />}
        </div >
    );
};

export default MatchCenter;
