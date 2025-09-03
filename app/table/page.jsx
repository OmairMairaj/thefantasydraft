"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '600', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Table = () => {
    const [standings, setStandings] = useState([]);
    const router = useRouter();

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
                fetchStandings();
            }
        }
    }, []);

    const fetchStandings = () => {
        axios
            .get(process.env.NEXT_PUBLIC_BACKEND_URL + `standing`)
            .then((response) => {
                console.log(response.data.data);
                setStandings(response.data.data);
            })
            .catch((err) => console.error("Error fetching table data: ", err));
    };

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className}`}>
            {/* Table */}
            <div className="w-full">
                <h2 className="text-2xl sm:text-xl md:text-2xl xl:text-3xl font-bold mb-4">{`League Standings`}</h2>
                <div className="overflow-x-auto">
                    {standings ?
                        standings.length > 0 ? (
                            <table className="min-w-full text-white rounded-xl border border-[#1d374a] bg-[#0C1922] text-xs sm:text-sm xl:text-base" style={{ overflow: 'hidden' }}>
                                <thead className="bg-[#1d374a]">
                                    <tr className="">
                                        <th className="py-3 px-2 sm:px-4 text-left font-semibold">#</th>
                                        <th className="py-3 px-2 sm:px-4 text-left font-semibold">Club</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">P</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">W</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">D</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">L</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">GF</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">GA</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">GD</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">Points</th>
                                        <th className="py-3 px-2 sm:px-4 text-center font-semibold">Form</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((team, index) => (
                                        <tr key={team._id} className={`bg-[#0C1922] ${index % 2 === 0 ? 'bg-opacity-80' : 'bg-opacity-60'} hover:bg-opacity-90`}>
                                            <td className="py-3 px-2 sm:px-4 text-left">{team.position}</td>
                                            <td className="py-3 px-2 sm:px-4 text-left flex items-center">
                                                <img src={team.image_path} alt={`${team.name} logo`} className="w-6 h-6 sm:w-8 sm:h-8 xl:w-12 xl:h-12 mr-2 sm:mr-3" />
                                                <span className="font-bold">{team.name}</span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.games_played}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.wins}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.draws}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.lost}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.goals_scored}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.goals_conceded}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center">{team.goals_scored - team.goals_conceded}</td>
                                            <td className="py-3 px-2 sm:px-4 text-center font-bold">{team.points}</td>
                                            <td>
                                                <div className="py-2 px-2 text-center flex items-center justify-center gap-1">
                                                    {team?.form?.sort((a, b) => a.sort_order - b.sort_order).slice(-5).map((item, idx) => (
                                                        <span
                                                            key={item._id || idx}
                                                            className={`rounded-sm w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-sm sm:text-base lg:text-sm flex justify-center items-center text-white ${item.form === 'W' ? 'bg-green-500' : item.form === 'L' ? 'bg-red-500' : item.form === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}
                                                        >
                                                            {item.form}
                                                        </span>
                                                    ))
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="h-56 text-xs sm:text-sm xl:text-base text-center flex items-center justify-center text-white">No standings available at the moment.</p>
                        ) : (
                            <p className="text-xs sm:text-sm xl:text-base text-center text-white">Loading Table...</p>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Table;
