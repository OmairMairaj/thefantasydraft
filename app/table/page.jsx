"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
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
            .get(process.env.NEXT_PUBLIC_BACKEND_URL + `/standing`)
            .then((response) => {
                console.log(response.data.data);
                setStandings(response.data.data);
            })
            .catch((err) => console.error("Error fetching table data: ", err));
    };

    return (
        <div className="min-h-[88vh] flex flex-col items-center space-y-8 px-4 sm:px-8 md:px-16 lg:px-20">
            {/* Table */}
            <div className="w-full max-w-5xl my-20">
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-10 ${exo2.className}`}>{`League Standings`}</h2>
                <div className="overflow-x-auto">
                    {standings && standings.length > 0 ? (
                        <table className="min-w-full text-white rounded-xl" style={{ overflow: 'hidden' }}>
                            <thead className="bg-[#090808]">
                                <tr className="text-xs sm:text-sm md:text-base lg:text-lg">
                                    <th className="py-3 px-2 sm:px-4 text-left font-semibold text-[#FF8A00]">#</th>
                                    <th className="py-3 px-2 sm:px-4 text-left font-semibold text-[#FF8A00]">Club</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">P</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">W</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">D</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">L</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">GF</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">GA</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">GD</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">Points</th>
                                    <th className="py-3 px-2 sm:px-4 text-center font-semibold text-[#FF8A00]">Form</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((team, index) => (
                                    <tr key={team._id} className={`bg-[#242424] ${index % 2 === 0 ? 'bg-opacity-80' : 'bg-opacity-60'} hover:bg-opacity-90 text-xs sm:text-sm md:text-base lg:text-lg`}>
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
                                        <td className="py-3 px-2 sm:px-4">{team.form.sort((a, b) => b.sort_order - a.sort_order).slice(0, 5).map((item) => item.form + " ")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-white">Loading Table...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Table;
