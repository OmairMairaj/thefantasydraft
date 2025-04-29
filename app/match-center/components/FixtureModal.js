'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { useAlert } from "@/components/AlertContext/AlertContext";



const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const FixtureModal = ({ fixture, gameweek, leagueId, onClose, handlePlayerClick }) => {
    const [leaguePoints, setLeaguePoints] = useState(null);
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [leaguePoints2, setLeaguePoints2] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [players2, setPlayers2] = useState([]);
    const { addAlert } = useAlert();
    const [pitchView, setPitchView] = useState(true); // Toggle between Pitch and List views
    const [leagueData, setLeagueData] = useState(null);
    const [leagueTable, setLeagueTable] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [standings, setStandings] = useState();
    const [matches, setMatches] = useState();
    const [totalPages, setTotalPages] = useState(1);
    const [userTeam, setUserTeam] = useState(null);
    const [leagueTeams, setLeagueTeams] = useState([]);
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
    const [pitchViewList2, setPitchViewList2] = useState({
        lineup: {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        },
        bench: [],
    });
    const [view, setView] = useState('List');
    const [selectedPlayer, setSelectedPlayer] = useState(null);


    console.log("Fixture Modal Data: ", fixture)

    useEffect(() => {
        fetchTeamDetails(fixture[0]);
        fetchLeagueTeamPoints(leagueId, fixture[0], gameweek);

        fetchTeamDetails2(fixture[1]);
        fetchLeagueTeamPoints2(leagueId, fixture[1], gameweek);
    }, []);

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

    const fetchTeamDetails2 = async (teamId) => {
        try {
            const teamResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyteam/${teamId}`);
            if (teamResponse.data && !teamResponse.data.error) {
                console.log("Team Data", teamResponse.data.data);
                setTeam2(teamResponse.data.data);
                setPlayers2(teamResponse.data.data.players);
                console.log("Players Data", teamResponse.data.data.players);
            } else {
                console.error("Error fetching team details: ", teamResponse.data.message);
                addAlert(teamResponse.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching team details:', error);
            addAlert("An error occurred while fetching team details.", "error");
        }
    };

    const fetchLeagueTeamPoints2 = async (league, team, gameweek) => {
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/points?teamID=` + team + `&leagueID=` + league + `&gameweekID=` + gameweek);
            if (response.data && !response.data.error) {
                console.log("Points Data", response.data.data);
                setLeaguePoints2(response.data.data);
            } else {
                console.error("Error fetching league points : ", response.data.message);
                // addAlert(response.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching team details:', error);
            // addAlert("An error occurred while fetching team details.", "error");
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
    const getCaptainGameweekPoints = (players, leaguePoints) => {
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


    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm w-[90%] h-[90vh] p-6 rounded-lg shadow-lg text-white relative">


                {/* Close Button */}
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold">
                    &times;
                </button>

                {team && team2 ? (
                    <div className='flex justify-between items-center'>
                        <div
                            className="w-[45%] relative  p-4 rounded-xl ml-4"
                        >

                            <div className="rounded-lg flex items-center justify-between w-full ">
                                {/* Team Stats */}
                                <div className="flex items-center relative space-x-4">
                                    <div className="text-white flex items-center justify-center font-bold text-center overflow-hidden">
                                        {team?.team_image_path ? (
                                            <img src={team.team_image_path || "/images/default_team_logo.png"} alt="Team Logo" className="w-16 h-16 object-cover rounded-md" />
                                        ) : (
                                            <img src={'/images/default_team_logo.png'} alt="Team Logo" className="w-16 h-16 object-cover rounded-md" />
                                        )}
                                    </div>
                                    <div className='flex flex-col space-y-4 '>
                                        {/* Team Name */}
                                        <div className={`mt-1 text-xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                            {team?.team_name || 'Your Team'}
                                        </div>

                                    </div>

                                </div>
                                <div className='flex items-center justify-between gap-4 mr-0'>
                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                        <p className='text-sm'>GameWeek Points</p>
                                        <p className='text-sm font-semibold'>{(leaguePoints) ? leaguePoints.team.teamPoints : 0}</p>
                                    </div>
                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                        <p className='text-sm'>Captain Points</p>
                                        <p className='text-sm font-semibold'>{leaguePoints ? getCaptainGameweekPoints(players) : 0}</p>
                                    </div>
                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                        <p className='text-sm'>Total Points</p>
                                        <p className='text-sm font-semibold'>{(leaguePoints) ? leaguePoints.team.teamPoints : 0}</p>
                                    </div>

                                </div>


                            </div>

                            <div className="rounded-xl mt-4  overflow-hidden">
                                <div className="relative w-full overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                    <div className="overflow-x-auto h-[72vh] overflow-y-auto scrollbar">
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
                                                        (p) => p.gameweek._id === gameweek
                                                    );
                                                    console.log("Player Points: ", gameweekPoints);
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
                            </div>
                        </div>

                        <div className={`flex justify-center items-center relative ${exo2.className}`} style={{ height: '3rem', width: '2rem', fontSize: '2rem' }}>
                            <span className="absolute text-[#FF8A00] font-bold" style={{ top: '-0.4rem', left: '0rem' }}>V</span>
                            <span className="absolute text-[#FF8A00] font-bold" style={{ top: '0.4rem', left: '1rem' }}>S</span>
                        </div>

                        <div
                            className="w-[45%] relative  p-4 rounded-xl ml-4"
                        >

                            <div className="rounded-lg flex items-center justify-between w-full ">
                                {/* Team Stats */}
                                <div className="flex items-center w-1/3 relative space-x-4">
                                    <div className="text-white flex items-center justify-center font-bold text-center overflow-hidden">
                                        {team2?.team_image_path ? (
                                            <img src={team2.team_image_path || "/images/default_team_logo.png"} alt="Team Logo" className="w-16 h-16 object-cover rounded-md" />
                                        ) : (
                                            <img src={'/images/default_team_logo.png'} alt="Team Logo" className="w-16 h-16 object-cover rounded-md" />
                                        )}
                                    </div>
                                    <div className='flex flex-col space-y-4 '>
                                        {/* Team Name */}
                                        <div className={`mt-1 text-xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                            {team2?.team_name || 'Your Team'}
                                        </div>

                                    </div>

                                </div>
                                <div className='flex items-center justify-between gap-4'>
                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                        <p className='text-sm'>GameWeek Points</p>
                                        <p className='text-sm font-semibold'>{(leaguePoints2) ? leaguePoints2.team.teamPoints : 0}</p>
                                    </div>
                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                        <p className='text-sm'>Captain Points</p>
                                        <p className='text-sm font-semibold'>{leaguePoints2 ? getCaptainGameweekPoints(players2, leaguePoints2) : 0}</p>
                                    </div>
                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                        <p className='text-sm'>Total Points</p>
                                        <p className='text-sm font-semibold'>{(leaguePoints2) ? leaguePoints2.team.teamPoints : 0}</p>
                                    </div>

                                </div>


                            </div>

                            <div className="rounded-xl mt-4  overflow-hidden">
                                <div className="relative w-full overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                    <div className="overflow-x-auto h-[72vh] overflow-y-auto scrollbar">
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
                                                {players2.map((player) => {
                                                    const gameweekPoints = player.player.points.find(
                                                        (p) => p.gameweek._id === gameweek
                                                    );
                                                    console.log("Player Points: ", gameweekPoints);
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
                            </div>
                        </div>
                    </div>
                )
                    :
                    <div className="w-full min-h-[70vh] flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                    </div>
                }

            </div>

        </div >
    )
}

export default FixtureModal