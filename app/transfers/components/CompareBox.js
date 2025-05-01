'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';


const CompareBox = ({ playerObj, label }) => {
    const [matches, setMatches] = useState([]);
    const [history, setHistory] = useState([]);
    const [fixtures, setFixtures] = useState([]);

    useEffect(() => {
        if (playerObj?.teamID && playerObj?.points?.[0]?.seasonID) {
            fetchMatches();
        }
        console.log("Player Object:", playerObj);
    }, [playerObj]);

    const fetchMatches = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/team-season?seasonID=${playerObj?.points[0]?.seasonID}&teamID=${playerObj?.teamID}`
            );
            if (!response.data.error) {
                setMatches(response.data.data);
                console.log("Matches:", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching player matches:", error);
        }
    };

    const getMatchDetails = (gameweekID) => {
        const match = matches.find(m => m.gameweekID === gameweekID);
        if (!match) return null;

        // Identify opponent team
        const opponentTeam = match.teams.find(t => t.team_id !== playerObj?.teamID);
        const playerTeam = match.teams.find(t => t.team_id === playerObj?.teamID);

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
                className={`${bg} w-5 h-5 text-black flex items-center justify-center text-xs rounded-full `}
            >
                {text}
            </div>
        );
    };

    if (!playerObj || !playerObj) {
        return <div className="bg-[#222] rounded-lg p-4 text-white">Loading...</div>;
    }


    return (
        <div className="">
            <div className="flex gap-4 items-center border-b pb-2 mb-2">
                <img src={playerObj.image_path} className="w-16 h-16 rounded-full" />
                <div>
                    <p className="text-lg font-bold flex items-center">{playerObj.common_name}<span className='ml-2'>{positionIcon(playerObj.position_name)}</span></p>
                    <p className="text-gray-400 text-sm">{playerObj.team_name}</p>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[154px] scrollbar">
                <table className="text-xs w-full text-center">
                    <thead className="bg-gray-800 sticky top-0">
                        <tr>
                            <th className="p-1">GW</th>
                            <th className="p-1">Opp</th>
                            <th className="p-1">Res</th>
                            <th className="p-1">Pts</th>
                            <th className="p-1">MP</th>
                            <th className="p-1">G</th>
                            <th className="p-1">A</th>
                            <th className="p-1">CS</th>
                            <th className="p-1">GC</th>
                            <th className="p-1">Saves</th>
                            <th className="p-1">YC</th>
                            <th className="p-1">RC</th>
                            <th className="p-1">Bonus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((game, i) => {
                            const match = getMatchDetails(game.gameweekID);
                            const matchedPoints = playerObj.points.find(
                                p => p?.gameweek?.id?.toString() === game.gameweekID.toString() && p?.gameweek?.seasonID === game.seasonID
                            );
                            const stats = matchedPoints?.fpl_stats || {};
                            const points = matchedPoints?.points ?? 0;
                            return (
                                <tr key={i}>
                                    <td>{game?.gameweekName}</td>
                                    <td>{match ? `${match.opponentTeam.short_code} ${match.location}` : '-'}</td>
                                    <td>
                                        {match ? (
                                            <div className={`rounded-full w-6 h-6 flex justify-center items-center mx-auto ${match.resultColor}`}>
                                                {match.resultLabel}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>{points}</td>
                                    <td>{stats["minutes-played"] ?? 0}</td>
                                    <td>{stats.goals ?? 0}</td>
                                    <td>{stats.assists ?? 0}</td>
                                    <td>{stats["clean-sheet"] ? '✔' : '—'}</td>
                                    <td>{stats["goals-conceded"] ?? 0}</td>
                                    <td>{stats.saves ?? 0}</td>
                                    <td>{stats.yellowcards ?? 0}</td>
                                    <td>{stats.redcards ?? 0}</td>
                                    <td>{stats.bonus ?? 0}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompareBox;
