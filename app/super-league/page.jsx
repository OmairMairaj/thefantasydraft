"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Exo_2 } from "next/font/google";
import axios from "axios";
import SuperLeagueCreateForm from "./components/SuperLeagueCreateForm";
import SuperLeagueDetail from "./components/SuperLeagueDetail";
import SuperLeagueEditForm from "./components/SuperLeagueEditForm";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useAlert } from "@/components/AlertContext/AlertContext";

const exo2 = Exo_2({
    weight: ["400", "500", "700", "800"],
    style: ["italic"],
    subsets: ["latin"],
});

const SuperLeague = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("list");
    const [superLeagues, setSuperLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEmptyView, setShowEmptyView] = useState(null);
    const [selectedSuperLeague, setSelectedSuperLeague] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [inputSuperLeagueName, setInputSuperLeagueName] = useState("");
    const [inputError, setInputError] = useState(false);
    const { addAlert } = useAlert();
    const router = useRouter();

    useEffect(() => {
        // Auth check: best to use cookies/JWT, but here’s your localStorage/sessionStorage fallback
        let userData = null;

        if (typeof window !== "undefined") {
            if (sessionStorage.getItem("user")) {
                userData = JSON.parse(sessionStorage.getItem("user"));
            } else if (localStorage.getItem("user")) {
                userData = JSON.parse(localStorage.getItem("user"));
            } else {
                window.location.href =
                    "/login?redirect=" + encodeURIComponent(window.location.pathname);
            }
        }

        if (userData && userData.user) {
            setUser(userData.user);
            fetchSuperLeaguesByUser(userData.user._id);
        }
    }, []);

    const fetchSuperLeaguesByUser = async (userId) => {
        setLoading(true);
        try {
            // Note: it's better REST to get by /api/super-league (backend gets user from session),
            // but this matches your pattern:
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/superleague?user=${userId}`
            );
            if (!response.data.error) {
                setSuperLeagues(response.data.data || []);
                setShowEmptyView(response.data.data.length === 0);
            } else {
                setSuperLeagues([]);
                setShowEmptyView(true);
            }
        } catch (error) {
            setSuperLeagues([]);
            setShowEmptyView(true);
        } finally {
            setLoading(false);
        }
    };

    // Handler for editing a super league
    const handleEditClick = (superLeague) => {
        setLoading(true);
        setView("edit");
        setSelectedSuperLeague(superLeague);
        console.log("Editing Super League:", superLeague);
        setLoading(false);
    };

    // Handler for going to detail view
    const handleCardClick = (superLeague) => {
        setLoading(true);
        setView("detail");
        // Optional: fetch details if needed, otherwise:
        setSelectedSuperLeague(superLeague);
        console.log("Selected Super League:", superLeague);
        setLoading(false);
    };

    // Handler for creating new
    const handleCreate = () => {
        setLoading(true);
        setView("create");
        setLoading(false);
    };

    // Handler for returning to main list
    const handleBackToList = () => {
        setLoading(true);
        setView("list");
        setSelectedSuperLeague(null);
        // re-fetch super leagues in case of changes
        if (user) fetchSuperLeaguesByUser(user._id);
        else setLoading(false);
    };

    useEffect(() => {
        if (showDeletePopup) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showDeletePopup]);

    const handleDeleteInputChange = (e) => {
        setInputSuperLeagueName(e.target.value);
        setInputError(false);
    };

    const handleDeleteSuperLeague = async () => {
        if (!inputSuperLeagueName) {
            setInputError(true);
            return;
        }

        if (inputSuperLeagueName !== selectedSuperLeague?.name) {
            setInputError(true);
            return;
        }
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/superleague?Id=${selectedSuperLeague?._id}`
            );
            console.log("Delete response:", response);

            if (response.data && !response.data.error) {
                addAlert("League deleted successfully.", "success");
                console.log("League deleted successfully");
                setShowDeletePopup(false);
                handleBackToList();
                setSelectedSuperLeague(null);
                setInputSuperLeagueName("");
            } else {
                addAlert(response.data.message || "Failed to delete league.", "error");
                console.error("Error deleting league:", response.data.message);
            }
        } catch (error) {
            console.error("Error deleting league:", error);
            addAlert(
                "An unexpected error occurred while deleting the league.",
                "error"
            );
        }
    };

    return (
        <div
            className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className}`}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 md:space-x-4">
                    {view !== "list" && (
                        <button
                            onClick={handleBackToList}
                            className={`flex items-center rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] transition py-2 px-5 sm:py-2 sm:px-7 md:py-2 md:px-8 text-xs sm:text-sm md:text-lg ${exo2.className}`}
                        >
                            BACK
                        </button>
                    )}
                    <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold">
                        {view === "detail"
                            ? "Super League"
                            : view === "create"
                                ? "Create Super League"
                                : view === "edit"
                                    ? "Edit Super League"
                                    : "Super Leagues"}
                    </h1>
                </div>
                {view == "list" && !showEmptyView && superLeagues.length > 0 && (
                    <button
                        className={`fade-gradient px-4 py-2 sm:px-6 sm:py-2 md:px-8 xl:px-10 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded-xl text-white font-bold border-2 cursor-pointer bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00] transition`} onClick={handleCreate}
                    >
                        + Create Super League
                    </button>
                )}

                {view == "detail" && (
                    <button
                        className={`bg-red-700 px-4 py-2 sm:px-6 sm:py-2 md:px-8 xl:px-10 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded-xl text-white font-bold cursor-pointer flex items-center hover:bg-red-800 transition`}
                        onClick={() => {
                            setShowDeletePopup(true);
                        }}
                    >
                        <FaTrash className="inline mr-2" />Delete
                        <span className="hidden sm:flex ml-2">Super League </span>
                    </button>
                )}
            </div>
            {loading ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {view === "list" &&
                        (showEmptyView ? (
                            <div className="w-full relative custom-dash-spacing px-2 sm:px-4 md:px-8 rounded-3xl shadow-lg flex flex-col items-center space-y-8 sm:space-y-10 md:space-y-12 py-20 sm:py-24 md:py-32 lg:py-16 xl:py-24 2xl:py-36">
                                <div className="flex flex-col items-center justify-center w-full max-w-md">
                                    <img
                                        src="/images/empty-super-league.png"
                                        alt="No super leagues"
                                        className="w-28 sm:w-32 md:w-40 xl:w-52 mb-4 md:mb-5"
                                    />
                                    <h2 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 text-center">
                                        No Super Leagues Yet
                                    </h2>
                                    <p className="text-gray-300 text-xs sm:text-sm md:text-base xl:text-lg mb-4 text-center px-4">
                                        Create a Super League to track multiple leagues in one place.
                                    </p>
                                    <button
                                        className="fade-gradient px-4 sm:px-8 md:px-10 xl:px-14 py-2 sm:py-2.5 md:py-3 rounded-xl text-white font-bold text-sm sm:text-base md:text-lg border-2 cursor-pointer bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00] transition-all"
                                        onClick={handleCreate}
                                    >
                                        + Create Super League
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {superLeagues.map((sl) => {
                                    // Fill with real leagues first, then add empty slots to make 6
                                    const leaguesArray = sl.leagues || [];
                                    const emptySlots = Array.from({ length: 6 - leaguesArray.length });

                                    return (
                                        <div
                                            key={sl._id}
                                            onClick={() => handleCardClick(sl)}
                                            className="group"
                                        >
                                            <div className="relative rounded-2xl bg-white/10 hover:scale-105 transition-transform flex flex-col items-center p-4 cursor-pointer min-h-[260px] sm:min-h-[300px] md:min-h-[340px] xl:min-h-[380px] w-full">
                                                <button onClick={(e) => {
                                                    e.stopPropagation(); // prevent click bubbling to card
                                                    handleEditClick(sl);
                                                }} className="absolute top-3 right-3 md:top-4 md:right-4 border border-gray-700 text-white/50 hover:text-white rounded-xl p-2 z-10 text-base md:text-lg">
                                                    <FaEdit />
                                                </button>
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 mb-3">
                                                    <img
                                                        src={sl.image || "/images/default_team_logo.png"}
                                                        alt={sl.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                </div>
                                                <div className="text-lg sm:text-xl xl:text-2xl font-semibold text-center">{sl.name}</div>
                                                <div className="text-gray-300 text-xs sm:text-sm mt-1 text-center">
                                                    {sl.leagues?.length || 0} league{sl.leagues?.length === 1 ? "" : "s"}
                                                </div>
                                                {/* Leagues 6-slot grid */}
                                                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4 w-full">
                                                    {/* Filled slots */}
                                                    {leaguesArray.map(lg => (
                                                        <div key={lg._id} className="p-2 rounded-md flex items-center space-x-2 bg-black/40 min-h-[32px] sm:min-h-[44px]">
                                                            <img
                                                                src={lg.league_image_path || "/images/default_team_logo.png"}
                                                                alt={lg.league_name}
                                                                className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 rounded-full object-cover"
                                                            />
                                                            <span className="text-xs sm:text-sm xl:text-base truncate">{lg.league_name}</span>
                                                        </div>
                                                    ))}
                                                    {/* Empty slots */}
                                                    {emptySlots.map((_, idx) => (
                                                        <div
                                                            key={`empty-${idx}`}
                                                            className="p-2 rounded-md flex items-center justify-center border-2 border-dashed border-gray-500 min-h-[32px] sm:min-h-[44px] opacity-40"
                                                        >
                                                            <FaPlus />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    {view === "detail" && selectedSuperLeague && (
                        <SuperLeagueDetail
                            superLeague={selectedSuperLeague}
                            onBack={handleBackToList}
                        />
                    )}
                    {view === "create" && (
                        <SuperLeagueCreateForm
                            User={user}
                            onBack={handleBackToList}
                            onCreated={handleBackToList}
                        />
                    )}
                    {view === "edit" && (
                        <SuperLeagueEditForm
                            superLeague={selectedSuperLeague}
                            onUpdate={handleBackToList}
                        />
                    )}
                </>
            )}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
                    <div
                        className={`bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm p-6 rounded-xl shadow-md shadow-[#1f1f1f] text-center max-w-96 w-[90vw] ${exo2.className}`}
                    >
                        <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-[#FF8A00] mb-4">
                            Delete League
                        </h2>
                        <p className="text-sm xl:text-base mb-4 text-gray-300 mx-2 sm:mx-6">
                            Are you sure you want to delete this super league?
                        </p>
                        <p className="text-sm xl:text-base mb-4 text-gray-400">
                            Type{" "}
                            <span className="font-bold text-white">
                                {selectedSuperLeague?.name}
                            </span>{" "}
                            to confirm:
                        </p>
                        <input
                            type="text"
                            value={inputSuperLeagueName}
                            onChange={handleDeleteInputChange}
                            className={`w-full p-1 md:p-2 bg-[#1b3546] text-white rounded-lg mb-1 text-center text-sm xl:text-base focus:placeholder-transparent focus:outline-none  ${inputError
                                ? "border border-[#832626]"
                                : "focus:ring-1 focus:ring-[#425460]"
                                }`}
                            placeholder="Enter Super league name"
                        />
                        {inputError && (
                            <p className="text-sm xl:text-base text-[#ca3c3c] mb-1">
                                Input does not match.
                            </p>
                        )}
                        <div className="flex justify-between mt-4">
                            <button
                                className={`px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md ${!inputSuperLeagueName
                                    ? "fade-gradient-no-hover opacity-50 cursor-not-allowed"
                                    : "fade-gradient"
                                    }`}
                                onClick={handleDeleteSuperLeague}
                                disabled={!inputSuperLeagueName}
                            >
                                Yes, I'm sure
                            </button>
                            <button
                                className="fade-gradient px-4 sm:px-6 xl:px-8 py-1 md:py-2 text-sm xl:text-base rounded-xl shadow-md"
                                onClick={() => {
                                    setShowDeletePopup(false);
                                    setInputSuperLeagueName("");
                                    setInputError(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperLeague;
