'use client';
import React, { useEffect, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/AlertContext/AlertContext';
import TeamDetailsModal from '@/components/TeamDetailsModal/TeamDetailsModal';
import PlayerModal from '@/components/PlayerModal/PlayerModal';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const LeagueTablePage = () => {
    const [user, setUser] = useState({});
    // const [leagueId, setLeagueId] = useState(null);
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
    // const [gameweekDetails, setGameweekDetails] = useState({});
    const [matches, setMatches] = useState();
    // const [totalPages, setTotalPages] = useState(1);
    const [gameweekName, setGameweekName] = useState(null);
    const [headToHeadTable, setHeadToHeadTable] = useState([]);
    const [classicTable, setClassicTable] = useState([]);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [viewPlayer, setViewPlayer] = useState(null);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
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
                console.log("User (user): ", userData.user);
                fetchCurrentGameweek();

                // Check if selectedLeagueID is in sessionStorage
                const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
                if (storedLeagueID) {
                    // setLeagueId(storedLeagueID);
                    console.log("League ID from session storage (leagueId): ", storedLeagueID);
                    fetchLeague(userData.user.email, storedLeagueID); // Temporarily set league with just ID
                } else {
                    // If no league ID is found, redirect to dashboard
                    router.push("/dashboard");
                    addAlert("No league selected. Please select a league from the dashboard.", "error");
                }
            }
        }
    }, []);

    useEffect(() => {
        if (showTeamModal && window.innerWidth < 1024) {
            // Prevent background scroll
            document.body.style.overflow = 'hidden';
        } else if (!showTeamModal || window.innerWidth >= 1024) {
            // Restore scroll
            document.body.style.overflow = '';
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [showTeamModal]);

    useEffect(() => {
        if (showPlayerModal) {
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
    }, [showPlayerModal]);

    const fetchCurrentGameweek = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`, { cache: 'no-store' });
            if (!response.data.error) {
                setGameweekName(parseInt(response.data.data.name, 10));
                console.log("Gameweek (gameweekName): ", parseInt(response.data.data.name, 10));
                // setGameweekDetails(response.data.data);
                // fetchTotalGameweeks();
            }
        } catch (error) {
            console.error('Error fetching current gameweek data:', error);
        }
    };

    useEffect(() => {
        if (gameweekName) {
            // fetchGameweekDetails(gameweekName);
            fetchMatches(gameweekName);
        }
    }, [gameweekName]);

    const fetchMatches = async (gameweek) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/match?gameweek=${gameweek}`);
            setMatches(response.data.data);
            console.log("Matches", response.data.data);
        } catch (error) {
            console.error('Error fetching match data:', error);
        }
    };

    const fetchLeague = async (user_email, leagueId) => {
        try {
            // Step 1: Get all leagues for the user
            const leagueResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyleague?leagueId=${leagueId}`);

            if (leagueResponse.data && !leagueResponse.data.error) {
                setLeagueData(leagueResponse.data.data);
                console.log("League Data (leagueData): ", leagueResponse.data.data);
                let league = leagueResponse.data.data;
                if (league) {
                    // Step 3: Find the user's team in the selected league
                    console.log("League", league);
                    const userTeam = league.teams.find(team => team.user_email === user_email);
                    setTeam(userTeam.team);
                    console.log("Users Team (team): ", userTeam.team);
                    setTeamRank(league.teams.indexOf(userTeam) + 1);
                    console.log("Team rank by index of league.teams (teamRank): ", league.teams.indexOf(userTeam) + 1);

                    if (userTeam.team) {
                        // Step 4: Fetch the fantasy team details using teamId
                        // console.log(userTeam.team);
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
        if (leagueData) {
            const headToHeadData = leagueData.head_to_head_points.sort((a, b) => b.points - a.points);
            const classicData = leagueData.classic_points.sort((a, b) => b.points_total - a.points_total);

            // Show leaderboard (you can sort or manipulate if needed)
            setHeadToHeadTable(headToHeadData);
            console.log("Head to Head Table (headToHeadTable): ", headToHeadData);
            setClassicTable(classicData);
            console.log("Classic Table (classicData): ", classicData);
        }
    }, [leagueData]);

    //if team changes onClick, fetch the team details
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
                console.log("Players (players): ", teamResponse.data.data.players);
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

    // const fetchTotalGameweeks = async () => {
    //     try {
    //         const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/count`);
    //         setTotalPages(response.data.totalGameweeks);
    //     } catch (error) {
    //         console.error('Error fetching total gameweeks:', error);
    //     }
    // };

    // const fetchGameweekDetails = async (gameweek) => {
    //     try {
    //         const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/${gameweek}`);
    //         setGameweekDetails(response.data.data);
    //         console.log("Gameweek Details", response.data.data);
    //     } catch (error) {
    //         console.error('Error fetching gameweek details:', error);
    //     }
    // };

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
        return (
            <div className="flex items-end">
                <span className="text-4xl font-semibold text-[#FF8A00]">
                    {rank}
                </span>
                <span className="text-base text-[#FF8A00]">
                    {suffix}
                </span>
            </div>
        );
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

    const handleTeamClick = (teamData, rank) => {
        setTeam(teamData);
        setTeamRank(rank);
        // Show modal only if <lg
        if (window.innerWidth < 1024) setShowTeamModal(true);
    };

    const handlePlayerClick = (player) => {
        setViewPlayer(player.player);
        setShowPlayerModal(true);
    }

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 items-center text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            {(!matches || !team || !leagueData || !pitchViewList || !players) ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {/* Left */}
                    <div className='flex flex-col space-y-6'>
                        {/* League Table */}
                        <div className="bg-[#0C1922] rounded-xl px-4 py-4 sm:px-6 sm:py-6 lg:px-4 xl:px-6 overflow-hidden">
                            <h2 className={`text-xl xl:text-2xl font-bold mb-4 ${exo2.className}`}>Leaderboard</h2>
                            <div className="overflow-y-auto h-96 scrollbar">
                                <table className="w-full text-gray-300 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base">
                                    <thead className="bg-[#0C1922] border-b border-gray-600 sticky top-0 z-10">
                                        {leagueData?.league_configuration.format === "Head to Head" ?
                                            <tr>
                                                <th className="hidden sm:table-cell lg:hidden xl:table-cell py-2 px-2 text-center"></th>
                                                <th className="py-2 px-2 text-left">Team</th>
                                                <th className="py-2 px-2 text-center">Pts</th>
                                                <th className="py-2 px-2 text-center">Won</th>
                                                <th className="py-2 px-2 text-center">Lost</th>
                                                <th className="py-2 px-2 text-center">Draw</th>
                                                <th className="py-2 px-2 text-center">Form</th>
                                            </tr>
                                            :
                                            <tr>
                                                <th className="hidden sm:table-cell lg:hidden xl:table-cell py-2 px-2 text-center"></th>
                                                <th className="py-2 px-2 text-left">Team</th>
                                                <th className="py-2 px-2 text-center">PTS</th>
                                                <th className="py-2 px-2 text-center">GW</th>
                                                {/* <th className="py-2 px-2 text-center">GW-1</th>
                                                <th className="py-2 px-2 text-center">GW-2</th>
                                                <th className="py-2 px-2 text-center">GW-3</th> */}
                                            </tr>
                                        }
                                    </thead>
                                    <tbody>
                                        {leagueData?.league_configuration.format === "Head to Head" &&
                                            headToHeadTable && headToHeadTable.map((teamData, index) => (
                                                <tr key={index} className={`border-b border-gray-600 cursor-pointer ${team._id === teamData.team._id ? "rounded-lg bg-[#a3743b3c] z-30" : ""}`} onClick={() => handleTeamClick(teamData.team, index + 1)}>
                                                    <td className="hidden sm:table-cell lg:hidden xl:table-cell py-2 px-2 text-center">{index + 1}</td>
                                                    <td className="py-2 px-2 text-left flex items-center space-x-2 min-w-32">
                                                        <img
                                                            src={teamData.team.team_image_path || "/images/default_team_logo.png"}
                                                            alt={teamData.team.team_name}
                                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-md object-cover"
                                                        />
                                                        <span className='truncate'>{teamData.team.team_name}</span>
                                                    </td>
                                                    <td className="py-2 px-2 text-center">{leagueData?.draftID?.state === "Ended" ? teamData.points || 0 : "--"}</td>
                                                    <td className="py-2 px-2 text-center">{leagueData?.draftID?.state === "Ended" ? teamData.wins || 0 : "--"}</td>
                                                    <td className="py-2 px-2 text-center">{leagueData?.draftID?.state === "Ended" ? teamData.loses || 0 : "--"}</td>
                                                    <td className="py-2 px-2 text-center">{leagueData?.draftID?.state === "Ended" ? teamData.draws || 0 : "--"}</td>
                                                    <td>
                                                        <div className="py-2 px-2 text-center flex items-center justify-center gap-1">
                                                            {(teamData?.form?.replace(/\s/g, '') || '').split('').slice(-5).map((result, idx) => (
                                                                <span key={idx} className={`rounded-sm w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-sm sm:text-base lg:text-sm flex justify-center items-center text-white ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : result === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}>{result}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        {leagueData?.league_configuration.format === "Classic" &&
                                            classicTable && classicTable.map((teamData, index) => (
                                                <tr key={index} className={`border-b border-gray-600 ${team._id === teamData.team._id ? "rounded-lg bg-[#8e6b4017] z-30" : ""}`} onClick={() => handleTeamClick(teamData.team, index + 1)}>
                                                    <td className="hidden sm:table-cell lg:hidden xl:table-cell py-2 px-2 text-center">{index + 1}</td>
                                                    <td className="py-2 px-2 text-left flex items-center space-x-2">
                                                        <img
                                                            src={teamData.team.team_image_path || "/images/default_team_logo.png"}
                                                            alt={teamData.team.team_name}
                                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-md object-cover"
                                                        />
                                                        <span className='truncate'>{teamData.team.team_name}</span>
                                                    </td>
                                                    <td className="py-2 px-2 text-center">{leagueData?.draftID?.state === "Ended" ? teamData.points_total || 0 : "--"}</td>
                                                    <td className="py-2 px-2 text-center">{leagueData?.draftID?.state === "Ended" ? teamData.points_current || 0 : "--"}</td>
                                                    {/* <td className="py-2 px-2 text-center">0</td>
                                                    <td className="py-2 px-2 text-center">0</td>
                                                    <td className="py-2 px-2 text-center">0</td> */}
                                                </tr>
                                            ))
                                        }
                                        {/* {leagueData?.teams ? (
                                            leagueData.teams.length > 0 ? (
                                                leagueData.teams.map((teamData, index) => {
                                                    return (

                                                        <tr key={index} className={`border-b border-gray-600 ${team._id === teamData.team._id ? "rounded-lg bg-[#8e6b4017] z-30" : ""}`} onClick={() => { setTeam(teamData.team); setTeamRank(index + 1) }}>
                                                            <td className="py-2 px-2 text-center">{index + 1}</td>
                                                            <td className="py-2 px-2 text-left flex items-center space-x-2">
                                                                <img
                                                                    src={teamData.team.team_image_path}
                                                                    alt={teamData.team.team_name}
                                                                    className="w-8 h-8 rounded-md"
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
                                        )} */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* GameWeek Matches */}
                        <div className="bg-[#0C1922] rounded-xl px-4 py-4 sm:px-6 sm:py-6 lg:px-4 xl:px-6">
                            <h2 className={`text-xl xl:text-2xl font-bold mb-4 ${exo2.className}`}>{`Gameweek ${gameweekName || ''}`}</h2>
                            {matches ?
                                (matches.length > 0 ? (
                                    matches.map((match, index) => {
                                        const homeTeam = match.teams.find((team) => team.location === 'home');
                                        const awayTeam = match.teams.find((team) => team.location === 'away');
                                        return (
                                            <div
                                                key={match.id}
                                                className="flex justify-between items-center border-b border-gray-600 py-2 px-2 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base"
                                            >
                                                {/* Home Team */}
                                                <div className="w-2/5 flex items-center space-x-2">
                                                    <img
                                                        src={homeTeam?.image_path}
                                                        alt={homeTeam?.team_name}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                                                    />
                                                    <span className="truncate block text-ellipsis overflow-hidden">
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
                                                    <span className="truncate block text-ellipsis overflow-hidden text-right">
                                                        {awayTeam?.team_name || 'N/A'}
                                                    </span>
                                                    <img
                                                        src={awayTeam?.image_path}
                                                        alt={awayTeam?.team_name}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
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
                    <div className='hidden lg:flex flex-col'>
                        <div className="rounded-xl bg-[#0C1922] flex justify-between items-center w-full ">
                            <div className='flex space-x-4 p-4'>
                                <div className="font-bold text-center overflow-hidden">
                                    <img src={team.team_image_path ? team.team_image_path : "/images/default_team_logo.png"} alt="Team Logo" className="w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16 xl:w-20 xl:h-20 object-cover rounded-md " />
                                </div>
                                <div className='flex flex-col justify-center'>
                                    <div className={`text-2xl md:text-3xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                        {team?.team_name || 'Team Name'}
                                    </div>
                                    <div className="text-xs xl:text-sm text-gray-400">
                                        {team?.user_email ? 'Owner: ' + team.user_email : 'Owner: Unknown'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center lg:mx-4 xl:mx-6">
                                <div className="text-2xl md:text-3xl font-semibold text-[#FF8A00]">
                                    {leagueData?.draftID?.state === "Ended"
                                        ? getRankwithSuffix(
                                            leagueData.league_configuration.format === "Head to Head"
                                                ? headToHeadTable?.findIndex((t) => t.team._id === team?._id) + 1
                                                : classicTable?.findIndex((t) => t.team._id === team?._id) + 1
                                        )
                                        : "--"}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {leagueData?.league_configuration.format === "Head to Head" ? "League Points: " : "Total Points: "}
                                    {leagueData?.draftID?.state === "Ended"
                                        ? leagueData.league_configuration.format === "Head to Head"
                                            ? headToHeadTable?.find((t) => t.team._id === team?._id)?.points ?? 0
                                            : classicTable?.find((t) => t.team._id === team?._id)?.points_total ?? 0
                                        : "--"}
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
                                                        {pitchViewList.lineup.Goalkeeper.map((player) => (
                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
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

                                                            </div>
                                                        ))}
                                                        {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                    </div>

                                                    {/* Defenders */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Defender.map((player) => (
                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
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

                                                            </div>
                                                        ))}
                                                        {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                    </div>

                                                    {/* Midfielders */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Midfielder.map((player) => (
                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
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

                                                            </div>
                                                        ))}
                                                        {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                    </div>

                                                    {/* Attackers */}
                                                    <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                        {pitchViewList.lineup.Attacker.map((player) => (
                                                            <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
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
                                                        <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
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

                                                        </div>
                                                    ))}
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
                                                                {pitchViewList.lineup[pos].map((player) => (
                                                                    <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
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
                                                                <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
                                                                    {/* Player Name + Image */}
                                                                    {/* Player Name + Image */}
                                                                    <td className="px-2 text-left truncate max-w-28 sm:max-w-none">
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
                    </div>

                </div>
            )}
            {showTeamModal &&
                <div className='flex lg:hidden'>
                    <TeamDetailsModal
                        show={showTeamModal}
                        onClose={() => setShowTeamModal(false)}
                        leagueData={leagueData}
                        headToHeadTable={headToHeadTable}
                        classicTable={classicTable}
                        teamRank={teamRank}
                        team={team}
                        pitchViewList={pitchViewList}
                        handlePlayerClick={handlePlayerClick}
                        view={view}
                        setView={setView}
                        exo2={exo2}
                    />
                </div>
            }
            {showPlayerModal && <PlayerModal player={viewPlayer} onClose={() => setShowPlayerModal(false)} />}
        </div>
    );
};

export default LeagueTablePage;