'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PlayerModal = ({ player, onClose }) => {
    const [currentGameweek, setCurrentGameweek] = useState(null);
    const [matches, setMatches] = useState(null);
    const [history, setHistory] = useState(null);
    const [fixtures, setFixtures] = useState(null);
    const [activeTab, setActiveTab] = useState('history');

    useEffect(() => {
        if (player) {
            fetchCurrentGameweek();
            fetchPlayerMatches();
        }
    }, [player]);

    // Fetch the current gameweek
    const fetchCurrentGameweek = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`);
            if (!response.data.error) {
                const currentGW = parseInt(response.data.data.name, 10);
                setCurrentGameweek(currentGW);
                filterGameweeks(currentGW);
            }
        } catch (error) {
            console.error("Error fetching current gameweek:", error);
        }
    };

    // Fetch player's matches for the season and team
    const fetchPlayerMatches = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/team-season?seasonID=${player.points[0]?.seasonID}&teamID=${player.teamID}`
            );
            if (!response.data.error) {
                setMatches(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching player matches:", error);
        }
    };

    // Filter history and fixtures based on the current gameweek
    const filterGameweeks = (currentGW) => {
        if (player?.points?.length > 0) {
            const pastGames = player.points.filter(gw => parseInt(gw.gameweek.name, 10) <= currentGW);
            const futureGames = player.points.filter(gw => parseInt(gw.gameweek.name, 10) > currentGW);
            pastGames.length > 0 ? setHistory(pastGames.sort((a, b) => parseInt(b.gameweek.name, 10) - parseInt(a.gameweek.name, 10))) : setHistory([]);
            futureGames.length > 0 ? setFixtures(futureGames.sort((a, b) => parseInt(a.gameweek.name, 10) - parseInt(b.gameweek.name, 10))) : setFixtures([]);
            // setHistory(pastGames.sort((a, b) => parseInt(b.gameweek.name, 10) - parseInt(a.gameweek.name, 10)));
            // setFixtures(futureGames.sort((a, b) => parseInt(a.gameweek.name, 10) - parseInt(b.gameweek.name, 10)));
        }
    };

    // Find the opponent team and match result
    const getMatchDetails = (gameweekID) => {

        const match = matches.find(m => m.gameweekID === gameweekID);
        if (!match) return null;

        // Identify opponent team
        const opponentTeam = match.teams.find(t => t.team_id !== player.teamID);
        const playerTeam = match.teams.find(t => t.team_id === player.teamID);

        if (!opponentTeam || !playerTeam) return null;

        // Determine home/away
        const location = opponentTeam.location === "home" ? "(A)" : "(H)";

        // Determine match result
        const playerScore = match.scores.find(s => ((s.team_id === playerTeam.team_id) && (s.score_type_name === "Current")))?.goals ?? 0;
        const opponentScore = match.scores.find(s => ((s.team_id === opponentTeam.team_id) && (s.score_type_name === "Current")))?.goals ?? 0;
        const won = playerScore > opponentScore;
        const lost = playerScore < opponentScore;
        const resultLabel = won ? "W" : lost ? "L" : "D";
        const resultColor = won ? "bg-green-500" : lost ? "bg-red-500" : "bg-gray-500";

        return { opponentTeam, location, playerScore, opponentScore, resultLabel, resultColor };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-md w-[90%] xl:w-[80%] max-w-[1280px] p-4 xl:p-6 rounded-lg shadow-lg text-white relative">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-1 sm:top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold">
                    &times;
                </button>

                {/* Player Header */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <img src={player.image_path} alt={player.name} className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24" />
                    <div>
                        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">{player.common_name || player.name}
                            <span className="ml-3 bg-yellow-500 text-black text-xs md:text-sm px-3 py-0 rounded-lg">{player.position_name}</span>
                        </h2>
                        <p className="text-gray-400 text-sm lg:text-base">{player.team_name}</p>
                    </div>
                </div>

                {/* Stats Tabs */}
                <div className="flex my-4 text-xs sm:text-sm xl:text-base">
                    <button onClick={() => setActiveTab('history')} className={`text-white font-bold py-1 px-4 ${activeTab === 'history' ? 'bg-[#FF8A00] rounded-l-md' : 'bg-[#1d374a] rounded-l-md hover:text-white text-gray-400'}`}>History</button>
                    <button onClick={() => setActiveTab('fixtures')} className={`text-white font-bold py-1 px-4 ${activeTab === 'fixtures' ? 'bg-[#FF8A00] rounded-r-md' : 'bg-[#1d374a] rounded-r-md hover:text-white text-gray-400'}`}>Fixtures</button>
                </div>

                {/* Stats Table */}
                <div className="h-[42vh] overflow-auto scrollbar">
                    <table className="w-full text-[10px] sm:text-xs xl:text-sm">
                        <thead>
                            <tr className="bg-gray-800 text-center">
                                <th className="p-2">GW</th>
                                <th className="p-2">Opponent</th>
                                {activeTab === 'history' &&
                                    <>
                                        <th className="p-2">Result</th>
                                        <th className="p-2">Points</th>
                                        <th className="p-2">MP</th>
                                        <th className="p-2">G</th>
                                        <th className="p-2">A</th>
                                        <th className="p-2">CS</th>
                                        <th className="p-2">GC</th>
                                        <th className="p-2">Saves</th>
                                        <th className="p-2">YC</th>
                                        <th className="p-2">RC</th>
                                        <th className="p-2">Bonus</th>
                                    </>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {/* Actual rows after loading */}
                            {activeTab === 'history' && Array.isArray(history) && history.length > 0 && matches !== null && (
                                history.map((game, index) => {
                                    // {(activeTab === 'history' ? history : fixtures).map((game, index) => {
                                    const matchDetails = getMatchDetails(game.gameweek.id);
                                    const stats = game.fpl_stats || {};
                                    return (
                                        <tr key={index} className="text-center border-b border-gray-700">
                                            <td className="p-2">{game.gameweek.name || '-'}</td>
                                            <td className="p-2 flex justify-center items-center space-x-2 min-w-28 ">
                                                {matchDetails ? (
                                                    <div className="flex items-center space-x-2">
                                                        <img src={matchDetails.opponentTeam.image_path} className="w-8 h-8 rounded-full" alt="opponent" />
                                                        <span>{matchDetails.opponentTeam.short_code}</span>
                                                        <span>{matchDetails?.location || '-'}</span>
                                                    </div>
                                                ) : 'Unknown'}
                                            </td>
                                            <td className="p-2 justify-center items-center space-x-2 min-w-24 sm:min-w-32 max-w-24">
                                                {matchDetails && activeTab === 'history' ? (
                                                    <div className="flex justify-center items-center space-x-2 relative">
                                                        <span>{matchDetails.playerScore} - {matchDetails.opponentScore}</span>
                                                        <span className={`absolute right-0 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-white text-xs px-2 py-1 rounded-full ${matchDetails.resultColor}`}>{matchDetails.resultLabel}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="p-2">{player.points.find((item) => item.gameweek._id === game.gameweek._id).points ?? '0'}</td>
                                            <td className="p-2">{stats["minutes-played"] ?? '0'}</td>
                                            <td className="p-2">{stats.goals ?? '0'}</td>
                                            <td className="p-2">{stats.assists ?? '0'}</td>
                                            <td className="p-2">{stats["clean-sheet"] ? 'Yes' : 'No'}</td>
                                            <td className="p-2">{stats["goals-conceded"] ?? '0'}</td>
                                            <td className="p-2">{stats.saves ?? '0'}</td>
                                            <td className="p-2">{stats.yellowcards ?? '0'}</td>
                                            <td className="p-2">{stats.redcards ?? '0'}</td>
                                            <td className="p-2">{stats.bonus ?? '0'}</td>
                                        </tr>
                                    );
                                })
                            )}
                            {activeTab === 'fixtures' && Array.isArray(fixtures) && fixtures.length > 0 && matches !== null && (
                                fixtures.map((game, index) => {
                                    // {(activeTab === 'history' ? history : fixtures).map((game, index) => {
                                    const matchDetails = getMatchDetails(game.gameweek.id);
                                    const stats = game.fpl_stats || {};
                                    return (
                                        <tr key={index} className="text-center border-b border-gray-700">
                                            <td className="p-2">{game.gameweek.name || '-'}</td>
                                            <td className="p-2 flex justify-center items-center space-x-2 min-w-28 ">
                                                {matchDetails ? (
                                                    <div className="flex items-center space-x-2">
                                                        <img src={matchDetails.opponentTeam.image_path} className="w-8 h-8 rounded-full" alt="opponent" />
                                                        <span>{matchDetails.opponentTeam.short_code}</span>
                                                        <span>{matchDetails?.location || '-'}</span>
                                                    </div>
                                                ) : 'Unknown'}
                                            </td>
                                            {/* <td className="p-2 justify-center items-center space-x-2 min-w-24 sm:min-w-32 max-w-24">
                                                {matchDetails && activeTab === 'history' ? (
                                                    <div className="flex justify-center items-center space-x-2 relative">
                                                        <span>{matchDetails.playerScore} - {matchDetails.opponentScore}</span>
                                                        <span className={`absolute right-0 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-white text-xs px-2 py-1 rounded-full ${matchDetails.resultColor}`}>{matchDetails.resultLabel}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="p-2">{player.points.find((item) => item.gameweek._id === game.gameweek._id).points ?? '0'}</td>
                                            <td className="p-2">{stats["minutes-played"] ?? '0'}</td>
                                            <td className="p-2">{stats.goals ?? '0'}</td>
                                            <td className="p-2">{stats.assists ?? '0'}</td>
                                            <td className="p-2">{stats["clean-sheet"] ? 'Yes' : 'No'}</td>
                                            <td className="p-2">{stats["goals-conceded"] ?? '0'}</td>
                                            <td className="p-2">{stats.saves ?? '0'}</td>
                                            <td className="p-2">{stats.yellowcards ?? '0'}</td>
                                            <td className="p-2">{stats.redcards ?? '0'}</td>
                                            <td className="p-2">{stats.bonus ?? '0'}</td> */}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {/* Loader for history */}
                    {activeTab === 'history' && (history === null || matches === null) && (
                        <div className="flex justify-center items-center w-full h-2/3">
                            <div className="w-10 h-10 lg:w-16 lg:h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                        </div>
                    )}
                    {/* Loader for fixtures */}
                    {activeTab === 'fixtures' && (history === null || matches === null) && (
                        <div className="flex justify-center items-center w-full h-2/3">
                            <div className="w-10 h-10 lg:w-16 lg:h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* No data after loading for History */}
                    {activeTab === 'history' && Array.isArray(history) && history.length === 0 && matches !== null && (
                        <div className="flex justify-center items-center w-full h-1/2">
                            <div className="text-center text-gray-400 py-6">
                                No history found.
                            </div>
                        </div>
                    )}
                    {/* No data after loading for Fixtures */}
                    {activeTab === 'fixtures' && Array.isArray(fixtures) && fixtures.length === 0 && matches !== null && (
                        <div className="flex justify-center items-center w-full h-1/2">
                            <div className="text-center text-gray-400 text-xs sm:text-sm xl:text-base py-6">
                                No upcoming fixtures.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerModal;
