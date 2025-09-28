'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { FaExchangeAlt, FaUserPlus, FaUserMinus, FaClipboard, FaChevronDown, FaTrash } from 'react-icons/fa';
import { MdOutlineCompareArrows } from 'react-icons/md';
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertContext/AlertContext";
import { FaChevronLeft, FaChevronRight, FaRegCircleXmark } from 'react-icons/fa6';
import Image from 'next/image';
import CompareBox from './CompareBox';
import { AnimatePresence, motion } from "framer-motion";
import { FiSliders } from "react-icons/fi";

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Transfer = () => {
    const [leagueId, setLeagueId] = useState(null);
    const [user, setUser] = useState(null);
    const [viewType, setViewType] = useState('List');
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [userPlayers, setUserPlayers] = useState([]);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [playersOut, setPlayersOut] = useState(null);
    const [playersIn, setPlayersIn] = useState(null);
    const [comparePlayer1, setComparePlayer1] = useState(null);
    const [comparePlayer2, setComparePlayer2] = useState(null);
    const [transferOfferAmount, setTransferOfferAmount] = useState(0);
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
    const [sort, setSort] = useState('rating');
    const [filter, setFilter] = useState('');
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [teamFilter, setTeamFilter] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [statFilters, setStatFilters] = useState({
        ppg: 0,     // Points per game
        per90: 0,   // Points per 90
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        saves: 0,
    });
    const [search, setSearch] = useState('');
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
    const [onlyUnowned, setOnlyUnowned] = useState(false);
    const [refresh, setRefresh] = useState(true)

    const activeFilterCount = (
        (filter ? 1 : 0) +
        (teamFilter ? 1 : 0) +
        Object.values(statFilters).filter(v => Number(v) > 0).length
    );

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
    }, [user, leagueId, refresh]);

    useEffect(() => {
        if (leagueId && team) {
            console.log("Fetch Other Players", leagueId, team._id);
            fetchOtherPlayers(leagueId, team._id);
        }
    }, [leagueId, team]);

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
                console.log(`League Data: `, response.data.data);
                const league = response.data.data;
                setSelectedLeague(response.data.data);
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
            const teamResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `fantasyteam/${teamId}`);
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

    const fetchOtherPlayers = async (leagueId, teamId) => {
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `transfer/players?teamID=${teamId}&leagueID=${leagueId}`);
            if (response.data && !response.data.error) {
                console.log("Other Players", response.data.data);
                setOtherPlayers(response.data.data);
            } else {
                console.error("Error fetching other players: ", response.data.message);
                addAlert(response.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching other players:', error);
            addAlert("An error occurred while fetching other players.", "error");
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
        <div ref={optionsRef} className="absolute bottom-0 bg-[#1d374a] w-full text-white rounded-lg shadow-md z-50 text-[8px] sm:text-xs lg:text-[10px] xl:text-xs">
            {(!playersIn || playersIn?.position_name === player.player.position_name) &&
                <button onClick={() => setPlayersOut(player.player)} className='py-2 hover:text-[#ff8a00] hover:bg-[#162631] w-full text-center'>Transfer</button>
            }
            <button onClick={() => setComparePlayer1(player.player)} className='py-2 hover:text-[#ff8a00] hover:bg-[#162631] w-full text-center'>Compare</button>
            {/* <button onClick={() => setComparePlayer2(player.player)} className='py-1 hover:text-[#ff8a00] hover:bg-[#162631] w-full text-center'>Compare To</button> */}
        </div>
    );

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setGameweekName(newPage);
        }
    };

    const handleSetTransferOfferAmount = (value) => {
        let max = userTeam?.waiver_wallet ? userTeam?.waiver_wallet : 100;
        if (value < 0) {
            setTransferOfferAmount(0);
        } else if (value > max) {
            setTransferOfferAmount(max);
        } else {
            setTransferOfferAmount(value);
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

    const handleTransferClick = () => {
        if (playersIn && playersOut && playersIn._id && playersOut._id) {
            // Logic to handle transfer submission
            try {
                const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "transfer";
                console.log(URL);
                const body = {
                    "teamID": userTeam._id,
                    "leagueID": leagueId,
                    "playerInID": playersIn._id,
                    "playerOutID": playersOut._id,
                    "owned": playersIn.owned,
                    "amount": transferOfferAmount
                }
                axios.post(URL, body).then((response) => {
                    console.log("response");
                    console.log(response);
                    if (response.data.error === true) {
                        addAlert(response.data.message, 'error');
                    } else {
                        addAlert('Transfer submitted successfully', 'success');
                        setRefresh(!refresh);
                        setPlayersIn(null);
                        setPlayersOut(null);
                    }
                })
            } catch (err) {
                addAlert("An unexpected error occurred. Please try again", "error");
                console.log("error");
                console.log(err);
            }
        }
        else {
            addAlert('Please select players to transfer', 'error');
            return;
        }
        // Submit logic here
    };

    // const renderPlayerCard = (player, side) => (
    //     <div key={player.id} className='bg-[#333] p-4 rounded-lg flex justify-between items-center'>
    //         <span>{player.name}</span>
    //         <div className='flex gap-2'>
    //             <button onClick={() => side === 'user' ? setPlayersOut([...playersOut, player]) : setPlayersIn([...playersIn, player])} className='bg-[#FF8A00] text-sm px-2 py-1 rounded'>Transfer</button>
    //             <button onClick={() => setComparePlayer1(player)} className='bg-blue-500 text-sm px-2 py-1 rounded'>Compare With</button>
    //             <button onClick={() => setComparePlayer2(player)} className='bg-purple-500 text-sm px-2 py-1 rounded'>Compare To</button>
    //         </div>
    //     </div>
    // );


    useEffect(() => {
        try {
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}team`)
                .then((response) => {
                    if (response && response.data && response.data.data) setTeams(response.data.data);
                    else addAlert("Error fetching teams. Please try again", 'error');
                });
        } catch (error) {
            console.error("Error fetching teams data:", error);
        }
    }, []);

    const handleSearch = (value) => {
        setSearch(value);
    }

    const handleClear = () => {
        setSearch('');
        setFilter('');
        setTeamFilter('');
        setSort('rating');
        setOnlyUnowned(false);
    }

    useEffect(() => {
        filterPlayers();
    }, [search, teamFilter, filter, sort, otherPlayers, onlyUnowned, statFilters]);

    const filterPlayers = () => {
        const filtered = (otherPlayers || [])
            .filter((player) =>
                player.name.toLowerCase().includes(search.toLowerCase()) ||
                player.common_name?.toLowerCase().includes(search.toLowerCase())
            )
            .filter((player) => !onlyUnowned || !(player?.owned === true))
            .filter((player) => !teamFilter || player.team_name?.toLowerCase() === teamFilter.toLowerCase())
            .filter((player) => !filter || player.position_name?.toLowerCase() === filter.toLowerCase())
            .filter((player) => {
                // NEW: stats thresholds
                const t = totalsMap[getPid(player)] || {};
                if (statFilters.ppg > 0 && (t.ppg ?? 0) < statFilters.ppg) return false;
                if (statFilters.per90 > 0 && (t.per90 ?? 0) < statFilters.per90) return false;
                if (statFilters.goals > 0 && (t.goals ?? 0) < statFilters.goals) return false;
                if (statFilters.assists > 0 && (t.assists ?? 0) < statFilters.assists) return false;
                if (statFilters.cleanSheets > 0 && (t.cleanSheets ?? 0) < statFilters.cleanSheets) return false;
                if (statFilters.saves > 0 && (t.saves ?? 0) < statFilters.saves) return false;
                return true;
            })
            .sort((a, b) => {
                if (sort === 'name') return a.name.localeCompare(b.name);
                if (sort === 'rating') return b.rating - a.rating;
                return 0;
            });

        setFilteredPlayers(filtered);
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
                className={`${bg} w-3 h-3 md:w-4 md:h-4 text-black font-bold flex items-center justify-center text-xs sm:text-xs xl:text-sm rounded-full `}
            >
                {text}
            </div>
        );
    };


    // helpers
    const getPid = (p) => p?._id ?? p?.id;

    const getGwNumber = (gw) => {
        const raw = gw?.gameweek?.name ?? gw?.gameweek?.id ?? gw?.gameweek_id?.name ?? gw?.name ?? gw;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) ? n : null;
    };

    // sum FPL-ish stats across GWs (<= currentGW)
    const aggregateSeasonStats = (player, currentGW) => {
        const games = Array.isArray(player?.points) ? player.points.filter(p => {
            const n = getGwNumber(p);
            return !currentGW || (n && n <= currentGW);
        }) : [];

        const t = games.reduce((acc, gw) => {
            const s = gw.fpl_stats || {};
            acc.points += +(gw.points ?? gw.player_points ?? 0);
            acc.minutes += +(s["minutes-played"] ?? 0);
            acc.goals += +(s.goals ?? 0);
            acc.assists += +(s.assists ?? 0);
            acc.cleanSheets += s["clean-sheet"] ? 1 : 0;
            acc.goalsConceded += +(s["goals-conceded"] ?? 0);
            acc.interceptions += +(s.interceptions ?? 0);
            acc.penaltyMisses += +(s["penalty-miss"] ?? 0);
            acc.penaltySaves += +(s["penalty-save"] ?? 0);
            acc.tackles += +(s.tackles ?? 0);
            acc.saves += +(s.saves ?? 0);
            acc.yellow += +(s.yellowcards ?? 0);
            acc.red += +(s.redcards ?? 0);
            acc.bonus += +(s.bonus ?? 0);
            acc.apps += (+(s["minutes-played"] ?? 0) > 0) ? 1 : 0;
            return acc;
        }, { points: 0, minutes: 0, goals: 0, assists: 0, cleanSheets: 0, goalsConceded: 0, interceptions: 0, penaltyMisses: 0, penaltySaves: 0, tackles: 0, saves: 0, yellow: 0, red: 0, bonus: 0, apps: 0 });

        t.ppg = t.apps ? +(t.points / t.apps).toFixed(2) : 0;
        t.per90 = t.minutes ? +((t.points * 90) / t.minutes).toFixed(2) : 0;
        return t;
    };

    // season totals for *my* team players (list view uses player.player)
    const myTotalsMap = React.useMemo(() => {
        const map = {};
        (players || []).forEach(p => {
            const base = p?.player || p;                 // roster item shape is { player: {...} }
            map[getPid(base)] = aggregateSeasonStats(base, currentGameweek);
        });
        return map;
    }, [players, currentGameweek]);

    // cache totals for all players shown on the page
    const totalsMap = React.useMemo(() => {
        const map = {};
        (otherPlayers || []).forEach(p => { map[getPid(p)] = aggregateSeasonStats(p, currentGameweek); });
        return map;
    }, [otherPlayers, currentGameweek]);


    return (
        <div className={``}>
            {(!userTeam || !pitchViewList || !filteredPlayers) ?
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
                :
                <>
                    <div className='grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 mb-4'>
                        <div className='border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] rounded-lg p-4 col-span-2 sm:col-span-1'>
                            <h3 className='font-bold text-lg xl:text-xl mb-2'>Player Out</h3>
                            {playersOut ?
                                <div className="flex items-center space-x-2">
                                    {playersOut.image_path && (
                                        <img
                                            src={playersOut.image_path}
                                            alt={playersOut.team_name || 'Team Logo'}
                                            className="w-10 h-10 xl:w-12 xl:h-12 my-2 rounded-lg"
                                        />
                                    )}
                                    <div className="overflow-hidden flex w-full justify-between items-center">
                                        <div className='flex flex-col truncate'>
                                            <p className="text-sm xl:text-base font-bold truncate">{playersOut.common_name} </p>
                                            <p className='text-xs xl:text-sm font-normal text-gray-400 truncate'>{playersOut.team_name}</p>
                                        </div>
                                        <button onClick={() => setPlayersOut(null)} className='bg-red-700 text-xs xl:text-sm px-2 xl:px-4 py-1 rounded'>Remove</button>
                                    </div>
                                </div>
                                // <div key={playersOut.id} className='flex justify-between items-center mb-2'>
                                //     <span>{playersOut.common_name}</span>
                                //     <button onClick={() => setPlayersOut(playersOut.filter(player => player.id !== playersOut.id))} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                                // </div>
                                :
                                <>
                                    <p className='text-gray-400 text-xs xl:text-sm'>Select a player to transfer out</p>
                                </>
                            }

                        </div>
                        <div className='border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] rounded-lg p-4 col-span-2 sm:col-span-1'>
                            <h3 className='font-bold text-lg xl:text-xl mb-2'>Players In</h3>
                            {playersIn ?
                                <div className="flex items-center space-x-2">
                                    {playersIn.image_path && (
                                        <img
                                            src={playersIn.image_path}
                                            alt={playersIn.team_name || 'Team Logo'}
                                            className="w-10 h-10 xl:w-12 xl:h-12 my-2 rounded-lg"
                                        />
                                    )}
                                    <div className="overflow-hidden flex w-full justify-between items-center">
                                        <div className='flex flex-col truncate'>
                                            <p className="text-sm xl:text-base font-bold truncate">{playersIn.common_name} </p>
                                            <p className='text-xs xl:text-sm font-normal text-gray-400 truncate'>{playersIn.team_name}</p>
                                        </div>
                                        <button onClick={() => setPlayersIn(null)} className='bg-red-700 text-xs xl:text-sm px-2 xl:px-4 py-1 rounded'>Remove</button>
                                    </div>
                                </div>
                                // <div key={playersIn.id} className='flex justify-between items-center mb-2'>
                                //     <span>{playersIn.common_name}</span>
                                //     <button onClick={() => setPlayersOut(playersOut.filter(player => player.id !== playersIn.id))} className='bg-red-500 text-sm px-2 py-1 rounded'>Remove</button>
                                // </div>   
                                :
                                <>
                                    <p className='text-gray-400 text-xs xl:text-sm'>Select a player to transfer in</p>
                                </>
                            }
                        </div>
                        <div className='border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] col-span-2 lg:col-span-1 rounded-lg p-4'>
                            <div className='flex flex-row lg:flex-col items-center lg:items-start justify-between'>
                                <h3 className='font-bold text-lg xl:text-xl mb-2'>Transfer</h3>
                                <p className='text-xs xl:text-sm text-gray-400 mb-2'>Waiver Budget: {userTeam && userTeam.waiver_wallet ? userTeam.waiver_wallet : 0}</p>
                            </div>
                            {!playersIn && !playersOut ? <p className='text-gray-400 text-xs xl:text-sm'>No players selected</p> : null}
                            {playersIn && !playersOut ? <p className='text-gray-400 text-xs xl:text-sm'>Some players selected</p> : null}
                            {playersOut && !playersIn ? <p className='text-gray-400 text-xs xl:text-sm'>Some players selected</p> : null}
                            {playersIn && playersIn.owned ?
                                <div className='flex justify-between items-center'>
                                    <div className="text-white text-xs xl:text-sm">Additional Transfer Offer Amount : </div>
                                    <input
                                        type="number"
                                        placeholder="Offer Amount"
                                        value={transferOfferAmount}
                                        onChange={(e) => { handleSetTransferOfferAmount(e.target.value) }}
                                        className="p-1 pl-2 w-1/4 rounded-lg bg-[#1D374A] text-white text-xs xl:text-sm border border-[#3a5365] focus:outline-none focus:border-[#FF8A00]"
                                    />
                                </div>
                                : null}
                            <button onClick={handleTransferClick} className='mt-4 w-full bg-[#ff8800b7] hover:bg-[#FF8A00] py-1 xl:py-2 rounded-md text-sm xl:text-basetext-center font-semibold'>{playersIn && playersIn.owned ? "Make Offer" : "Make Transfer"}</button>
                        </div>
                    </div>

                    {/* Compare Section */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 mb-4'>
                        {[comparePlayer1, comparePlayer2].map((player, idx) => (
                            <div key={idx} className='border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] min-h-32 rounded-lg p-4'>
                                <div className='flex justify-between items-center mb-2'>
                                    <h3 className='font-bold text-lg xl:text-xl '>{idx === 0 ? 'Compare With' : 'Compare To'}</h3>
                                    {player &&
                                        <button onClick={() => idx === 0 ? setComparePlayer1(null) : setComparePlayer2(null)} className='bg-red-700 text-xs xl:text-sm px-2 xl:px-4 py-1 rounded'>Remove</button>
                                    }
                                </div>
                                {player ?
                                    <CompareBox player={idx === 0 ? comparePlayer1 : comparePlayer2} />
                                    :
                                    <p className='text-gray-400 text-xs xl:text-sm'>Select a player to compare</p>
                                }

                            </div>
                        ))}
                    </div>

                    {/* Pitch/List Views */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4'>
                        {/* User Team */}
                        <div className='border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] rounded-lg p-4'>
                            <div className='relative flex justify-between items-end mb-4 pb-8 sm:pb-0'>
                                <div className='flex items-center gap-2'>
                                    <img
                                        src={userTeam?.team_image_path || '/images/default_team_logo.png'}
                                        alt={userTeam?.team_name || 'Team Logo'}
                                        className="w-16 h-16 xl:w-20 xl:h-20 rounded-lg"
                                    />
                                    <div className='text-xl xl:text-2xl text-[#FF8A00] font-semibold'>
                                        {userTeam?.team_name || 'Your Team'}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 px-2 sm:px-0" >
                                    {/* <h3 className={`text-3xl font-bold text-[#FF8A00] ${exo2.className}`}>Team</h3> */}
                                    <div className="flex items-center rounded-lg overflow-hidden text-xs sm:text-xs xl:text-sm">
                                        <button
                                            className={`${viewType === 'List' ? 'bg-[#ff8800b7]' : 'bg-[#1d374a]'} text-white px-5 py-1`}
                                            onClick={() => setViewType('List')}
                                        >
                                            List View
                                        </button>
                                        <button
                                            className={`${viewType === 'Pitch' ? 'bg-[#ff8800b7]' : 'bg-[#1d374a]'} text-white px-5 py-1`}
                                            onClick={() => setViewType('Pitch')}
                                        >
                                            Pitch View
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                {/* {userPlayers.map(p => renderPlayerCard(p, 'user'))} */}
                                {viewType === 'Pitch' && players ? (
                                    <div className="relative">
                                        <div className={`flex flex-col gap-2 ${players?.length === 0 ? 'blur-sm' : ''}`}>
                                            {/* Pitch layout */}
                                            <div className="py-6 px-0 sm:px-4 text-white rounded-lg border border-[#1d374a] bg-[#0c1922] pitch-view">
                                                <div className="flex flex-col gap-4">
                                                    {/* Goalkeeper */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Goalkeeper.map((player) => {
                                                            // Find the specific gameweek points for the current gameweek
                                                            const gameweekPoints = player.player.points.find(
                                                                (p) => p.gameweek === gameweekDetails._id
                                                            );
                                                            return (
                                                                <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                                    <img src={player.player.image_path} alt={player.player.name} className="w-8 sm:w-10 xl:w-12 rounded-lg z-20" />
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md z-10" />
                                                                    <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                        {player.player.common_name}
                                                                    </p>
                                                                    <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                        {player.player.position_name}
                                                                    </p>
                                                                    {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                                </div>
                                                            )
                                                        })}
                                                        {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                    </div>

                                                    {/* Defenders */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Defender.map((player) => {
                                                            // Find the specific gameweek points for the current gameweek
                                                            const gameweekPoints = player.player.points.find(
                                                                (p) => p.gameweek === gameweekDetails._id
                                                            );
                                                            return (
                                                                <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                                    <img src={player.player.image_path} alt={player.player.name} className="w-8 sm:w-10 xl:w-12 rounded-lg z-20" />
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md z-10" />
                                                                    <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                        {player.player.common_name}
                                                                    </p>
                                                                    <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                        {player.player.position_name}
                                                                    </p>
                                                                    {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                                </div>
                                                            )
                                                        })}
                                                        {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                    </div>

                                                    {/* Midfielders */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Midfielder.map((player) => {
                                                            // Find the specific gameweek points for the current gameweek
                                                            const gameweekPoints = player.player.points.find(
                                                                (p) => p.gameweek === gameweekDetails._id
                                                            );
                                                            return (
                                                                <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                                    <img src={player.player.image_path} alt={player.player.name} className="w-8 sm:w-10 xl:w-12 rounded-lg z-20" />
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md z-10" />
                                                                    <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                        {player.player.common_name}
                                                                    </p>
                                                                    <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                        {player.player.position_name}
                                                                    </p>
                                                                    {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                                </div>
                                                            )
                                                        })}
                                                        {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                    </div>

                                                    {/* Attackers */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Attacker.map((player) => {
                                                            // Find the specific gameweek points for the current gameweek
                                                            const gameweekPoints = player.player.points.find(
                                                                (p) => p.gameweek === gameweekDetails._id
                                                            );
                                                            return (
                                                                <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                                    <img src={player.player.image_path} alt={player.player.name} className="w-8 sm:w-10 xl:w-12 rounded-lg z-20" />
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md z-10" />
                                                                    <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                        {player.player.common_name}
                                                                    </p>
                                                                    <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                        {player.player.position_name}
                                                                    </p>
                                                                    {showOptions?.player._id === player.player._id && renderOptionsMenu(player)}
                                                                </div>
                                                            )
                                                        })}
                                                        {renderSkeletons(2, pitchViewList.lineup.Attacker.length)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Substitute Players */}
                                            <div className='w-full flex flex-col py-3 px-4 bg-[#050c11] rounded-lg'>
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.bench.map((player) => {
                                                        // Find the specific gameweek points for the current gameweek
                                                        const gameweekPoints = player.player.points.find(
                                                            (p) => p.gameweek === gameweekDetails._id
                                                        );
                                                        return (
                                                            <div key={player.player._id} className={`${selectedPlayer?.player._id === player.player._id ? "border border-[#ffa800]" : ""} relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)}>
                                                                <img src={player.player.image_path} alt={player.player.name} className="w-8 sm:w-10 xl:w-12 rounded-lg z-20" />
                                                                <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md z-10" />
                                                                <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                    {player.player.common_name}
                                                                </p>
                                                                <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                    {player.player.position_name}
                                                                </p>
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
                                    <div className="relative w-full overflow-hidden rounded-lg border border-[#1d374a]">
                                        <div className="overflow-x-auto overflow-y-auto scrollbar">
                                            <table className="w-full text-left text-white text-xs sm:text-xs xl:text-sm">
                                                <thead className="bg-[#1d374a] sticky top-0 z-10">
                                                    <tr className="text-center">
                                                        <th className="p-2 text-left pl-4">Player</th>
                                                        {/* <th className="p-2">Role</th> */}
                                                        {/* <th className="p-2">Team</th> */}
                                                        {/* <th className="p-2">Pos.</th> */}
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
                                                                    <td colSpan="2" className="py-2 px-4 text-left font-bold bg-[#192a37] text-[#FF8A00] uppercase text-xs sm:text-sm">
                                                                        {pos}
                                                                    </td>
                                                                </tr>
                                                                {pitchViewList.lineup[pos].map((player) => (
                                                                    <tr key={player.player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                                        <td className="px-2 text-left truncate min-w-44 max-w-44 sm:max-w-96">
                                                                            <div className='flex flex-col gap-0 my-1 truncate'>
                                                                                <div className="flex items-center space-x-2 truncate">
                                                                                    {player.player.image_path && (
                                                                                        <img
                                                                                            src={player.player.image_path}
                                                                                            alt={player.player.team_name || 'Team Logo'}
                                                                                            className="w-8 h-8 sm:w-10 sm:h-10 my-1 rounded-lg"
                                                                                        />
                                                                                    )}
                                                                                    <div className="overflow-hidden truncate">
                                                                                        <p className="font-bold truncate flex items-center">{player.player.common_name}<span className='ml-2'>{positionIcon(player.player.position_name)}</span></p>
                                                                                        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{player.player.team_name}</p>
                                                                                    </div>

                                                                                </div>
                                                                                {/* Compact stat line + collapsible */}
                                                                                <PlayerStatLine
                                                                                    stats={myTotalsMap[getPid(player.player)]}
                                                                                    position={player.player.position_name}
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        {/* <td className="p-2 text-center truncate">
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mx-auto shadow-md" />
                                                                </td> */}
                                                                        {/* <td className="p-2 text-center truncate">
                                                                            <div className='flex justify-center items-center'>
                                                                                {positionIcon(player.player.position_name)}
                                                                            </div>
                                                                        </td> */}
                                                                        <td className="p-2 text-center truncate max-w-24">
                                                                            <div className="flex justify-center items-center gap-2">
                                                                                <button disabled={playersIn && playersIn?.position_name !== player.player.position_name} onClick={() => setPlayersOut(player.player)} className={`${playersIn && playersIn?.position_name !== player.player.position_name ? "bg-[#191218]" : "bg-[#ff8800b7] hover:bg-[#FF8A00]"} text-[10px] sm:text-xs xl:text-xs px-2 py-1 rounded`}>Transfer</button>
                                                                                <button onClick={() => setComparePlayer1(player.player)} className='bg-[#1d374a] border border-[#1d374a] text-white px-2 py-1 text-[10px] sm:text-xs xl:text-xs rounded-md hover:bg-[#FF8A00] hover:text-white"'>Compare</button>
                                                                                {/* <button onClick={() => setComparePlayer2(player.player)} className='bg-[#1d374a] border border-[#1d374a] text-white px-2 py-1 text-[10px] sm:text-xs xl:text-xs rounded-md hover:bg-[#FF8A00] hover:text-white"'>Compare To</button> */}
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
                                                                <td colSpan="2" className="py-2 px-4 text-left font-bold bg-[#192a37] text-[#FF8A00] uppercase text-xs sm:text-sm">
                                                                    Substitutes
                                                                </td>
                                                            </tr>
                                                            {pitchViewList.bench.map((player) => (
                                                                <tr key={player.player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                                    <td className="px-2 text-left truncate min-w-44 max-w-44 sm:max-w-96">
                                                                        <div className='flex flex-col gap-0 my-1 truncate'>
                                                                            <div className="flex items-center space-x-2 truncate">
                                                                                {player.player.image_path && (
                                                                                    <img
                                                                                        src={player.player.image_path}
                                                                                        alt={player.player.team_name || 'Team Logo'}
                                                                                        className="w-8 h-8 sm:w-10 sm:h-10 my-1 rounded-lg"
                                                                                    />
                                                                                )}
                                                                                <div className="overflow-hidden truncate">
                                                                                    <p className="font-bold truncate flex items-center">{player.player.common_name}<span className='ml-2'>{positionIcon(player.player.position_name)}</span></p>
                                                                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{player.player.team_name}</p>
                                                                                </div>

                                                                            </div>
                                                                            {/* Compact stat line + collapsible */}
                                                                            <PlayerStatLine
                                                                                stats={myTotalsMap[getPid(player.player)]}
                                                                                position={player.player.position_name}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    {/* <td className="p-2 text-center truncate">
                                                        {player.captain && <span className="bg-yellow-500 text-black px-2 py-1 rounded-md text-xs">Captain</span>}
                                                        {player.vice_captain && !player.captain && <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs">Vice Captain</span>}
                                                    </td> */}
                                                                    {/* <td className="p-2 text-center truncate">
                                                                <img src={player.player.team_image_path} alt="Team Logo" className="w-8 h-8 rounded-full mx-auto shadow-md" />
                                                            </td> */}
                                                                    {/* <td className="p-2 text-center truncate">
                                                                        <div className='flex justify-center items-center'>
                                                                            {positionIcon(player.player.position_name)}
                                                                        </div>
                                                                    </td> */}
                                                                    <td className="p-2 text-center truncate ">
                                                                        <div className="flex justify-center items-center gap-2">
                                                                            <button disabled={playersIn && playersIn?.position_name !== player.player.position_name} onClick={() => setPlayersOut(player.player)} className={`${playersIn && playersIn?.position_name !== player.player.position_name ? "bg-[rgb(25,18,24)]" : "bg-[#ff8800b7] hover:bg-[#FF8A00]"} text-[10px] sm:text-xs xl:text-xs px-2 py-1 rounded`}>Transfer</button>
                                                                            <button onClick={() => setComparePlayer1(player.player)} className='bg-[#1d374a] border border-[#1d374a] text-white px-2 py-1 text-[10px] sm:text-xs xl:text-xs rounded-md hover:bg-[#FF8A00] hover:text-white'>Compare</button>
                                                                            {/* <button onClick={() => setComparePlayer2(player.player)} className='bg-[#1d374a] border border-[#1d374a] text-white px-2 py-1 text-[10px] sm:text-xs xl:text-xs rounded-md hover:bg-[#FF8A00] hover:text-white'>Compare To</button> */}
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

                        <div className="border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] rounded-xl p-4 h-full min-w-0">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div className='flex flex-col items-center gap-2 xl:gap-0 w-full'>
                                    <div className='flex flex-col sm:flex-row gap-2 justify-between w-full xl:my-2'>
                                        <h3 className={`text-xl xl:text-2xl font-bold text-[#FF8A00] ${exo2.className}`}>Players</h3>
                                        <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[75%]">
                                            {/* SORT radio (segmented) */}
                                            <div className="w-1/3 flex rounded-lg overflow-hidden border border-[#2a4960] bg-[#1D374A] text-xs xl:text-sm">
                                                {["rating", "name"].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setSort(opt)}
                                                        className={`w-1/2 px-1.5 py-1 ${sort === opt ? "bg-[#ff8800b7] text-white" : "text-white"}`}
                                                    >
                                                        {opt === "rating" ? "Rating" : "Name"}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* OWNED toggle outside the panel */}
                                            <div className="w-1/3 flex rounded-lg overflow-hidden border border-[#2a4960] bg-[#1D374A] text-xs xl:text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setOnlyUnowned(false)}
                                                    className={`w-1/3 px-1.5 py-1 ${!onlyUnowned ? "bg-[#ff8800b7] text-white" : "text-white"}`}
                                                >
                                                    All
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOnlyUnowned(true)}
                                                    className={`w-2/3 px-1.5 py-1 ${onlyUnowned ? "bg-[#ff8800b7] text-white" : "text-white"}`}
                                                >
                                                    Unowned
                                                </button>
                                            </div>

                                            {/* FILTERS button */}
                                            <button
                                                type="button"
                                                onClick={() => setIsFilterOpen(v => !v)}
                                                className="relative w-1/3 flex items-center gap-2 px-2 py-1 rounded-lg border border-[#2a4960] bg-[#1D374A] text-white text-xs xl:text-sm hover:border-[#FF8A00]"
                                            >
                                                <FiSliders className='w-10' />
                                                Filters
                                                {activeFilterCount > 0 && (
                                                    <span className="ml-1 inline-flex items-center justify-center text-[10px] min-w-4 h-4 px-1 rounded-full bg-[#ff8800b7] text-white">
                                                        {activeFilterCount}
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* SEARCH with inline clear */}
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Search players…"
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="w-full p-1.5 pl-3 pr-8 rounded-lg text-xs xl:text-sm bg-[#1D374A] text-white border border-[#2a4960] focus-visible:outline-none focus:border-[#FF8A00]"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => setSearch('')}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                                                aria-label="Clear search"
                                            >
                                                <FaRegCircleXmark className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Animated filters panel (inline, collapses in place) */}
                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -6 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -6 }}
                                        transition={{ duration: 0.18 }}
                                        className="overflow-hidden"
                                    >
                                        <FilterPanel
                                            teams={teams}
                                            filter={filter}
                                            setFilter={setFilter}
                                            teamFilter={teamFilter}
                                            setTeamFilter={setTeamFilter}
                                            statFilters={statFilters}
                                            setStatFilters={setStatFilters}
                                            onApply={() => setIsFilterOpen(false)}
                                            onClear={() => {
                                                setFilter('');
                                                setTeamFilter('');
                                                setStatFilters({ ppg: 0, per90: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0 });
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {/* <div className='flex justify-between items-center mb-3 xl:mb-4 gap-2'>
                                <div className='flex items-center gap-2 w-9/12  '>
                                    <input
                                        type="text"
                                        placeholder="Search ..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="p-1 xl:p-1 pl-2 rounded-lg text-xs xl:text-sm w-full bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#2a4960]"
                                    />
                                </div>
                                {filter || sort != 'rating' || search || teamFilter ?
                                    <button className='flex w-3/12 text-xs xl:text-sm items-center justify-center bg-[#1D374A] text-white p-1 xl:p-1 rounded-full hover:bg-[#FF8A00] transition-colors' onClick={() => handleClear()}><FaRegCircleXmark /><span className='pl-1 block'> Clear</span>
                                    </button>
                                    : <div className='w-auto'></div>
                                }
                            </div> */}
                            {/* Table */}
                            <div className={`relative w-full ${viewType === "List" ? "max-h-[48rem] lg:max-h-[86rem]" : "max-h-[48rem]"} overflow-hidden rounded-lg mt-3 border border-[#1D374A]`}>
                                {/* Scrollable Wrapper */}
                                <div className={`overflow-x-auto ${viewType === "List" ? "max-h-[48rem] lg:max-h-[86rem]" : "max-h-[48rem]"} overflow-y-auto scrollbar`}>
                                    <table className="w-full text-left text-white text-xs sm:text-xs xl:text-sm">
                                        {/* Table Header */}
                                        <thead className="bg-[#1D374A] sticky top-0 z-10">
                                            <tr className="text-center">
                                                <th className="p-2 text-left pl-4">Player</th>
                                                {/* <th className='p-2'>Team</th> */}
                                                {/* <th className='p-2'>Owned</th> */}
                                                {/* <th className="p-2">Pos.</th> */}
                                                <th className="p-2">Actions</th>
                                                {/* <th className="p-2 sticky right-0 z-20">Actions</th> */}
                                            </tr>
                                        </thead>
                                        <tbody className=''>
                                            {filteredPlayers && filteredPlayers?.map((player) => (
                                                <tr key={player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                    <td className="px-2 text-left truncate max-w-44 sm:max-w-none">
                                                        <div className='flex flex-col gap-0 my-1'>
                                                            <div className="flex items-center space-x-2 truncate relative">
                                                                {player.image_path && (
                                                                    <img
                                                                        src={player.image_path}
                                                                        alt={player.team_name || 'Team Logo'}
                                                                        className="w-8 h-8 sm:w-10 sm:h-10 my-1 rounded-lg"
                                                                    />
                                                                )}
                                                                <div className="overflow-hidden truncate">
                                                                    <p className="font-bold truncate flex items-center">{player.common_name}<span className='ml-2'>{positionIcon(player.position_name)}</span></p>
                                                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{player.team_name}</p>
                                                                </div>
                                                                {player.owned &&
                                                                    <div className="absolute top-0 right-0 sm:right-2 lg:right-0 xl:right-2">
                                                                        <div className={`flex items-center gap-2 bg-rose-500/10 text-rose-300 px-1.5 sm:px-3.5 lg:px-1.5 xl:px-3.5 py-0 rounded-full border border-white/5 shadow-lg`}>
                                                                            {/* <span className={`rounded-full bg-rose-40 animate-pulse`} /> */}
                                                                            <span className="text-[8px] sm:text-[10px] font-semibold">
                                                                                Taken
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                }

                                                            </div>
                                                            {/* Compact stat line + collapsible */}
                                                            <PlayerStatLine
                                                                stats={totalsMap[getPid(player)]}
                                                                position={player.position_name}
                                                            />
                                                        </div>
                                                    </td>
                                                    {/* <td className="p-2 text-center truncate">
                                                                    <img src={player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mx-auto shadow-md" />
                                                                </td> */}

                                                    {/* <td className="p-2 text-center truncate">
                                                        <div className="flex justify-center items-center space-x-2">{player.owned ? "Yes" : "No"}</div>
                                                    </td> */}
                                                    {/* <td className="p-2 text-center truncate">
                                                        <div className='flex justify-center items-center'>
                                                            {positionIcon(player.position_name)}
                                                        </div>
                                                    </td> */}
                                                    <td className="p-2 text-center truncate">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <button disabled={playersOut && playersOut?.position_name !== player.position_name} onClick={() => setPlayersIn(player)} className={`${playersOut && playersOut?.position_name !== player.position_name ? "bg-[rgb(25,18,24)]" : "bg-[#ff8800b7] hover:bg-[#FF8A00]"} text-[10px] sm:text-xs xl:text-xs px-2 py-1 rounded`}>Transfer</button>
                                                            {/* <button onClick={() => setComparePlayer1(player)} className='bg-[#1d374a] border border-[#1d374a] text-white px-2 py-1 text-[10px] sm:text-xs xl:text-xs rounded-md hover:bg-[#FF8A00] hover:text-white'>Compare With</button> */}
                                                            <button onClick={() => setComparePlayer2(player)} className='bg-[#1d374a] border border-[#1d374a] text-white px-2 py-1 text-[10px] sm:text-xs xl:text-xs rounded-md hover:bg-[#FF8A00] hover:text-white'>Compare</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div >
    )
}


const StatPill = ({ k, v }) => (
    <span className="px-1.5 rounded-full bg-[#102531] border border-[#1D374A] text-[10px] sm:text-xs text-slate-200">
        <span className="text-[#FF8A00] font-bold">{v}</span> <span className="opacity-80">{k}</span>
    </span>
);

const PlayerStatLine = ({ stats, position }) => {
    if (!stats) return null;

    // Helper to pick the GK’s third pill: prefer Penalty Saves if present, else Saves.
    const gkThird = (stats.penaltySaves ?? 0) > 0
        ? ["PS", stats.penaltySaves]
        : ["Sv", stats.saves];

    // Position-driven core pills (exactly 3)
    const coreByPos = {
        Goalkeeper: [["Pts", stats.points], ["CS", stats.cleanSheets], gkThird],
        Defender: [["Pts", stats.points], ["CS", stats.cleanSheets], ["G", stats.goals]],
        Midfielder: [["Pts", stats.points], ["A", stats.assists], ["G", stats.goals]],
        Attacker: [["Pts", stats.points], ["G", stats.goals], ["A", stats.assists]],
    };

    const core = coreByPos[position] ?? [["Pts", stats.points], ["G", stats.goals], ["A", stats.assists]];

    // All the rest (order chosen for readability). We’ll exclude anything already shown in `core`.
    const allExtra = [
        ["Min", stats.minutes],
        ["Apps", stats.apps],
        ["GC", stats.goalsConceded],
        ["Int", stats.interceptions],
        ["PM", stats.penaltyMisses],
        ["PS", stats.penaltySaves],
        ["Tkl", stats.tackles],
        ["Sv", stats.saves],
        ["YC", stats.yellow],
        ["RC", stats.red],
        ["BPS", stats.bonus],
        ["PPG", stats.ppg],
        ["Pts/90", stats.per90],
        // (We purposely keep G/A/CS/Pts out here if they’re in core to avoid duplication)
    ];

    const coreKeys = new Set(core.map(([k]) => k));
    const extras = allExtra.filter(([k]) => !coreKeys.has(k));

    return (
        <details className="group mb-1  ">
            {/* Summary (core line) */}
            <summary className="list-none cursor-pointer">
                <div className="mt-0 flex flex-wrap gap-1 sm:gap-1 items-center">
                    {core.map(([k, v]) => (
                        <StatPill key={k} k={k} v={v} />
                    ))}
                    <span className="ml-1 text-[10px] sm:text-xs text-slate-400 group-open:hidden">
                        More ▾
                    </span>
                    <span className="ml-1 text-[10px] sm:text-xs text-slate-400 hidden group-open:inline">
                        Less ▴
                    </span>
                </div>
            </summary>

            {/* Expanded (all the rest) */}
            <div className="mt-1 flex flex-wrap gap-1.5 sm:gap-1">
                {extras.map(([k, v]) => (
                    <StatPill key={k} k={k} v={v} />
                ))}
            </div>
        </details>
    );
};

const FilterPanel = ({
    teams,
    filter, setFilter,
    teamFilter, setTeamFilter,
    statFilters, setStatFilters,
    onApply, onClear,
}) => {
    // Local staging so users can tweak then Apply
    const [local, setLocal] = useState({
        position: filter || "",
        team: teamFilter || "",
        ...statFilters,
    });

    useEffect(() => {
        setLocal({ position: filter || "", team: teamFilter || "", ...statFilters });
    }, [filter, teamFilter, statFilters]);

    const apply = () => {
        setFilter(local.position);
        setTeamFilter(local.team);
        setStatFilters({
            ppg: Number(local.ppg) || 0,
            per90: Number(local.per90) || 0,
            goals: Number(local.goals) || 0,
            assists: Number(local.assists) || 0,
            cleanSheets: Number(local.cleanSheets) || 0,
            saves: Number(local.saves) || 0,
        });
        onApply?.();
    };

    const clearAll = () => {
        setLocal({ position: "", team: "", ppg: 0, per90: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0 });
        onClear?.();
    };

    const Input = ({ id, label, step = 1 }) => (
        <label htmlFor={id} className="flex flex-col justify-between gap-0.5 text-xs xl:text-sm">
            <label className="text-slate-300 text-xs lg:text-[11px] xl:text-xs">{label}</label>
            <input
                id={id}
                type="number"
                step={step}
                value={local[id]}
                onChange={(e) => setLocal((s) => ({ ...s, [id]: e.target.value }))}
                className="w-full px-2 py-1 rounded bg-[#0F2230] border border-[#2a4960] text-white text-xs"
            />
        </label>
    );

    return (
        <div className="rounded-lg border border-[#2a4960] bg-[#0E1D27] mt-3 p-3 sm:p-4 lg:p-2 xl:p-4">
            {/* Row 1: Position + Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <p className="text-[10px] xl:text-xs uppercase tracking-wide text-slate-400 mb-1">Position</p>
                    <div className="grid grid-cols-5 gap-1">
                        {[
                            ["", "All"],
                            ["goalkeeper", "GKP"],
                            ["defender", "DEF"],
                            ["midfielder", "MID"],
                            ["attacker", "FWD"],
                        ].map(([val, label]) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setLocal(s => ({ ...s, position: val }))}
                                className={`px-1 py-1 text-center rounded border text-xs xl:text-sm ${local.position === val
                                    ? "bg-[#ff8800b7] text-white border-transparent"
                                    : "bg-[#1D374A] text-white border-[#2a4960]"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] xl:text-xs uppercase tracking-wide text-slate-400 mb-1">Team</p>
                    <select
                        value={local.team}
                        onChange={(e) => setLocal(s => ({ ...s, team: e.target.value }))}
                        className="w-full p-1 rounded bg-[#1D374A] text-white border border-[#2a4960] text-xs xl:text-sm"
                    >
                        <option value="">All teams</option>
                        {(teams || []).map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Stat thresholds */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <Input id="ppg" label="Min PPG" step="0.1" />
                <Input id="per90" label="Min Pts/90" step="0.1" />
                <Input id="goals" label="Min Goals" />
                <Input id="assists" label="Min Assists" />
                <Input id="cleanSheets" label="Min CS" />
                <Input id="saves" label="Min Saves" />
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={clearAll}
                    className="px-3 py-1 rounded-lg bg-[#102531] border border-[#2a4960] text-white text-xs xl:text-sm hover:border-[#FF8A00]"
                >
                    Clear filters
                </button>
                <button
                    type="button"
                    onClick={apply}
                    className="px-6 py-1 rounded-lg bg-[#ff8800b7] hover:bg-[#FF8A00] text-white font-semibold text-xs xl:text-sm"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};


export default Transfer