'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const exo2 = Exo_2({
    weight: ['400', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const MatchCenterPage = () => {
    const [matches, setMatches] = useState();
    const [gameweekName, setGameweekName] = useState(null);
    const [gameweekDetails, setGameweekDetails] = useState({});
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCurrentGameweek();
    }, []);

    useEffect(() => {
        if (gameweekName) {
            fetchMatches(gameweekName);
            fetchGameweekDetails(gameweekName);
        }
    }, [gameweekName]);

    const fetchCurrentGameweek = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`, { cache: 'no-store' });
            if (!response.data.error) {
                const currentGameweek = response.data.data;
                setGameweekName(parseInt(currentGameweek.name, 10));
                setGameweekDetails(currentGameweek);
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

    const fetchMatches = async (gameweek) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/match?gameweek=${gameweek}`);
            setMatches(response.data.data);
            console.log(response.data.data);
        } catch (error) {
            console.error('Error fetching match data:', error);
        }
    };

    const fetchGameweekDetails = async (gameweek) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/${gameweek}`);
            setGameweekDetails(response.data.data);
        } catch (error) {
            console.error('Error fetching gameweek data:', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setGameweekName(newPage);
        }
    };

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 items-center text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            {(!matches) ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className='flex items-center justify-between w-full'>
                        <div className='flex flex-col mb-4'>
                            <h2 className="text-3xl font-bold">Current Game Week {gameweekName}</h2>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                        {matches && matches.length > 0 ? matches.map((match) => {
                            const homeTeam = match.teams.find((team) => team.location === 'home');
                            const awayTeam = match.teams.find((team) => team.location === 'away');
                            return (
                                <div key={match.id} className="bg-[#070E13] rounded-xl text-center space-y-4 pb-3">
                                    {/* Teams Logos and VS */}
                                    <div className="flex justify-between items-center">
                                        {/* Home Team */}
                                        <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-r from-[#0C192200] to-[#0C1922] w-full max-w-[40%]">
                                            <Image
                                                src={homeTeam?.image_path}
                                                alt={homeTeam?.team_name}
                                                width={60}
                                                height={60}
                                                className="object-contain"
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
                                            <Image
                                                src={awayTeam?.image_path}
                                                alt={awayTeam?.team_name}
                                                width={60}
                                                height={60}
                                                className="object-contain"
                                            />
                                            <span className="text-white mt-2 text-sm md:text-base">
                                                {awayTeam?.team_name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Game Date and Time */}
                                    <div className={`text-[#FF8A00] ${match.state === "Not Started" ? "text-sm sm:text-base md:text-lg" : "text-lg sm:text-xl md:text-2xl font-semibold"} ${exo2.className}`}>
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
                                    </div>
                                </div>
                            )
                        }
                        ) : (
                            <p className="text-gray-400">Loading matches...</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MatchCenterPage;
