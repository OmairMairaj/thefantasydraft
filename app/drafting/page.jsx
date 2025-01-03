'use client';

import React, { useEffect, useState } from 'react';
import { Suspense } from "react";
import { Exo_2 } from 'next/font/google';
import { FaBell, FaCog, FaDraft2Digital, FaPlay, FaLink } from 'react-icons/fa';
import { LuGrip } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAlert } from '@/components/AlertContext/AlertContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from '@/components/Modal/Modal';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Drafting = () => {

    const [user, setUser] = useState(null);
    const [leagueID, setLeagueID] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [players, setPlayers] = useState([]);
    const [autoPickList, setAutoPickList] = useState([]);
    const [originalPickList, setOriginalPickList] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('name'); // Default sorting by name
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftOrder, setDraftOrder] = useState(draftData?.order || []);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { addAlert } = useAlert();

    useEffect(() => {
        // Get user from session storage
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser).user);
        } else {
            console.error("User not found in session storage");
        }

        // Extract leagueID from the URL using window.location
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const leagueIDFromURL = urlParams.get('leagueID');

            if (leagueIDFromURL) {
                setLeagueID(leagueIDFromURL);
            } else {
                console.error("League ID not found in URL");
            }
        }
    }, []);

    useEffect(() => {
        // Fetch league data if user and leagueID are available
        if (user && leagueID) {
            fetchdraftData();
            fetchPlayers();
        }
    }, [user, leagueID]);

    const fetchdraftData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft?leagueID=${leagueID}`
            );
            if (response.data && !response.data.error) {
                setDraftData(response.data.data[0]);
                console.log("draftData: ", response.data.data[0]);


                // Check if the current user is the creator of the league
                if (response.data.data[0].creator === user.email) {
                    setIsCreator(true);
                } else {
                    setIsCreator(false);
                }

                if (response.data.data[0].state === 'Scheduled') {
                    const startTime = new Date(response.data.data[0].start_date).getTime();
                    const now = Date.now();
                    setTimeRemaining(startTime - now > 0 ? startTime - now : 0);
                }
            } else {
                console.error("Failed to fetch league data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching league data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (draftData?.state === 'Scheduled' && timeRemaining > 0) {
            const interval = setInterval(() => {
                setTimeRemaining((prev) => (prev > 1000 ? prev - 1000 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [draftData, timeRemaining]);

    useEffect(() => {
        if (draftData) fetchPickList();
    }, [draftData]);

    const formatTime = (ms) => {
        const hours = String(Math.floor(ms / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((ms % (1000 * 60)) / 1000)).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
        if (draftData?.order) {
            setDraftOrder([...draftData.order]); // Ensure it's a new array
        }
    }, [draftData]);

    // Fetch players from API
    const fetchPlayers = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/player`);
            if (response.data && !response.data.error) {
                setPlayers(response.data.data || []);
                console.log("Players:", response.data.data);


                // // Check if the current user is the creator of the league
                // if (response.data.data[0].creator === user.email) {
                //     setIsCreator(true);
                // } else {
                //     setIsCreator(false);
                // }

                // if (response.data.data[0].state === 'Scheduled') {
                //     const startTime = new Date(response.data.data[0].start_date).getTime();
                //     const now = Date.now();
                //     setTimeRemaining(startTime - now > 0 ? startTime - now : 0);
                // }
            } else {
                console.error("Failed to fetch league data:", response.data.message);
            }


        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    // Fetch players from API
    const fetchPickList = async () => {
        try {
            let teamID = ""
            draftData.teams.map((item) => { if (item.user_email === user.email) teamID = item.team._id });
            const link = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyteam/" + teamID + "/picklist"
            const response = await axios.get(link);
            if (response.data && !response.data.error) {
                setAutoPickList(response.data.data);
                setOriginalPickList(response.data.data);
                console.log("PickList:", response.data.data);
            } else {
                console.error("Failed to fetch league data:", response.data.message);
            }

        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    // Update `hasUnsavedChanges` whenever `autoPickList` changes
    useEffect(() => {
        const isChanged = JSON.stringify(autoPickList) !== JSON.stringify(originalPickList);
        setHasUnsavedChanges(isChanged);
    }, [autoPickList, originalPickList]);


    const handlePick = (player) => {
        setAutoPickList((prevList) =>
            prevList.some((p) => p._id === player._id) ? prevList : [...prevList, player]
        );
    };

    const removeFromPickList = (item) => {
        setAutoPickList((prevList) => prevList.filter((p) => p._id !== item._id));
    };

    const saveAutoPickList = async () => {
        try {
            let teamID = ""
            draftData.teams.map((item) => { if (item.user_email === user.email) teamID = item.team._id });
            const link = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyteam/" + teamID + "/picklist"
            const pickList = autoPickList.map(i => i._id)
            const response = await axios.post(link, { id_array: pickList });
            // console.log(response);
            if (response.data && !response.data.error) {
                addAlert("Auto Pick List have been saved", "success");
                setOriginalPickList([...autoPickList]); // Update original list after saving
                setHasUnsavedChanges(false);
            }
            else addAlert("Auto Pick List can not be saved. Please try again", "error");
        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    const saveOrder = async () => {
        try {
            const link = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasydraft"
            const body = {
                draftData: {
                    _id: draftData._id,
                    order: draftOrder
                }
            }
            // console.log(body)
            const response = await axios.post(link, body);
            // console.log(response);
            if (response.data && response.data.data && !response.data.error) {
                addAlert("New order has been saved", "success");
                // setDraftData(response.data.data);
            }
            else addAlert("Order can not be saved. Please try again", "error");
        } catch (error) {
            console.error('Failed to update order :', error);
        }
    };

    // const debounce = (fn, delay) => {
    //     let timeout;
    //     return (...args) => {
    //         clearTimeout(timeout);
    //         timeout = setTimeout(() => fn(...args), delay);
    //     };
    // };

    const handleSearch = (value) => {
        setSearch(value);
    }

    const filteredPlayers = players
        .filter((player) =>
            // Filter players by name or common_name
            player.name.toLowerCase().includes(search.toLowerCase()) ||
            player.common_name?.toLowerCase().includes(search.toLowerCase()) ||
            player.team_name?.toLowerCase().includes(search.toLowerCase())
        )
        .filter((player) =>
            // Filter by position if filter is set
            !filter || player.position_name?.toLowerCase() === filter.toLowerCase()
        )
        .sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'rating') return b.rating - a.rating; // Example for sorting by rating
            return 0;
        });


    // const simulatedOrder = Array.from({ length: 20 }, (_, i) => `user${i + 1}@example.com`);
    // const simulatedTeams = simulatedOrder.map((email, index) => ({
    //     user_email: email,
    //     team: {
    //         team_name: `Team ${index + 1}`,
    //         team_image_path: "https://via.placeholder.com/100", // Replace with actual URLs
    //     },
    // }));

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
                className={`${bg} w-7 h-7 text-black flex items-center justify-center text-sm my-4 rounded-full `}
            >
                {text}
            </div>
        );
    };

    useEffect(() => {
        // Add or remove the "no-scroll" class to the body element based on modal state
        if (isModalOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        // Cleanup when the component is unmounted
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isModalOpen]);

    const handleOrderSaveChanges = () => {
        // Call the function to update the draft order in the backend
        saveOrder();
        fetchdraftData();
        setIsModalOpen(false); // Close the modal
    };

    // Handle Drag End
    const handleOrderDragEnd = (result) => {
        if (!result.destination) return; // Exit if dropped outside the list

        const reorderedList = Array.from(draftOrder);
        const [movedItem] = reorderedList.splice(result.source.index, 1);
        reorderedList.splice(result.destination.index, 0, movedItem);

        setDraftOrder(reorderedList);
    };

    // Function to handle drag-and-drop reordering
    const handleDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const reorderedList = Array.from(autoPickList);
        const [movedItem] = reorderedList.splice(result.source.index, 1); // Remove dragged item
        reorderedList.splice(result.destination.index, 0, movedItem); // Insert it at the new position

        setAutoPickList(reorderedList); // Update state with new order
    };


    const handleStart = async () => {
        if (draftData && user) {
            console.log("DraftID: ", draftData._id);
            console.log("User Email: ", user.email);
            if (draftData.state === 'Manual' || draftData.state === 'Scheduled') {
                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft/startNow`, { draftID: draftData._id, user_email: user.email });
                    if (response.data && !response.data.error) {
                        addAlert("Draft has been started", "success");
                        setDraftData(response.data.data);
                        console.log(response.data.data);
                        router.push('/draft-start?draftID=' + draftData._id);
                    } else {
                        addAlert(response.data.message, "error");
                    }
                } catch (error) {
                    console.error('Failed to start draft:', error);
                }
            } else {
                addAlert("Draft is already in Progress", "info");
                router.push('/draft-start?draftID=' + draftData._id);
            }

        }
    }


    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-[88vh] flex flex-col my-16 text-white px-6 md:px-10 lg:px-16 xl:px-20 pb-10">
                {/* Admin Section */}
                {isCreator ? (
                    <div className="bg-[#1C1C1C] w-full rounded-xl shadow-lg p-6 mb-8 flex justify-between align-bottom relative">
                        <div className="flex flex-col space-y-2 w-2/3">
                            <h2 className={`text-4xl font-bold ${exo2.className}`}>Admin</h2>
                            <p className="text-gray-400">Actions only available to Admin.</p>
                            {/* Invite Section */}
                            <div className="flex space-x-4 mb-8 items-center">
                                <div className='text-white mr-1'>Invite Code:</div>
                                <div
                                    className="bg-[#303030] w-1/2 px-4 py-2 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]"
                                >{draftData?.leagueID?.invite_code}</div>
                                <button
                                    className="fade-gradient py-2 px-6 rounded-full flex items-center space-x-2"
                                    onClick={() => {
                                        let inviteCode
                                        if (draftData && draftData.leagueID && draftData.leagueID.invite_code) {
                                            inviteCode = process.env.NEXT_PUBLIC_FRONTEND_URL + "join-league-process?code=" + draftData.leagueID.invite_code;
                                            navigator.clipboard
                                                .writeText(inviteCode)
                                                .then(() => {
                                                    addAlert("Invite code copied to clipboard!", "success");
                                                })
                                                .catch((error) => {
                                                    console.error("Failed to copy invite code:", error);
                                                    addAlert("Failed to copy invite code. Please try again.", "error");
                                                });
                                        } else {
                                            addAlert("No invite code available to copy.", 'error');
                                        }
                                    }}
                                >
                                    <FaLink />
                                    <span>Copy Invite Link</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-4 absolute bottom-0 right-0 mb-6 px-6">
                            <button onClick={() => handleStart()} className="bg-[#FF8A00] py-2 px-6 text-lg rounded-full flex items-center space-x-2 hover:bg-[#FF9A00]">
                                <FaPlay />
                                <span>Start Draft</span>
                            </button>
                            <Link href={'/drafting/settings?draftID=' + draftData?._id} className="bg-[#333333] py-2 px-6 text-lg rounded-full flex items-center space-x-2 hover:bg-[#444444]">
                                <FaCog />
                                <span>League Settings</span>
                            </Link>
                        </div>
                    </div>
                )
                    :
                    (
                        <div className='flex justify-between'>
                            <h1 className={`text-4xl font-bold ${exo2.className} mb-4`}>Pre-Draft Page</h1>
                            <div className="flex space-x-4 mb-4 px-6">
                                <Link href={'/draft-start?draftID=' + draftData?._id} className="bg-[#FF8A00] py-2 px-6  text-lg rounded-full flex items-center space-x-2 hover:bg-[#FF9A00]">
                                    <FaPlay />
                                    <span>Start Draft</span>
                                </Link>
                                <Link href={'/drafting/settings?draftID=' + draftData?._id} className="bg-[#333333] py-2 px-6  text-lg rounded-full flex items-center space-x-2 hover:bg-[#444444]">
                                    <FaCog />
                                    <span>League Settings</span>
                                </Link>
                            </div>
                        </div>
                    )
                }


                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {/* Drafting Info Section */}
                        <div className="flex justify-between mb-8">
                            <div className="flex flex-col space-y-4 w-1/3 pr-4 border-r border-[#404040]">
                                <div className="bg-[#333333] px-4 py-4 rounded-lg text-center">
                                    {draftData?.state === 'Manual' && (
                                        <p className="text-base">The draft is set to manual and will be started by the admin.</p>
                                    )}
                                    {draftData?.state === 'Scheduled' && timeRemaining > 0 && (
                                        <p className="text-base">
                                            The draft is scheduled and will start on <br />
                                            {new Date(draftData?.start_date).toLocaleString(undefined, {
                                                weekday: 'long', // Show full day name (e.g., Monday)
                                                year: 'numeric',
                                                month: 'long', // Show full month name (e.g., December)
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })}
                                            .
                                        </p>
                                    )}
                                    {draftData?.state === 'In Process' && (
                                        <p className="text-lg">The draft is currently in progress.</p>
                                    )}
                                    {draftData?.state === 'Ended' && (
                                        <p className="text-lg">The draft has ended.</p>
                                    )}
                                </div>

                                <div className="bg-[#333333] px-8 py-4 rounded-lg text-center">
                                    {draftData?.state === 'Manual' && (
                                        <>
                                            <p className="text-2xl">Draft Type</p>
                                            <p className="text-5xl text-white mt-2">Manual</p>
                                        </>
                                    )}
                                    {draftData?.state === 'Scheduled' && (
                                        <>
                                            <p className="text-2xl">Time Remaining</p>
                                            <p className="text-5xl text-white mt-2">{formatTime(timeRemaining)}</p>
                                        </>
                                    )}
                                    {draftData?.state === 'In Process' && (
                                        <>
                                            <p className="text-2xl">Draft Status</p>
                                            <p className="text-5xl text-white mt-2">{draftData?.state}</p>
                                        </>
                                    )}
                                    {draftData?.state === 'Ended' && (
                                        <>
                                            <p className="text-2xl">Draft Status</p>
                                            <p className="text-5xl text-white mt-2">{draftData?.state}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2 w-2/3 pl-4">
                                <div className='flex justify-between'>
                                    <div className={`flex text-xl items-center ${exo2.className}`}>Draft Order:<span className='text-base ml-2 text-gray-400'>{`(Round 1 order)`}</span></div>
                                    {isCreator && (
                                        <button className="fade-gradient text-white px-6 py-1 rounded-full" onClick={() => setIsModalOpen(true)}>Change Order</button>
                                    )}
                                </div>
                                <div className="overflow-x-auto pb-2 scrollbar">
                                    <div className="flex gap-4 min-w-max">
                                        {draftData?.order.map((email, index) => {
                                            // Find the team corresponding to the current email in the order
                                            const teamData = draftData?.teams.find((team) => team.user_email === email);
                                            // console.log(teamData);
                                            return (
                                                <div
                                                    key={index}
                                                    className="bg-[#1C1C1C] flex flex-col items-center justify-center text-center h-[140px] w-[200px] rounded-lg hover:bg-[#444444]"
                                                >
                                                    {teamData ? (
                                                        <>
                                                            <p className="text-sm text-[#FF8A00] mb-2">{`Turn ${index + 1}`}</p>
                                                            {/* Show the team logo */}
                                                            {teamData.team?.team_image_path && (
                                                                <img
                                                                    src={teamData.team.team_image_path}
                                                                    alt={teamData.team.team_name}
                                                                    className="w-14 h-14 rounded-lg mb-2"
                                                                />
                                                            )}
                                                            {/* Show the team name */}
                                                            <p className="text-sm">{teamData.team.team_name || "Unnamed Team"}</p>
                                                        </>
                                                    ) : (
                                                        <p>No Team Found</p>
                                                    )}
                                                </div>

                                            );
                                        })}
                                    </div>
                                </div>
                                <p className='text-sm text-gray-400'>* After every round draft order will be reversed.</p>
                            </div>


                        </div>

                        {/* Main Draft Section */}
                        <div className="grid grid-cols-5 gap-8">
                            {/* Players Section */}
                            <div className="col-span-3 bg-[#1C1C1C] rounded-3xl p-6 h-[500px] ">
                                <div className='flex justify-between'>
                                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-2`}>
                                        Players
                                    </h3>
                                    {/* Search, Filter, and Sort */}
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="p-2 rounded-lg bg-[#333333] text-white text-sm"
                                        >
                                            <option value="name">Sort by Name</option>
                                            <option value="rating">Sort by Rating</option>
                                        </select>
                                        <select
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="p-2 rounded-lg bg-[#333333] text-white text-sm"
                                        >
                                            <option value="">Filter by Position</option>
                                            <option value="attacker">Attacker</option>
                                            <option value="midfielder">Midfielder</option>
                                            <option value="defender">Defender</option>
                                            <option value="goalkeeper">Goalkeeper</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Search players..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="p-2 rounded-lg bg-[#333333] text-white text-sm"
                                        />
                                    </div>
                                </div>
                                {/* Table */}
                                <div className="relative w-full max-h-[420px] overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]">
                                    {/* Scrollable Wrapper */}
                                    <div className="overflow-x-auto overflow-y-auto max-h-[420px] scrollbar">
                                        <table className="table-auto w-full text-left text-white">
                                            {/* Table Header */}
                                            <thead className="bg-[#2f2f2f] sticky top-0 z-10">
                                                <tr className="text-center">
                                                    <th className="p-2 max-w-[100px]">Name</th>
                                                    <th className="p-2">Position</th>
                                                    <th className="p-2">Rating</th>
                                                    <th className="p-2 sticky right-0 z-20">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-sm'>
                                                {filteredPlayers.map((player) => (
                                                    <tr key={player.id} className="border-b border-[#333333] text-center items-center justify-center">
                                                        <td className="p-2 max-w-[100px] text-left truncate">
                                                            <div className="flex items-center space-x-2">
                                                                {player.image_path && (
                                                                    <img
                                                                        src={player.image_path}
                                                                        alt={player.team_name || "Team Logo"}
                                                                        className="w-10 h-10 rounded-lg"
                                                                    />
                                                                )}
                                                                <div className="overflow-hidden">
                                                                    <p className="font-bold truncate">{player.common_name}</p>
                                                                    <p className="text-xs text-gray-400 truncate">{player.team_name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='h-full flex justify-center items-center' style={{ verticalAlign: "middle" }}>{positionIcon(player.position_name)}</td>
                                                        <td className="p-2">{player.rating}</td>
                                                        <td className="p-2 sticky right-0 bg-[#1C1C1C]">
                                                            <button
                                                                className="bg-[#FF8A00] text-white px-6 py-1 rounded-lg hover:bg-[#e77d00]"
                                                                onClick={() => handlePick(player)}
                                                            >
                                                                Pick
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>



                            </div>

                            {/* Auto Pick List Section */}
                            <div className="col-span-2 bg-[#1C1C1C] rounded-3xl p-6 h-[500px]">
                                <div className='flex justify-between'>
                                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>
                                        Auto Pick List
                                    </h3>
                                    <button className={`save-button ${hasUnsavedChanges ? "enabled bg-[#FF8A00] hover:bg-[#e77d00]" : "disabled bg-[#4e4e4e]"} text-white px-3 py-1 mb-4 rounded-lg `} disabled={!hasUnsavedChanges} onClick={() => { saveAutoPickList() }}>Save Changes</button>
                                </div>
                                {autoPickList ?
                                    autoPickList.length > 0 ?
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <Droppable droppableId="autoPickList">
                                                {(provided) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="relative w-full max-h-[420px] overflow-hidden rounded-lg border border-[#333333] bg-[#1C1C1C]"
                                                    >
                                                        {/* Scrollable Wrapper */}
                                                        <div className="overflow-x-auto overflow-y-auto max-h-[420px] scrollbar">
                                                            <table className="table-auto w-full text-left text-white">
                                                                {/* Table Header */}
                                                                <thead className="bg-[#2f2f2f] sticky top-0 z-10">
                                                                    <tr className="text-center">
                                                                        {/* <th className="p-2 w-10"></th> */}
                                                                        <th className="p-2 max-w-[100px]">Name</th>
                                                                        <th className="p-2">Position</th>
                                                                        <th className="p-2 sticky right-0 z-20">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="text-sm">
                                                                    {autoPickList.map((player, index) => (
                                                                        <Draggable
                                                                            key={player.id} // Keep the key as is
                                                                            draggableId={player.id.toString()} // Convert draggableId to a string
                                                                            index={index}
                                                                        >
                                                                            {(provided, snapshot) => (
                                                                                <tr
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    className={`border-b border-[#333333] text-center items-center justify-center ${snapshot.isDragging ? 'table' : ''
                                                                                        }`}
                                                                                    style={{
                                                                                        ...provided.draggableProps.style, // Ensures the library's drag styles are applied
                                                                                        display: snapshot.isDragging ? 'table' : 'table-row', // Fix layout during drag
                                                                                    }}
                                                                                >
                                                                                    {/* Drag Handle Icon */}
                                                                                    {/* {!snapshot.isDragging ? */}
                                                                                    {/* <td className="p-2 w-10 flex justify-center items-center">
                                                                                    <span className="cursor-move text-gray-400 hover:text-gray-300">
                                                                                        <LuGrip />
                                                                                    </span>
                                                                                </td> */}
                                                                                    {/* : */}
                                                                                    {/* <></>} */}
                                                                                    <td className="p-2 max-w-[100px] text-left truncate">
                                                                                        <div className="flex items-center space-x-2">
                                                                                            {player.image_path && (
                                                                                                <img
                                                                                                    src={player.image_path}
                                                                                                    alt={player.team_name || "Team Logo"}
                                                                                                    className="w-10 h-10 rounded-lg"
                                                                                                />
                                                                                            )}
                                                                                            <div className="overflow-hidden">
                                                                                                <p className="font-bold truncate">{player.common_name}</p>
                                                                                                <p className="text-xs text-gray-400 truncate">{player.team_name}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="h-full flex justify-center items-center">
                                                                                        {positionIcon(player.position_name)}
                                                                                    </td>
                                                                                    <td className="p-2 sticky right-0 bg-[#1C1C1C]">
                                                                                        <button
                                                                                            className="bg-[#FF8A00] text-white px-3 py-1 rounded-lg hover:bg-[#e77d00]"
                                                                                            onClick={() => removeFromPickList(player)}
                                                                                        >
                                                                                            Remove
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                        : (
                                            <div className="h-[85%] overflow-auto flex flex-col justify-center space-y-2">
                                                <div className="text-gray-400 text-center">No players selected for auto pick.</div>
                                            </div>
                                        )
                                    : (
                                        <div className="h-[85%] overflow-auto flex flex-col justify-center space-y-2">
                                            <div className="text-gray-400 text-center">Fetching auto pick list...</div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </>
                )}

                {isModalOpen && (
                    <Modal onClose={() => setIsModalOpen(false)} title="Change Draft Order">
                        {/* Modal Body */}
                        <div className="flex flex-col max-h-[600px]">
                            <div className="flex-1 overflow-y-auto max-h-[90%] scrollbar">
                                <DragDropContext onDragEnd={handleOrderDragEnd}>
                                    <Droppable droppableId="draftOrder">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2"
                                            >
                                                {draftOrder.map((teamEmail, index) => {
                                                    const teamData = draftData?.teams.find(
                                                        (team) => team.user_email === teamEmail
                                                    );

                                                    return (
                                                        <Draggable
                                                            key={teamEmail}
                                                            draggableId={teamEmail}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`p-4 bg-[#333333] rounded-lg flex items-center space-x-4 ${snapshot.isDragging ? 'shadow-lg' : ''
                                                                        }`}
                                                                >
                                                                    <span className="cursor-move text-gray-400 hover:text-gray-300">
                                                                        &#x2630;
                                                                    </span>
                                                                    <img
                                                                        src={
                                                                            teamData?.team?.team_image_path ||
                                                                            'https://via.placeholder.com/100'
                                                                        }
                                                                        alt={
                                                                            teamData?.team?.team_name ||
                                                                            'Team Logo'
                                                                        }
                                                                        className="w-10 h-10 rounded-lg"
                                                                    />
                                                                    <p className="text-white">
                                                                        {teamData?.team?.team_name ||
                                                                            'Unnamed Team'}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    className="bg-[#4e4e4e] text-white px-6 py-2 rounded-lg"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-[#FF8A00] text-white px-6 py-2 rounded-lg"
                                    onClick={handleOrderSaveChanges}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div >
        </Suspense>
    );
};

export default Drafting;
