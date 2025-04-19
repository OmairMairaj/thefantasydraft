'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { FaExchangeAlt, FaUserPlus, FaUserMinus, FaClipboard, FaChevronDown } from 'react-icons/fa';
import { MdOutlineCompareArrows } from 'react-icons/md';
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertContext/AlertContext";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import Image from 'next/image';
import CompareBox from './CompareBox';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Trade = () => {
    const [leagueId, setLeagueId] = useState(null);
    const [user, setUser] = useState(null);
    const [viewType, setViewType] = useState('List');
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [userPlayers, setUserPlayers] = useState([]);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [playersOut, setPlayersOut] = useState([]);
    const [playersIn, setPlayersIn] = useState([]);
    const [comparePlayer1, setComparePlayer1] = useState(null);
    const [comparePlayer2, setComparePlayer2] = useState(null);
    const { addAlert } = useAlert();
    const [team, setTeam] = useState(null);
    const [pitchView, setPitchView] = useState(true); // Toggle between Pitch and List views
    const [players, setPlayers] = useState();
    const [leaguePoints, setLeaguePoints] = useState();
    const [leagueTable, setLeagueTable] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [standings, setStandings] = useState();
    const [matches, setMatches] = useState();
    const [totalPages, setTotalPages] = useState(1);
    const [userTeam, setUserTeam] = useState(null);
    const [otherTeam, setOtherTeam] = useState(null);
    const [selectedGameweek, setSelectedGameweek] = useState(null);
    const [leagueTeams, setLeagueTeams] = useState([]);
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
    const [otherPitchViewList, setOtherPitchViewList] = useState({
        lineup: {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        },
        bench: [],
    });
    const [view, setView] = useState('Pitch');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showOptions, setShowOptions] = useState(null); // Track clicked player for showing options
    const optionsRef = useRef(null);
    const [openPlayerModal, setOpenPlayerModal] = useState(false);
    const [currentGameweek, setCurrentGameweek] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('history');

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
                // fetchCurrentGameweek();
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
                console.log(`League Data: `, response.data.data);
                const league = response.data.data;

                if (league) {
                    // Step 2: Find the user's team in the league
                    const userTeam = league.teams.find(team => team.user_email === userEmail);

                    if (userTeam) {
                        // Step 4: Fetch the fantasy team details using teamId
                        console.log("User's Team: ", userTeam.team);
                        setUserTeam(userTeam.team);
                        const teamData = await fetchTeamDetails(userTeam.team._id);
                        setTeam(teamData);
                        setPlayers(teamData.players);


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
                return teamResponse.data.data;
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

    useEffect(() => {
        if (otherPlayers && otherPlayers.length === 15) {
            const segregated = segregatePlayers(otherPlayers);
            setOtherPitchViewList(segregated);
        }
    }, [otherPlayers]);


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

    // Render options menu
    const renderOptionsMenu = (player, team) => (
        <div ref={optionsRef} className="absolute bottom-0 bg-[#1c1c1cc9] w-full text-white rounded-lg shadow-md z-50">
            <button onClick={() => team === "other" ? setPlayersIn([...playersIn, player]) : setPlayersOut([...playersOut, player])} className='py-1 hover:text-[#ff8a00] hover:bg-[#1c1c1cde] w-full text-center'>Trade</button>
            <button onClick={() => setComparePlayer1(player)} className='py-1 hover:text-[#ff8a00] hover:bg-[#1c1c1cde] w-full text-center'>Compare With</button>
            <button onClick={() => setComparePlayer2(player)} className='py-1 hover:text-[#ff8a00] hover:bg-[#1c1c1cde] w-full text-center'>Compare To</button>
        </div>
    );

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setGameweekName(newPage);
        }
    };

    const handleTeamSelect = async (teamName) => {
        console.log("Selected Team ID: ", teamName);

        const selectedTeamObj = leagueTeams.find(t => t.team.team_name === teamName)?.team;

        if (!selectedTeamObj) return;

        if (selectedTeam?._id === selectedTeamObj._id) {
            setSelectedTeam(null);
            return;
        }

        setSelectedTeam(selectedTeamObj);
        setOtherPlayers([]);

        setOtherPitchViewList({
            lineup: {
                Goalkeeper: [],
                Defender: [],
                Midfielder: [],
                Attacker: [],
            },
            bench: [],
        });

        const otherTeamData = await fetchTeamDetails(selectedTeamObj._id); // get players of selected team
        setOtherTeam(otherTeamData);
        setOtherPlayers(otherTeamData.players);
        console.log("Other Team Data", otherTeamData);
    };

    const handleTradeClick = () => {
        if (playersIn.length !== 0 && playersOut.length !== 0) {
            addAlert('Trade submitted successfully', 'success');
            setPlayersIn([]);
            setPlayersOut([]);
        }
        else {
            addAlert('Please select players to trade', 'error');
            return;
        }
        // Submit logic here
    };

    const renderPlayerCard = (player, side) => (
        <div key={player.id} className='bg-[#333] p-4 rounded-lg flex justify-between items-center'>
            <span>{player.name}</span>
            <div className='flex gap-2'>
                <button onClick={() => side === 'user' ? setPlayersOut([...playersOut, player]) : setPlayersIn([...playersIn, player])} className='bg-[#FF8A00] text-sm px-2 py-1 rounded'>Trade</button>
                <button onClick={() => setComparePlayer1(player)} className='bg-blue-500 text-sm px-2 py-1 rounded'>Compare With</button>
                <button onClick={() => setComparePlayer2(player)} className='bg-purple-500 text-sm px-2 py-1 rounded'>Compare To</button>
            </div>
        </div>
    );
    return (
        <div className={``}>
            <div className='grid grid-cols-3 gap-6 mb-8'>
                <div className='bg-[#1c1c1c] rounded-lg p-4'>
                    <h3 className='font-bold text-lg mb-2'>Players Out</h3>
                    {playersOut.length > 0 ?
                        playersOut.map(p => {
                            return (
                                <div className="flex items-center space-x-2">
                                    {p.player.image_path && (
                                        <img
                                            src={p.player.image_path}
                                            alt={p.player.team_name || 'Team Logo'}
                                            className="w-12 h-12 my-2 rounded-lg"
                                        />
                                    )}
                                    <div className="overflow-hidden flex w-full justify-between items-center">
                                        <div className='flex flex-col'>
                                            <p className="font-bold truncate">{p.player.common_name} </p>
                                            <p className='text-sm font-normal text-gray-400'>{p.player.team_name}</p>
                                        </div>
                                        <button onClick={() => setPlayersOut(playersOut.filter(player => player.player._id !== p.player._id))} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                                    </div>
                                </div>
                                // <div key={p.player.id} className='flex justify-between items-center mb-2'>
                                //     <span>{p.player.common_name}</span>
                                //     <button onClick={() => setPlayersOut(playersOut.filter(player => player.id !== p.id))} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                                // </div>
                            );
                        })
                        :
                        <>
                            <p className='text-gray-400'>Select a player to transfer out</p>
                        </>
                    }

                </div>
                <div className='bg-[#1c1c1c] rounded-lg p-4'>
                    <h3 className='font-bold text-lg mb-2'>Players In</h3>
                    {playersIn.length > 0 ?
                        playersIn.map(p => {
                            return (
                                <div className="flex items-center space-x-2">
                                    {p.player.image_path && (
                                        <img
                                            src={p.player.image_path}
                                            alt={p.player.team_name || 'Team Logo'}
                                            className="w-12 h-12 my-2 rounded-lg"
                                        />
                                    )}
                                    <div className="overflow-hidden flex w-full justify-between items-center">
                                        <div className='flex flex-col'>
                                            <p className="font-bold truncate">{p.player.common_name} </p>
                                            <p className='text-sm font-normal text-gray-400'>{p.player.team_name}</p>
                                        </div>
                                        <button onClick={() => setPlayersIn(playersIn.filter(player => player.player._id !== p.player._id))} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                                    </div>
                                </div>
                                // <div key={p.player.id} className='flex justify-between items-center mb-2'>
                                //     <span>{p.player.common_name}</span>
                                //     <button onClick={() => setPlayersOut(playersOut.filter(player => player.id !== p.id))} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                                // </div>
                            );
                        })
                        :
                        <>
                            <p className='text-gray-400'>Select a player to transfer in</p>
                        </>
                    }
                </div>
                <div className='bg-[#1c1c1c] rounded-lg p-4'>
                    <h3 className='font-bold text-lg mb-2'>Trade</h3>
                    <p className='text-sm text-gray-400 mb-2'>Waiver Budget: $200</p>
                    {playersIn.length === 0 && playersOut.length === 0 ? <p className='text-gray-400 text-sm'>No players selected</p> : null}
                    {playersIn.length > 0 && playersOut.length === 0 ? <p className='text-gray-400 text-sm'>Some players selected</p> : null}
                    {playersOut.length > 0 && playersIn.length === 0 ? <p className='text-gray-400 text-sm'>Some players selected</p> : null}
                    <button onClick={handleTradeClick} className='mt-4 w-full bg-[#FF8A00] py-2 rounded text-center font-semibold'>Offer Trade</button>
                </div>
            </div>

            {/* Compare Section */}
            <div className='grid grid-cols-2 gap-6 mb-10'>
                {[comparePlayer1, comparePlayer2].map((player, idx) => (
                    <div key={idx} className='bg-[#1c1c1c] min-h-64 rounded-lg p-4'>
                        <div className='flex justify-between items-center mb-2'>
                            <h3 className='font-bold'>{idx === 0 ? 'Compare With' : 'Compare To'}</h3>
                            {player &&
                                <button onClick={() => idx === 0 ? setComparePlayer1(null) : setComparePlayer2(null)} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                            }
                        </div>
                        {player ?
                            <CompareBox playerObj={idx === 0 ? comparePlayer1 : comparePlayer2} label="Compare With" />
                            // <div className="flex items-center space-x-2">
                            //     {player.player.image_path && (
                            //         <img
                            //             src={player.player.image_path}
                            //             alt={player.player.team_name || 'Team Logo'}
                            //             className="w-12 h-12 my-2 rounded-lg"
                            //         />
                            //     )}
                            //     <div className="overflow-hidden flex w-full justify-between items-center">
                            //         <div className='flex flex-col'>
                            //             <p className="font-bold truncate">{player.player.common_name} </p>
                            //             <p className='text-sm font-normal text-gray-400'>{player.player.team_name}</p>
                            //         </div>
                            //         <button onClick={() => idx === 0 ? setComparePlayer1(null) : setComparePlayer2(null)} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                            //     </div>
                            // </div>

                            // <div className='flex justify-between items-center'>
                            //     <span>{player.player.name}</span>
                            //     <button onClick={() => idx === 0 ? setComparePlayer1(null) : setComparePlayer2(null)} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                            // </div>
                            :
                            <p className='text-gray-400'>Select a player to compare</p>
                        }

                    </div>
                ))}
            </div>

            {/* Pitch/List Views */}
            <div className='grid grid-cols-2 gap-6'>
                {/* User Team */}
                <div className='bg-[#1c1c1c] rounded-lg p-4'>
                    <div className='flex justify-between items-center mb-4'>
                        <div className='bg-[#333] px-4 py-2 rounded'>
                            {userTeam?.team_name}
                        </div>
                        <div className='flex gap-2'>
                            <button onClick={() => setViewType('List')} className={`px-4 py-1 ${viewType === 'List' ? 'bg-[#FF8A00]' : 'bg-[#333]'} rounded`}>List</button>
                            <button onClick={() => setViewType('Pitch')} className={`px-4 py-1 ${viewType === 'Pitch' ? 'bg-[#FF8A00]' : 'bg-[#333]'} rounded`}>Pitch</button>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        {/* {userPlayers.map(p => renderPlayerCard(p, 'user'))} */}
                        {viewType === 'Pitch' && players ? (
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
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
                                                        {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                            {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                        </p> */}
                                                        {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
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
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players && players.map((player) => {
                                                const gameweekPoints = player.player.points.find(
                                                    (p) => p.gameweek === gameweekDetails._id
                                                );
                                                return (

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
                                                        <td className="p-2 text-center truncate">
                                                            <div className='flex truncate gap-2 my-auto items-center align-middle h-full'>
                                                                <button onClick={() => setPlayersOut([...playersOut, player])} className='bg-[#FF8A00] text-sm px-2 py-1 rounded'>Trade</button>
                                                                <button onClick={() => setComparePlayer1(player)} className='bg-[#2563EB] text-sm px-2 py-1 rounded'>Compare With</button>
                                                                <button onClick={() => setComparePlayer2(player)} className='bg-[#7C3AED] text-sm px-2 py-1 rounded'>Compare To</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            {players && players.length === 0 && (
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

                {/* Other Team */}
                <div className='bg-[#1c1c1c] rounded-lg p-4'>
                    <div className='flex justify-between items-center mb-4'>
                        <select value={selectedTeam?.team_name || ''} onChange={(e) => handleTeamSelect(e.target.value)} className='bg-[#333] px-4 py-2 rounded'>
                            <option hidden value=''>Select Team</option>
                            {leagueTeams
                                .filter(t => t.team._id !== userTeam?._id) // exclude user's team
                                .map(t => (
                                    <option key={t.team._id} value={t.team.team_name}>{t.team.team_name}</option>
                                ))}
                        </select>
                        <div className='flex gap-2'>
                            <button onClick={() => setViewType('List')} className={`px-4 py-1 ${viewType === 'List' ? 'bg-[#FF8A00]' : 'bg-[#333]'} rounded`}>List</button>
                            <button onClick={() => setViewType('Pitch')} className={`px-4 py-1 ${viewType === 'Pitch' ? 'bg-[#FF8A00]' : 'bg-[#333]'} rounded`}>Pitch</button>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        {/* {userPlayers.map(p => renderPlayerCard(p, 'user'))} */}
                        {viewType === 'Pitch' && otherPlayers && otherPlayers.length > 0 ? (
                            <div className="relative">
                                <div className={`flex flex-col gap-2 ${otherPlayers?.length === 0 ? 'blur-sm' : ''}`}>
                                    {/* Pitch layout */}
                                    <div className="py-6 px-4 text-white rounded-lg border border-[#333333] bg-[#1C1C1C] pitch-view">
                                        <div className="flex flex-col gap-4">
                                            {/* Goalkeeper */}
                                            <div className="flex justify-center items-center gap-4">
                                                {otherPitchViewList.lineup.Goalkeeper.map((player) => {
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player, "other")}
                                                        </div>
                                                    )
                                                })}
                                                {renderSkeletons(1, otherPitchViewList.lineup.Goalkeeper.length)}
                                            </div>

                                            {/* Defenders */}
                                            <div className="flex justify-center items-center gap-4">
                                                {otherPitchViewList.lineup.Defender.map((player) => {
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player, "other")}
                                                        </div>
                                                    )
                                                })}
                                                {renderSkeletons(3, otherPitchViewList.lineup.Defender.length)}
                                            </div>

                                            {/* Midfielders */}
                                            <div className="flex justify-center items-center gap-4">
                                                {otherPitchViewList.lineup.Midfielder.map((player) => {
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player, "other")}
                                                        </div>
                                                    )
                                                })}
                                                {renderSkeletons(3, otherPitchViewList.lineup.Midfielder.length)}
                                            </div>

                                            {/* Attackers */}
                                            <div className="flex justify-center items-center gap-4">
                                                {otherPitchViewList.lineup.Attacker.map((player) => {
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
                                                            {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                                {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                            </p> */}
                                                            {showOptions?.player._id === player.player._id && renderOptionsMenu(player, "other")}
                                                        </div>
                                                    )
                                                })}
                                                {renderSkeletons(2, otherPitchViewList.lineup.Attacker.length)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Substitute Players */}
                                    <div className='w-full flex flex-col py-3 px-4 bg-[#131313] rounded-lg'>
                                        <div className="flex justify-center items-center gap-4">
                                            {otherPitchViewList.bench.map((player) => {
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
                                                        {/* <p className="px-2 truncate w-full whitespace-nowrap text-xs mt-2 py-1 bg-[#4333105e]">
                                                            {(leaguePoints && leaguePoints.players.find(x => x.playerDetails._id == player.player._id)) ? leaguePoints.players.find(x => x.playerDetails._id == player.player._id).playerPoints : 0} Pts
                                                        </p> */}
                                                        {showOptions?.player._id === player.player._id && renderOptionsMenu(player, "other")}
                                                    </div>
                                                )
                                            })}
                                            {renderSkeletons(4, otherPitchViewList.bench.length)}
                                        </div>
                                    </div>
                                </div>
                                {otherPlayers?.length === 0 && (
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
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {console.log("Other Player:", otherPlayers)}
                                            {otherPlayers && otherPlayers.length > 0 && otherPlayers.map((player) => {
                                                const gameweekPoints = player?.player?.points?.find(
                                                    (p) => p.gameweek === gameweekDetails._id
                                                );
                                                if (!player?.player) return null;
                                                return (

                                                    <tr key={player.player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                        <td className="px-2 text-left truncate">
                                                            <div className="flex items-center space-x-2">
                                                                {player?.player.image_path && (
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
                                                            <div className='flex truncate gap-2 my-auto items-center align-middle h-full'>
                                                                <button onClick={() => setPlayersIn([...playersIn, player])} className='bg-[#FF8A00] text-sm px-2 py-1 rounded'>Trade</button>
                                                                <button onClick={() => setComparePlayer1(player)} className='bg-[#2563EB] text-sm px-2 py-1 rounded'>Compare With</button>
                                                                <button onClick={() => setComparePlayer2(player)} className='bg-[#7C3AED] text-sm px-2 py-1 rounded'>Compare To</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            {otherPlayers && otherPlayers.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-gray-400">
                                                        Team Not Selected.
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
            </div>
        </div>
    )
}

export default Trade