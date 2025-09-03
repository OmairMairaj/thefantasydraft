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

const TeamModal = ({ selectedTeam, gameweek, leagueData, onClose, handlePlayerClick }) => {
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState(null);
    const [leaguePoints, setLeaguePoints] = useState(null);
    const { addAlert } = useAlert();
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
    const [selectedPlayer, setSelectedPlayer] = useState(null);


    console.log("Team Data in Modal: ", selectedTeam)

    useEffect(() => {
        fetchTeamDetails(selectedTeam._id);
        fetchLeagueTeamPoints(leagueData._id, selectedTeam._id, gameweek);
    }, []);

    const fetchTeamDetails = async (teamId) => {
        try {
            const teamResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `fantasyteam/${teamId}`);
            if (teamResponse.data && !teamResponse.data.error) {
                console.log("Team Data", teamResponse.data.data);
                setTeam(teamResponse.data.data);
                setPlayers(teamResponse.data.data.players);
                setPitchViewList(segregatePlayers(teamResponse.data.data.players));
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

    const renderSkeletons = (required, chosenCount) => {
        if (chosenCount >= required) return null;
        return Array.from({ length: Math.max(0, required - chosenCount) }).map((_, index) => (
            <div
                key={`skeleton-${index}`}
                className="relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]"
            >
                <div className="w-20 h-20 rounded-lg bg-gray-600 animate-pulse mt-2" />
                <p className="text-sm mt-6 w-full bg-gray-700 h-4 animate-pulse" />
            </div>
        ));
    };

    const segregatePlayers = (players) => {
        const positionCategories = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
        const maxLimit = 5;
        const result = {
            lineup: {
                Goalkeeper: [],
                Defender: [],
                Midfielder: [],
                Attacker: [],
            },
            bench: [],
        };

        players.forEach((player) => {
            const position = player.player.position_name;
            const isInTeam = player.in_team;

            if (!positionCategories.includes(position)) return;

            if (isInTeam) {
                if (result.lineup[position].length < maxLimit) {
                    result.lineup[position].push(player);
                } else {
                    result.bench.push(player);
                }
            } else {
                result.bench.push(player);
            }
        });
        return result;
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


    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm w-[90%] md:w-[80%] h-[90vh] max-w-[1440px] py-10 sm:py-8 lg:p-6 rounded-lg shadow-lg text-white relative overflow-hidden">


                {/* Close Button */}
                <button onClick={onClose} className="absolute px-2 top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold">
                    &times;
                </button>

                {team ? (
                    <div className='flex flex-col lg:flex-row justify-between items-center overflow-y-auto max-h-[82vh] scrollbar gap-4'>
                        <div
                            className="w-full relative px-4 sm:px-8 lg:p-4 rounded-xl"
                        >
                            <div className="flex items-center justify-between w-full ">
                                {/* Team Stats */}
                                <div className="flex items-center relative space-x-2 xl:space-x-4">
                                    <div className="text-white flex items-center justify-center font-bold text-center overflow-hidden">
                                        <img src={team?.team_image_path ? team.team_image_path : "/images/default_team_logo.png"} alt="Team Logo" className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-md" />
                                    </div>
                                    <div className='flex flex-col space-y-4 '>
                                        {/* Team Name */}
                                        <div className={`mt-1 text-lg sm:text-xl md:text-2xl font-semibold break-words text-[#FF8A00] mr-2 ${exo2.className}`}>
                                            {team?.team_name || 'Your Team'}
                                        </div>

                                    </div>
                                </div>
                                <div className='flex items-center justify-between gap-2 sm:gap-4 mr-0 sm:mr-4 text-[10px] sm:text-sm md:text-base'>
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
                                                                    (p) => p.gameweek._id === gameweek
                                                                );
                                                                return (
                                                                    <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                        <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
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
                                                                    (p) => p.gameweek._id === gameweek
                                                                );
                                                                return (
                                                                    <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                        <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
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
                                                                    (p) => p.gameweek._id === gameweek
                                                                );
                                                                return (
                                                                    <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                        <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
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
                                                                    (p) => p.gameweek._id === gameweek
                                                                );
                                                                return (
                                                                    <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                        <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
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
                                                                (p) => p.gameweek._id === gameweek
                                                            );
                                                            return (
                                                                <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                                    <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
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
                                                <div className='ribbon-2 text-sm sm:text-base md:text-lg text-[#ff7A00] text-center'>
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
                                                                            (p) => p.gameweek._id === gameweek
                                                                        );
                                                                        return (
                                                                            <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
                                                                                {/* Player Name + Image */}
                                                                                <td className="px-2 text-left truncate max-w-28">
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
                                                                        (p) => p.gameweek._id === gameweek
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
                                                                            <td className="p-2 text-center">
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

export default TeamModal;