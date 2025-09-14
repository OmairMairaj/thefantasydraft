'use client';

import React, { useEffect, useState } from 'react';
import { Suspense } from "react";
import { Exo_2 } from 'next/font/google';
import { FaBell, FaCog, FaDraft2Digital, FaPlay, FaLink, FaRegCopy, FaTrash } from 'react-icons/fa';
import { LuGrip } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAlert } from '@/components/AlertContext/AlertContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from '@/components/Modal/Modal';
import DraftSettings from './components/Settings';
import DraftStart from './components/DraftStart';
import { FaCircleXmark, FaRegCircleXmark } from 'react-icons/fa6';

const exo2 = Exo_2({
    weight: ['400', '500', '600', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Drafting = () => {

    const [user, setUser] = useState({});
    const [leagueID, setLeagueID] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [players, setPlayers] = useState([]);
    const [autoPickList, setAutoPickList] = useState(null);
    const [originalPickList, setOriginalPickList] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('rating'); // Default sorting by name
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftOrder, setDraftOrder] = useState([]);
    const [teams, setTeams] = useState(null);
    const [teamFilter, setTeamFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { addAlert } = useAlert();
    const [previousView, setPreviousView] = useState(null);
    const [currentView, setCurrentView] = useState('drafting');
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    useEffect(() => {
        // Check if window is defined to ensure we are on the client side
        if (typeof window !== 'undefined') {
            let userData = null;

            // Get user from session storage or local storage
            if (sessionStorage.getItem("user")) {
                userData = JSON.parse(sessionStorage.getItem("user"));
            } else if (localStorage.getItem("user")) {
                userData = JSON.parse(localStorage.getItem("user"));
            } else {
                router.push("/login?redirect=" + window.location.toString());
            }

            if (userData && userData.user) {
                setUser(userData.user);
                console.log(userData.user.email);

                // Extract leagueID from the URL using window.location
                const urlParams = new URLSearchParams(window.location.search);
                const leagueIDFromURL = urlParams.get('leagueID');

                if (leagueIDFromURL) {
                    setLeagueID(leagueIDFromURL);
                } else {
                    console.error("League ID not found in URL");
                    router.push("/dashboard");
                    addAlert("League ID not found in URL", "error");
                }
            }
        }
    }, []);

    useEffect(() => {
        try {
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}team`)
                .then((response) => {
                    if (response && response.data && response.data.data) setTeams(response.data.data);
                    else addAlert("Error fetching teams. Please try again", 'error');
                });
        } catch (error) {
            console.error("Error fetching teams data:", error);
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
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasydraft?leagueID=${leagueID}`
            );
            if (response.data && !response.data.error) {
                console.log("draftData: ", response.data.data[0]);
                const draft = response.data.data[0];

                // Check if the logged-in user is part of the league's teams
                const isUserPartOfLeague = draft.teams.some(
                    (team) => team.user_email === user.email
                );
                console.log(`Is user part of league: ${isUserPartOfLeague}`);
                if (!isUserPartOfLeague) {
                    // Redirect the user to the dashboard if they are not part of the league
                    addAlert("You are not a part of this league.", "error");
                    router.push("/dashboard");
                    return;
                }

                // Check if the current user is the creator of the league
                if (draft.creator === user.email) {
                    setIsCreator(true);
                    console.log("User is the creator of the league");
                } else {
                    setIsCreator(false);
                    console.log("User is not the creator of the league");
                }

                if (draft?.state === 'Scheduled') {
                    const startTime = new Date(draft.start_date).getTime();
                    const now = Date.now();
                    setTimeRemaining(startTime - now > 0 ? startTime - now : 0);
                }

                // Redirect to draft-start if status is "In Process"
                if (draft?.state === 'In Process') {
                    setCurrentView('draft-start');
                }
                if (draft?.state === 'Ended') {
                    setCurrentView('drafting');
                }

                setDraftData(draft);
            } else {
                console.error("Failed to fetch draft data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching draft data:", error);
            addAlert("An error occurred while fetching draft data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (view) => {
        if (view === 'settings') {
            setPreviousView(currentView); // Save the current view before navigating
        }
        setCurrentView(view); // Update the view
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
        if (draftData) {
            setDraftOrder([...draftData.order]);
            fetchPickList();
        }
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}player`);
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
            const link = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasydraft/edit"
            const body = {
                draftData: draftData
            }
            body.draftData.order = draftOrder;
            // console.log(body)
            const response = await axios.post(link, body);
            // console.log(response);
            if (response.data && response.data.data && !response.data.error) {
                addAlert("New order has been saved", "success");
                setDraftData(response.data.data)
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

    const handleClear = () => {
        setSearch('');
        setFilter('');
        setTeamFilter('');
    }

    useEffect(() => {
        const filterPlayers = players.filter((player) =>
            // Filter players by name or common_name
            player.name.toLowerCase().includes(search.toLowerCase()) ||
            player.common_name?.toLowerCase().includes(search.toLowerCase()) ||
            player.team_name?.toLowerCase().includes(search.toLowerCase())
        ).filter((player) =>
            // Filter by position if filter is set
            !filter || player.position_name?.toLowerCase() === filter.toLowerCase()
        ).filter((player) =>
            // Filter by team name if filter is set
            !teamFilter || player.team_name?.toLowerCase() === teamFilter.toLowerCase()
        ).sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'rating') return b.rating - a.rating; // Example for sorting by rating
            return 0;
        });

        setFilteredPlayers(filterPlayers)
    }, [players, filter, sort, teamFilter, search])




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
            Attacker: { bg: 'bg-[#D3E4FE]', text: 'A' },
            Midfielder: { bg: 'bg-[#D5FDE1]', text: 'M' },
            Defender: { bg: 'bg-[#F8E1FF]', text: 'D' },
            Goalkeeper: { bg: 'bg-[#FEF9B6]', text: 'G' },
        };

        const { bg, text } = positionStyles[position] || { bg: 'bg-gray-500', text: '?' };

        return (
            <div
                className={`${bg} w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 text-black font-bold flex items-center justify-center text-xs md:text-sm my-4 rounded-full `}
            >
                {text}
            </div>
        );
    };

    useEffect(() => {
        // Add or remove the "no-scroll" class to the body element based on modal state
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Cleanup when the component is unmounted
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    const handleOrderSaveChanges = () => {
        // Call the function to update the draft order in the backend
        saveOrder();
        // fetchdraftData();
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
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}fantasydraft/startNow`, { draftID: draftData._id, user_email: user.email });
                    if (response.data && !response.data.error) {
                        addAlert("Draft has been started", "success");
                        setDraftData(response.data.data);
                        console.log(response.data.data);
                        setCurrentView("draft-start");
                    } else {
                        addAlert(response.data.message, "error");
                    }
                } catch (error) {
                    console.error('Failed to start draft:', error);
                }
            } else {
                addAlert("Draft is already in Progress", "info");
                setCurrentView("draft-start");
            }

        }
    }


    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10">
                {loading || !draftData || !players || !autoPickList || !filteredPlayers ? (
                    <div className="w-full min-h-[70vh] flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {currentView === 'drafting' && draftData?.state !== 'In Process' && (
                            <>
                                {/* Admin Section */}
                                {isCreator ? (
                                    <div className="bg-[#0C1922] w-full rounded-xl shadow-lg p-4 md:p-6 mb-4 flex flex-col lg:flex-row justify-between align-bottom relative">
                                        <div className="flex flex-col md:space-y-2 w-2/3">
                                            <h2 className={`text-2xl xl:text-3xl font-bold ${exo2.className}`}>Admin</h2>
                                            <p className="text-gray-400 text-sm xl:text-base">Actions only available to Admin.</p>
                                            {/* Invite Section */}
                                            {(draftData?.state !== 'Ended' && draftData?.state !== 'In Process') && (
                                                <div className="absolute lg:static right-4 md:right-6 top-2 md:top-4 flex space-x-2 mb-8 items-center text-xs md:text-sm xl:text-base">
                                                    <div className='text-white mr-1 hidden sm:flex'><span className='mr-1 hidden lg:block'>Invite</span> Code:</div>
                                                    <div className="relative lg:w-1/3 min-w-24 sm:min-w-32">
                                                        <div
                                                            className="bg-[#1D374A] px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]"
                                                        >{draftData?.leagueID?.invite_code}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(draftData?.leagueID?.invite_code || '');
                                                                addAlert("Invite code copied to clipboard!", "success");
                                                            }}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-[#FF8A00] transition"
                                                        >
                                                            <FaRegCopy />
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="fade-gradient py-2 px-2 sm:px-6 rounded-full flex items-center space-x-2"
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
                                                        <span className='mr-1 hidden lg:block'>Copy Invite</span><span className='hidden sm:block'>Link</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex space-x-2 xl:space-x-4 lg:absolute bottom-0 right-0 lg:mb-6 px-0 lg:px-6 mt-2 lg:mt-0 text-xs sm:text-sm md:text-base">
                                            {(
                                                draftData?.state === "Manual" ||
                                                (draftData?.state === "Scheduled" && timeRemaining === 0) ||
                                                draftData?.state === "In Process"
                                            ) && (
                                                    <button onClick={handleStart} className="fade-gradient py-1 xl:py-2 px-6 rounded-full flex items-center space-x-2">
                                                        <FaPlay />
                                                        <span>Start Draft</span>
                                                    </button>
                                                )}
                                            <button onClick={() => handleNavigation('settings')} className="bg-[#ff8a00] text-black py-1 xl:py-2 px-6 my-1 rounded-full flex items-center space-x-2 hover:scale-105 transition-all hover:text-white ease-in-out">
                                                <FaCog />
                                                <span>Draft Settings</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                                    :
                                    (
                                        <div className='flex justify-between text-xs sm:text-sm md:text-base'>
                                            <h1 className={`text-xl md:text-2xl xl:text-3xl font-bold ${exo2.className} mb-2`}>Pre-Draft Page</h1>
                                            <div className="flex space-x-4 mb-2">
                                                {/* {(
                                                    draftData?.state === "Manual" ||
                                                    (draftData?.state === "Scheduled" && timeRemaining === 0) ||
                                                    draftData?.state === "In Process"
                                                ) && (
                                                        <button onClick={() => handleNavigation('draft-start')} className="bg-[#FF8A00] py-2 px-6  text-lg rounded-full flex items-center space-x-2 hover:bg-[#FF9A00]">
                                                            <FaPlay />
                                                            <span>Start Draft</span>
                                                        </button>
                                                    )} */}
                                                <button onClick={() => handleNavigation('settings')} className="fade-gradient py-1 xl:py-2 px-6 my-1 rounded-full flex items-center space-x-2">
                                                    <FaCog />
                                                    <span>Draft Settings</span>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }


                                {/* {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <> */}
                                {/* Drafting Info Section */}
                                <div className="flex flex-col lg:flex-row justify-between mb-4">
                                    <div className="flex space-x-0 sm:space-x-4 lg:space-x-0 flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 lg:space-y-2 w-full lg:w-1/3 lg:pr-4 lg:border-r lg:border-[#404040]">
                                        <div className="bg-[#1D374A] px-4 py-4 rounded-lg text-center text-xs md:text-sm xl:text-base w-full sm:w-1/2 lg:w-full flex items-center justify-center ">
                                            {draftData?.state === 'Manual' && (
                                                <p className='text-white w-full'>The draft is set to manual and will be started by the admin.</p>
                                            )}
                                            {draftData?.state === 'Scheduled' && (
                                                <p className='text-white w-full'>
                                                    The draft is scheduled and will start on <br />
                                                    {new Date(draftData?.start_date).toLocaleString('en-US', {
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
                                                <p className='text-white'>The draft is currently in progress.</p>
                                            )}
                                            {draftData?.state === 'Ended' && (
                                                <p className='text-white'>The draft has ended.</p>
                                            )}
                                        </div>

                                        <div className="bg-[#1D374A] px-4 py-4 rounded-lg text-center flex lg:flex-col items-center justify-center space-x-4 lg:space-x-0 w-full sm:w-1/2 lg:w-full">
                                            {draftData?.state === 'Manual' && (
                                                <>
                                                    <p className="text-sm md:text-base lg:text-lg xl:text-xl">Draft Type:</p>
                                                    <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white lg:mt-2">Manual</p>
                                                </>
                                            )}
                                            {draftData?.state === 'Scheduled' && (
                                                <>
                                                    <p className="text-sm md:text-base lg:text-lg xl:text-xl">Time Remaining:</p>
                                                    <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white lg:mt-2">{formatTime(timeRemaining)}</p>
                                                </>
                                            )}
                                            {draftData?.state === 'In Process' && (
                                                <>
                                                    <p className="text-sm md:text-base lg:text-lg xl:text-xl">Draft Status:</p>
                                                    <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white lg:mt-2">{draftData?.state}</p>
                                                </>
                                            )}
                                            {draftData?.state === 'Ended' && (
                                                <>
                                                    <p className="text-sm md:text-base lg:text-lg xl:text-xl">Draft Status:</p>
                                                    <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white lg:mt-2">{draftData?.state}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 w-full lg:w-2/3 mt-4 lg:mt-0 lg:pl-4">
                                        <div className='flex justify-between'>
                                            <div className={`flex text-base sm:text-lg xl:text-xl items-center ${exo2.className}`}>Draft Order:<span className='text-xs sm:text-sm xl:text-base ml-2 text-gray-400'>{`(Round 1 order)`}</span></div>
                                            {isCreator && (draftData?.state !== 'Ended' && draftData?.state !== 'In Process') && (
                                                <button className="fade-gradient text-white px-6 py-1 rounded-full text-xs sm:text-sm xl:text-base" onClick={() => setIsModalOpen(true)}>Change Order</button>
                                            )}
                                        </div>
                                        <div className="overflow-x-auto pb-2 scrollbar">
                                            <div className="flex gap-2 min-w-max">
                                                {draftData?.order.map((email, index) => {
                                                    // Find the team corresponding to the current email in the order
                                                    const teamData = draftData?.teams.find((team) => team.user_email === email);
                                                    // console.log(teamData);
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="bg-[#1D374A] flex flex-col items-center justify-center text-center h-24 w-32 sm:h-28 sm:w-40 lg:h-32 lg:w-44 xl:h-36 xl:w-48 rounded-lg text-xs lg:text-sm"
                                                        >
                                                            {teamData ? (
                                                                <>
                                                                    <p className="text-[#FF8A00] font-semibold mb-1">{`Turn ${index + 1}`}</p>
                                                                    {/* Show the team logo */}
                                                                    <img
                                                                        src={teamData.team?.team_image_path ? teamData.team.team_image_path : "/images/default_team_logo.png"}
                                                                        alt={teamData.team.team_name}
                                                                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg mb-1"
                                                                    />
                                                                    {/* Show the team name */}
                                                                    <p className="text-white">{teamData.team.team_name || "Unnamed Team"}</p>
                                                                </>
                                                            ) : (
                                                                <p>No Team Found</p>
                                                            )}
                                                        </div>

                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <p className='text-xs lg:text-sm text-gray-400'>* After every round draft order will be reversed.</p>
                                    </div>


                                </div>

                                {/* Main Draft Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
                                    {/* Players Section */}
                                    <div className="lg:col-span-3 bg-[#0c1922] rounded-2xl py-6 px-4 xl:px-6 h-[540px] lg:h-[500px] ">
                                        <div className='flex flex-col lg:flex-row justify-between'>
                                            <h3 className={`text-xl xl:text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-2`}>
                                                Players
                                            </h3>
                                            {/* Search, Filter, and Sort */}
                                            <div className="flex gap-1 xl:gap-2 mb-2 items-center text-xs xl:text-xs w-full lg:w-[85%] lg:justify-end flex-wrap">
                                                {filter || search || teamFilter ?
                                                    <button className='hidden lg:flex w-[10%] items-center justify-center bg-[#314553] text-white px-2 py-0 h-6 rounded-full text-[10px] xl:text-xs hover:bg-[#FF8A00] transition-colors' onClick={() => handleClear()}>Clear <span className='pl-1'><FaRegCircleXmark /></span>
                                                    </button>
                                                    : null
                                                }
                                                <select
                                                    value={sort}
                                                    onChange={(e) => setSort(e.target.value)}
                                                    className="p-1 xl:p-2 w-[32%] md:w-[20%] xl:w-[18%] rounded-lg bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                                                >
                                                    <option value="name">
                                                        {window.innerWidth < 640 ? "Name" : (window.innerWidth > 768 && window.innerWidth < 1024) ? "Name" : "Sort by Name"}
                                                    </option>
                                                    <option value="rating">
                                                        {window.innerWidth < 640 ? "Rating" : (window.innerWidth > 768 && window.innerWidth < 1024) ? "Rating" : "Sort by Rating"}
                                                    </option>
                                                </select>
                                                <select
                                                    value={filter}
                                                    onChange={(e) => setFilter(e.target.value)}
                                                    className="p-1 xl:p-2 w-[32%] md:w-[20%] xl:w-[15%] rounded-lg bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                                                >
                                                    <option className="hidden" value="">
                                                        {"Position"}
                                                    </option>
                                                    <option value="attacker">Attacker</option>
                                                    <option value="midfielder">Midfielder</option>
                                                    <option value="defender">Defender</option>
                                                    <option value="goalkeeper">Goalkeeper</option>
                                                </select>
                                                <select
                                                    value={teamFilter}
                                                    onChange={(e) => setTeamFilter(e.target.value)}
                                                    className="p-1 xl:p-2 w-[33%] md:w-[20%] rounded-md bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                                                >
                                                    <option value="">Team</option>
                                                    {teams ? teams.map((item) => <>
                                                        <option value={item.name}>{item.name}</option>
                                                    </>) : null}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Search players..."
                                                    value={search}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                    className="p-1 xl:p-2 w-[80%] md:w-[26%] xl:w-[30%] rounded-lg bg-[#1D374A] text-white focus-visible:outline-none focus:border-[#FF8A00] border border-[#333333]"
                                                />
                                                {filter || search || teamFilter ?
                                                    <button className='flex lg:hidden w-[18%] md:w-[8%] items-center justify-center bg-[#314553] text-white p-1 h-6 rounded-full text-[10px] xl:text-xs hover:bg-[#FF8A00] transition-colors' onClick={() => handleClear()}><span className='pr-1 block md:hidden'>Clear</span><FaRegCircleXmark />
                                                    </button>
                                                    : null
                                                }
                                            </div>
                                        </div>
                                        {/* Table */}
                                        <div className="relative w-full max-h-[420px] overflow-hidden rounded-lg border border-[#1D374A]">
                                            {/* Scrollable Wrapper */}
                                            <div className="overflow-x-auto overflow-y-auto max-h-[420px] scrollbar">
                                                <table className="table-auto w-full text-left text-white text-xs xl:text-sm">
                                                    {/* Table Header */}
                                                    <thead className="bg-[#1D374A] sticky top-0 z-10">
                                                        <tr className="text-center">
                                                            <th className="p-2 text-left pl-4 max-w-[100px]">Name</th>
                                                            <th className="lg:p-2"></th>
                                                            <th className="lg:p-2">Rating</th>
                                                            <th className="lg:p-2">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className=''>
                                                        {filteredPlayers ?
                                                            filteredPlayers.map((player) => (
                                                                <tr key={player.id} className="border-b border-[#1D374A] text-center items-center justify-center">
                                                                    <td className="p-2 min-w-24 max-w-[100px] text-left truncate">
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
                                                                    <td className='lg:px-2 h-full flex justify-center items-center' style={{ verticalAlign: "middle" }}>{positionIcon(player.position_name)}</td>
                                                                    <td className="lg:p-2">{player.rating}</td>
                                                                    <td className="lg:p-2">
                                                                        <button
                                                                            className="bg-[#1D374A] text-white px-4 lg:px-6 py-1 rounded-lg hover:bg-[#ff8a00]"
                                                                            onClick={() => handlePick(player)}
                                                                        >
                                                                            Pick
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                            :
                                                            <tr>
                                                                <td colSpan="4" className="text-center text-gray-400 p-4">
                                                                    "Loading players..."
                                                                </td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>



                                    </div>

                                    {/* Auto Pick List Section */}
                                    <div className="lg:col-span-2 bg-[#0c1922] rounded-2xl py-6 px-4 xl:px-6 h-[540px] lg:h-[500px] text-xs xl:text-sm">
                                        <div className='flex md:flex-col lg:flex-row items-end justify-between'>
                                            <h3 className={`text-xl xl:text-2xl md:w-full lg:w-auto font-bold text-left text-[#FF8A00] ${exo2.className} mb-2`}>
                                                Auto Pick List
                                            </h3>
                                            <button className={`w-auto md:w-28 lg:w-auto text-xs xl:text-sm ${hasUnsavedChanges ? "enabled bg-[#FF8A00] text-black hover:bg-[#e77d00]" : "disabled bg-[#1D374A] text-white"}  px-3 py-1 mb-3 rounded-lg `} disabled={!hasUnsavedChanges} onClick={() => { saveAutoPickList() }}>Save Changes</button>
                                        </div>
                                        {autoPickList ?
                                            autoPickList.length > 0 ?
                                                <DragDropContext onDragEnd={handleDragEnd}>
                                                    <Droppable droppableId="autoPickList">
                                                        {(provided) => (
                                                            <div
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                                className="relative w-full max-h-[420px] overflow-hidden rounded-lg border border-[#1D374A]"
                                                            >
                                                                {/* Scrollable Wrapper */}
                                                                <div className="overflow-x-auto overflow-y-auto max-h-[420px] scrollbar">
                                                                    <table className="table-auto w-full text-left text-white ">
                                                                        {/* Table Header */}
                                                                        <thead className="bg-[#1D374A] sticky top-0 z-10">
                                                                            <tr className="text-center">
                                                                                <th className="p-2"></th>
                                                                                <th className="p-2 max-w-[100px] text-left pl-4">Name</th>
                                                                                <th className="lg:p-2"></th>
                                                                                <th className="lg:p-2 sticky right-0 z-20">Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="">
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
                                                                                            className={`border-b border-[#1D374A] text-center items-center justify-center ${snapshot.isDragging ? 'table' : ''
                                                                                                }`}
                                                                                            style={{
                                                                                                ...provided.draggableProps.style, // Ensures the library's drag styles are applied
                                                                                                display: snapshot.isDragging ? 'table' : 'table-row', // Fix layout during drag
                                                                                            }}
                                                                                        >
                                                                                            {/* Drag Handle Icon */}
                                                                                            {/* {!snapshot.isDragging ? */}
                                                                                            <td className="p-2 flex justify-center items-center">
                                                                                                <span className="cursor-move text-gray-400 hover:text-gray-300">
                                                                                                    <LuGrip />
                                                                                                </span>
                                                                                            </td>
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
                                                                                            <td className="lg:p-2 sticky right-0">
                                                                                                <button
                                                                                                    className="bg-[#1D374A] text-white px-3 py-2 lg:py-1 rounded-lg hover:bg-[#ff8a00]"
                                                                                                    onClick={() => removeFromPickList(player)}
                                                                                                >
                                                                                                    {window.innerWidth < 1024 ? <FaTrash /> : 'Remove'}
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
                                                    <div className="h-[85%] overflow-auto flex flex-col border border-[#1D374A] rounded-xl justify-center space-y-2">
                                                        <div className="text-gray-400 text-center">No players selected for auto pick.</div>
                                                    </div>
                                                )
                                            : (
                                                <div className="h-[85%] overflow-auto flex flex-col border border-[#1D374A] rounded-xl justify-center space-y-2">
                                                    <div className="text-gray-400 text-center">Fetching auto pick list...</div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                                {/* </>
                        )} */}

                                {isModalOpen && (
                                    <Modal onClose={() => setIsModalOpen(false)} title="Change Draft Order">
                                        {/* Modal Body */}
                                        <div className="flex flex-col max-h-[600px] bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm">
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
                                                                                    className={`p-2 lg:p-4 bg-[#1D374A] rounded-lg flex items-center text-sm sm:text-base xl:text-lg space-x-4 ${snapshot.isDragging ? 'shadow-lg' : ''
                                                                                        }`}
                                                                                >
                                                                                    <span className="px-2 flex items-center justify-center font-sans not-italic text-xl cursor-move text-gray-400 hover:text-gray-300">
                                                                                        &#x2630;
                                                                                    </span>
                                                                                    <img
                                                                                        src={
                                                                                            teamData?.team?.team_image_path ||
                                                                                            '/images/default_team_logo.png'
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
                                            <div className="flex justify-end space-x-2 sm:space-x-4 mt-4 text-sm sm:text-base">
                                                <button
                                                    className="bg-[#ff8a00] text-black px-6 lg:px-10 py-1 lg:py-2 rounded-full hover:scale-105 transition-all ease-in-out hover:text-white"
                                                    onClick={() => setIsModalOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="fade-gradient text-white px-6 lg:px-10 py-1 lg:py-2 rounded-full"
                                                    onClick={handleOrderSaveChanges}
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </Modal>
                                )}
                            </>
                        )}
                        {currentView === 'settings' && (
                            <DraftSettings
                                draftID={draftData?._id}
                                user={user}
                                onBack={() =>
                                    handleNavigation(previousView === 'drafting' ? 'drafting' : 'draft-start')
                                }
                            />
                        )}

                        {currentView === 'draft-start' && (
                            <DraftStart
                                draftID={draftData?._id}
                                user={user}
                                onSettings={() => handleNavigation('settings')}
                            />
                        )}
                    </>
                )}
            </div>
        </Suspense>
    );
};

export default Drafting;