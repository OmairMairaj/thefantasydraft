'use client';
import React, { useEffect, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/AlertContext/AlertContext';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const LeagueTablePage = () => {
    const [user, setUser] = useState({});
    const [leagueId, setLeagueId] = useState(null);
    const [leagueData, setLeagueData] = useState();
    const [team, setTeam] = useState();
    const [teamRank, setTeamRank] = useState(0);
    const [view, setView] = useState('Pitch');
    const [players, setPlayers] = useState();
    const [pitchViewList, setPitchViewList] = useState({
        lineup: {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        },
        bench: [],
    });
    const [gameweekDetails, setGameweekDetails] = useState({});
    const [matches, setMatches] = useState();
    const [totalPages, setTotalPages] = useState(1);
    const [gameweekName, setGameweekName] = useState(null);
    const router = useRouter();
    const { addAlert } = useAlert();

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
                    setLeagueId(storedLeagueID);
                    fetchLeague(userData.user.email, storedLeagueID); // Temporarily set league with just ID
                }
            }
        }
    }, []);

    const fetchLeague = async (user_email, leagueId) => {
        try {
            // Step 1: Get all leagues for the user
            const leagueResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyleague?leagueId=${leagueId}`);

            if (leagueResponse.data && !leagueResponse.data.error) {
                console.log(leagueResponse.data.data);
                setLeagueData(leagueResponse.data.data);
                let league = leagueResponse.data.data;
                if (league) {
                    // Step 3: Find the user's team in the selected league
                    console.log("League", league);
                    console.log("User Email", user.email);
                    const userTeam = league.teams.find(team => team.user_email === user_email);
                    setTeam(userTeam.team);
                    setTeamRank(league.teams.indexOf(userTeam) + 1);

                    if (userTeam.team) {
                        // Step 4: Fetch the fantasy team details using teamId
                        console.log(userTeam.team);
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

    useEffect(() => {
        if (team && team._id) {
            fetchTeamDetails(team._id);
        }
    }, [team]);

    const fetchTeamDetails = async (teamId) => {
        try {
            const teamResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyteam/${teamId}`);
            if (teamResponse.data && !teamResponse.data.error) {
                console.log("Team Data", teamResponse.data.data);
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

        // Group players based on in_team flag and position
        players.forEach((player) => {
            const position = player.player.position_name;

            if (positionCategories.includes(position)) {
                if (player.in_team) {
                    // Ensure lineup does not exceed 5 players per position
                    if (result.lineup[position].length < maxLimit) {
                        result.lineup[position].push(player);
                    } else {
                        result.bench.push(player);
                    }
                } else {
                    result.bench.push(player);
                }
            } else {
                console.warn(`Unknown position: ${position}`);
            }
        });

        // Sort bench players to ensure correct order for autosub functionality
        // result.bench.sort((a, b) => a._id.localeCompare(b._id));

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

    useEffect(() => {
        if (gameweekName) {
            fetchGameweekDetails(gameweekName);
            fetchMatches(gameweekName);
        }
    }, [gameweekName]);

    const fetchCurrentGameweek = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`, { cache: 'no-store' });
            if (!response.data.error) {
                setGameweekName(parseInt(response.data.data.name, 10));
                setGameweekDetails(response.data.data);
                fetchTotalGameweeks();
            }
        } catch (error) {
            console.error('Error fetching current gameweek data:', error);
        }
    };

    const fetchTotalGameweeks = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/count`);
            setTotalPages(response.data.totalGameweeks);
        } catch (error) {
            console.error('Error fetching total gameweeks:', error);
        }
    };

    const fetchGameweekDetails = async (gameweek) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/${gameweek}`);
            setGameweekDetails(response.data.data);
            console.log("Gameweek Details", response.data.data);
        } catch (error) {
            console.error('Error fetching gameweek details:', error);
        }
    };

    const fetchMatches = async (gameweek) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/match?gameweek=${gameweek}`);
            setMatches(response.data.data);
            console.log("Matches", response.data.data);
        } catch (error) {
            console.error('Error fetching match data:', error);
        }
    };

    const getRankwithSuffix = (rank) => {
        if (!rank) return '';

        let suffix = 'th';
        if (rank % 100 >= 11 && rank % 100 <= 13) {
            suffix = 'th'; // Handle exceptions like 11th, 12th, 13th
        } else {
            switch (rank % 10) {
                case 1:
                    suffix = 'st';
                    break;
                case 2:
                    suffix = 'nd';
                    break;
                case 3:
                    suffix = 'rd';
                    break;
                default:
                    suffix = 'th';
            }
        }
        return `${rank}${suffix}`;
    };

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 items-center text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            {(!matches || !team || !leagueData || !pitchViewList || !players) ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-6 w-full">
                    {/* Left */}
                    <div className='flex flex-col space-y-6'>
                        {/* League Table */}
                        <div className="bg-[#1C1C1C] rounded-xl p-6 overflow-hidden">
                            <h2 className={`text-2xl font-bold mb-4 ${exo2.className}`}>Leaderboard</h2>
                            <div className="overflow-y-auto h-96 scrollbar">
                                <table className="w-full text-gray-300">
                                    <thead className="bg-[#1C1C1C] border-b border-gray-600 sticky top-0 z-10">
                                        <tr>
                                            <th className="py-2 px-2 text-center"></th>
                                            <th className="py-2 px-2 text-left">Team</th>
                                            <th className="py-2 px-2 text-center">PTS</th>
                                            <th className="py-2 px-2 text-center">GW</th>
                                            <th className="py-2 px-2 text-center">GW-1</th>
                                            <th className="py-2 px-2 text-center">GW-2</th>
                                            <th className="py-2 px-2 text-center">GW-3</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leagueData?.teams ? (
                                            leagueData.teams.length > 0 ? (
                                                leagueData.teams.map((teamData, index) => {
                                                    return (

                                                        <tr key={index} className={`border-b border-gray-600 ${team._id === teamData.team._id ? "rounded-lg bg-[#8e6b4017] z-30" : ""}`} onClick={() => { setTeam(teamData.team); setTeamRank(index + 1) }}>
                                                            <td className="py-2 px-2 text-center">{index + 1}</td>
                                                            <td className="py-2 px-2 text-left flex items-center space-x-2">
                                                                <img
                                                                    src={teamData.team.team_image_path}
                                                                    alt={teamData.team.team_name}
                                                                    className="w-8 h-8 rounded-full"
                                                                />
                                                                <span className='truncate'>{teamData.team.team_name}</span>
                                                            </td>
                                                            <td className="py-2 px-2 text-center">{teamData.team.points || 0}</td>
                                                            <td className="py-2 px-2 text-center">0</td>
                                                            <td className="py-2 px-2 text-center">0</td>
                                                            <td className="py-2 px-2 text-center">0</td>
                                                            <td className="py-2 px-2 text-center">0</td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4 text-gray-400">
                                                        No teams found in the League.
                                                    </td>
                                                </tr>
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4 text-gray-400">
                                                    Loading Teams......
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* GameWeek Matches */}
                        <div className="bg-[#1C1C1C] rounded-xl p-6">
                            <h2 className={`text-2xl font-bold mb-4 ${exo2.className}`}>{`Gameweek ${gameweekName || ''}`}</h2>
                            {matches ?
                                (matches.length > 0 ? (
                                    matches.map((match, index) => {
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
                                        )
                                    })
                                ) : (
                                    <p className="text-gray-400 h-96">No Matches data found...</p>
                                )
                                ) : (
                                    <p className="text-gray-400 h-96">Loading matches...</p>
                                )}
                        </div>
                    </div>

                    {/* Right */}
                    <div className='flex flex-col'>

                        <div className="rounded-xl bg-[#1C1C1C] flex justify-between items-center w-full ">
                            <div className='flex space-x-1 p-4'>
                                <div className="font-bold text-center overflow-hidden">
                                    {team?.team_image_path ? (
                                        <img src={team.team_image_path} alt="Team Logo" className="w-24 h-24 object-cover" />
                                    ) : (
                                        <img src={'/images/placeholder.png'} alt="Team Logo" className="p-4 w-24 h-24 object-cover" />
                                    )}
                                </div>
                                <div className='flex flex-col justify-center'>
                                    <div className={`text-3xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                        {team?.team_name || 'Team Name'}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {team?.user_email ? 'Owner: ' + team.user_email : 'Owner: Unknown'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center m-8">
                                <div className="text-3xl font-semibold text-[#FF8A00]">
                                    {getRankwithSuffix(teamRank)}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {team ? `Points: ${team?.points || 0}` : ''}
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

                            <div className='bg-[#1C1C1C] rounded-xl p-6'>
                                {view === 'Pitch' ? (
                                    <div className="relative">
                                        <div className={`flex flex-col gap-2 ${players?.length === 0 ? 'blur-sm' : ''}`}>
                                            {/* Pitch layout */}
                                            <div className="py-6 px-4 text-white rounded-lg border border-[#333333] bg-[#1C1C1C] pitch-view">
                                                <div className="flex flex-col gap-4">
                                                    {/* Goalkeeper */}
                                                    <div className="flex justify-center items-center gap-4">
                                                        {pitchViewList.lineup.Goalkeeper.map((player) => (
                                                            <div key={player.player._id} className={`relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`}>
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

                                                            </div>
                                                        ))}
                                                        {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                    </div>

                                                    {/* Defenders */}
                                                    <div className="flex justify-center items-center gap-4">
                                                        {pitchViewList.lineup.Defender.map((player) => (
                                                            <div key={player.player._id} className={`relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`}>
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

                                                            </div>
                                                        ))}
                                                        {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                    </div>

                                                    {/* Midfielders */}
                                                    <div className="flex justify-center items-center gap-4">
                                                        {pitchViewList.lineup.Midfielder.map((player) => (
                                                            <div key={player.player._id} className={`relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`}>
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

                                                            </div>
                                                        ))}
                                                        {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                    </div>

                                                    {/* Attackers */}
                                                    <div className="flex justify-center items-center gap-4">
                                                        {pitchViewList.lineup.Attacker.map((player) => (
                                                            <div key={player.player._id} className={`relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`}>
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
                                                        <div key={player.player._id} className={`relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#333333] shadow-sm shadow-black bg-[#33333388]`}>
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

                                                        </div>
                                                    ))}
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
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default LeagueTablePage;