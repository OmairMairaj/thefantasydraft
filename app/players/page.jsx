'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import PlayerModal from '../../components/PlayerModal/PlayerModal';
import { FaRegCircleXmark } from 'react-icons/fa6';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const PlayersListing = () => {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('rating');
    const [filter, setFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);


    useEffect(() => {
        try {
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team`)
                .then((response) => {
                    if (response && response.data && response.data.data) setTeams(response.data.data);
                    else addAlert("Error fetching teams. Please try again", 'error');
                });
        } catch (error) {
            console.error("Error fetching teams data:", error);
        }
    }, []);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true); // Start loading before fetching
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/player/with-points `);
            if (response.data && !response.data.error) {
                console.log('Players:', response.data.data);
                setPlayers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false); // Stop loading after fetching
        }
    };

    // Memoized filtering & sorting
    const filteredPlayers = useMemo(() => {
        if (loading) return []; // Prevent filtering while loading

        let updatedPlayers = [...players];

        if (search) {
            updatedPlayers = updatedPlayers.filter(player =>
                player.name.toLowerCase().includes(search.toLowerCase()) ||
                player.common_name?.toLowerCase().includes(search.toLowerCase()) ||
                player.team_name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (teamFilter) {
            updatedPlayers = updatedPlayers.filter(player => (
                player.team_name?.toLowerCase() === teamFilter.toLowerCase()
            ))
        }

        if (filter) {
            updatedPlayers = updatedPlayers.filter(player =>
                player.position_name?.toLowerCase() === filter.toLowerCase()
            );
        }

        return updatedPlayers.sort((a, b) =>
            sort === 'name' ? a.name.localeCompare(b.name) : b.rating - a.rating
        );
    }, [search, filter, teamFilter, sort, players, loading]);

    const handleClear = () => {
        setSearch('');
        setFilter('');
        setTeamFilter('');
        setSort('rating');
    }

    const openModal = (player) => {
        setSelectedPlayer(player);
    };

    const closeModal = () => {
        setSelectedPlayer(null);
    };

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className}`}>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4'>
                <h2 className="text-2xl xl:text-3xl font-bold">Players</h2>
                <div className="flex mt-2 md:mt-0 w-full sm:w-[80%] flex-wrap items-center justify-between sm:justify-end space-y-1 sm:space-y-0 gap-1 sm:gap-2 text-sm xl:text-base">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-1 w-[32%] sm:w-[18%] rounded-md bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                    >
                        <option value="">All Positions</option>
                        <option value="attacker">Attacker</option>
                        <option value="midfielder">Midfielder</option>
                        <option value="defender">Defender</option>
                        <option value="goalkeeper">Goalkeeper</option>
                    </select>
                    <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        className="p-1 w-[32%] sm:w-[18%] rounded-md bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                    >
                        <option value="">Team</option>
                        {teams ? teams.map((item) => <>
                            <option value={item.name}>{item.name}</option>
                        </>) : null}
                    </select>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="p-1 w-[32%] sm:w-[18%] rounded-md bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                    >
                        <option value="rating">Sort by Rating</option>
                        <option value="name">Sort by Name</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-1 w-[77%] sm:w-[25%] rounded-md bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                    />
                    {filter || sort != 'rating' || search || teamFilter ?
                        <button className='flex w-[20%] sm:w-[10%] md:w-[15%] lg:w-[10%] items-center justify-center bg-[#1D374A] text-white px-2 py-1 rounded-full hover:bg-[#FF8A00] transition-colors' onClick={() => handleClear()}><FaRegCircleXmark /><span className='pl-1 block sm:hidden md:block'> Clear</span>
                        </button>
                        : <div className='w-auto'></div>
                    }
                </div>
            </div>

            <div className="w-full bg-[#0C1922] rounded-xl h-[65vh] overflow-auto border border-[#1D374A] scrollbar">
                <table className="table-auto w-full text-left text-white text-xs sm:text-sm xl:text-base">
                    <thead className="bg-[#1D374A] sticky top-0">
                        <tr className="text-center">
                            <th className='p-2'>{"#"}</th>
                            <th className="p-2 text-left pl-4 min-w-28 max-w-36 sm:min-w-auto sm:max-w-none">Name</th>
                            <th className="p-2">Points</th>
                            <th className="p-2">Position</th>
                            <th className="p-2">Rating</th>
                        </tr>
                    </thead>
                    <tbody className=''>
                        {/* ✅ Show Loading State */}
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : filteredPlayers.length > 0 ? (
                            filteredPlayers.map((player, index) => (
                                <tr key={player.id} className="border-b border-[#1D374A] text-center cursor-pointer hover:bg-[#273f5056]"
                                    onClick={() => openModal(player)}>
                                    <td className='p-2'>{index + 1}</td>
                                    <td className="p-2 text-left flex items-center space-x-2 min-w-28 max-w-36 sm:min-w-auto sm:max-w-none">
                                        <img
                                            src={player.image_path}
                                            alt={player.name}
                                            className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 rounded-full"
                                        />
                                        <div className='flex flex-col truncate'>
                                            <h2 className="font-bold flex items-center truncate">{player.common_name || player.name}</h2>
                                            <p className="text-[10px] sm:text-xs xl:text-sm text-gray-400 truncate">{player.team_name}</p>
                                        </div>
                                    </td>
                                    <td className="p-2">{player.total_points}</td>
                                    <td className="p-2">{player.position_name}</td>
                                    <td className="p-2">{player.rating}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">No players found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedPlayer && <PlayerModal player={selectedPlayer} onClose={closeModal} />}
        </div>
    );
};

export default PlayersListing;
