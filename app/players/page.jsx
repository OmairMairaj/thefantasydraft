'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Exo_2 } from 'next/font/google';
import axios from 'axios';
import PlayerModal from '../../components/PlayerModal/PlayerModal';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const PlayersListing = () => {
    const [players, setPlayers] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('rating');
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true); // Start loading before fetching
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/player`);
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

        if (filter) {
            updatedPlayers = updatedPlayers.filter(player =>
                player.position_name?.toLowerCase() === filter.toLowerCase()
            );
        }

        return updatedPlayers.sort((a, b) =>
            sort === 'name' ? a.name.localeCompare(b.name) : b.rating - a.rating
        );
    }, [search, filter, sort, players, loading]);

    const openModal = (player) => {
        setSelectedPlayer(player);
    };

    const closeModal = () => {
        setSelectedPlayer(null);
    };

    return (
        <div className={`min-h-screen flex flex-col text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 py-10 ${exo2.className}`}>
            <div className='flex items-center justify-between mb-4'>
                <h2 className="text-3xl md:text-4xl font-bold">Players</h2>
                <div className="flex w-2/3 justify-end space-x-2">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 w-1/3 rounded-lg bg-[#333] text-white"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 w-1/4 rounded-lg bg-[#333] text-white"
                    >
                        <option value="">All Positions</option>
                        <option value="attacker">Attacker</option>
                        <option value="midfielder">Midfielder</option>
                        <option value="defender">Defender</option>
                        <option value="goalkeeper">Goalkeeper</option>
                    </select>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="p-2 w-1/4 rounded-lg bg-[#333] text-white"
                    >
                        <option value="rating">Sort by Rating</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </div>

            <div className="w-full bg-[#1C1C1C] rounded-3xl h-[65vh] overflow-auto border border-[#333] scrollbar">
                <table className="table-auto w-full text-left text-white">
                    <thead className="bg-[#2f2f2f] sticky top-0">
                        <tr className="text-center">
                            <th className='p-3 max-w-4'>{sort === 'rating' ? 'Rank' : "#"}</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Position</th>
                            <th className="p-3">Rating</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {/* ✅ Show Loading State */}
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : filteredPlayers.length > 0 ? (
                            filteredPlayers.map((player, index) => (
                                <tr key={player.id} className="border-b border-[#333] text-center cursor-pointer hover:bg-[#333]"
                                    onClick={() => openModal(player)}>
                                    <td className='p-3 max-w-4'>{index + 1}</td>
                                    <td className="p-3 text-left flex items-center space-x-2">
                                        <img
                                            src={player.image_path}
                                            alt={player.name}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div>
                                            <h2 className="text-xl font-bold flex items-center">{player.common_name || player.name}</h2>
                                            <p className="text-gray-400">{player.team_name}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">{player.position_name}</td>
                                    <td className="p-3">{player.rating}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No players found.</td>
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
