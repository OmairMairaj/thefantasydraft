"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Exo_2 } from "next/font/google";
import { FaImage, FaPlus, FaSpinner, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAlert } from "@/components/AlertContext/AlertContext";

const exo2 = Exo_2({
    weight: ["700", "800"],
    style: ["italic"],
    subsets: ["latin"],
});

const SuperLeagueEditForm = ({ superLeague, onUpdate }) => {
    // Pre-fill state from existing superLeague prop
    const [name, setName] = useState(superLeague?.name || "");
    const [image, setImage] = useState(superLeague?.image || "");
    const [inviteCode, setInviteCode] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [selectedLeagues, setSelectedLeagues] = useState(
        superLeague.leagues?.map(lg => ({
            _id: lg._id,
            inviteCode: lg.invite_code,
            leagueName: lg.league_name,
            leagueImage: lg.league_image_path,
        })) || []
    );
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { addAlert } = useAlert();

    // Image upload logic
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await toBase64(file);
        setImage(base64);
    };

    // Invite code add/search
    const handleSearchLeague = async () => {
        setError("");
        setSearchResult(null);
        if (!inviteCode) return setError("Enter an invite code.");
        if (
            selectedLeagues.some(
                (l) => l.inviteCode.toLowerCase() === inviteCode.toLowerCase()
            )
        )
            return setError("This league is already added.");
        setSearching(true);
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}superleague/code?inviteCode=${inviteCode.trim()}`
            );
            if (!res.data || res.data.error || !res.data.data) {
                setError("League not found.");
                setSearchResult(null);
            } else {
                setSearchResult(res.data.data);
            }
        } catch (e) {
            setError("Error searching for league.");
            setSearchResult(null);
        } finally {
            setSearching(false);
        }
    };

    const handleAddLeague = () => {
        if (!searchResult) return;
        if (selectedLeagues.length >= 6)
            return setError("You can add up to 6 leagues.");
        setSelectedLeagues((prev) => [
            ...prev,
            {
                _id: searchResult._id,
                inviteCode: searchResult.invite_code,
                leagueName: searchResult.league_name,
                leagueImage: searchResult.league_image_path,
            },
        ]);
        setSearchResult(null);
        setInviteCode("");
        setError("");
    };

    // Remove league (don't allow if only 1 left)
    const handleRemoveLeague = (inviteCode) => {
        if (selectedLeagues.length <= 1) {
            setError("At least 1 league must remain.");
            return;
        }
        setSelectedLeagues((prev) =>
            prev.filter((l) => l.inviteCode !== inviteCode)
        );
    };

    // Drag and drop handler
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(selectedLeagues);
        const [reordered] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reordered);
        setSelectedLeagues(items);
    };

    // Update Super League
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) return setError("Super League name is required.");
        if (selectedLeagues.length < 1)
            return setError("Add at least 1 league.");
        if (selectedLeagues.length > 6)
            return setError("Maximum 6 leagues allowed.");

        if (name === superLeague.name &&
            image === superLeague.image &&
            selectedLeagues.length === superLeague.leagues.length &&
            selectedLeagues.every((l, idx) => l._id === superLeague.leagues[idx]._id)) {
            return addAlert("No changes detected.", "info");
        }

        setSubmitting(true);
        try {
            const payload = {
                // user: user._id, // if you use it
                name: name.trim(),
                image,
                leagues: selectedLeagues.map((l) => l._id),
            };
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}superleague?Id=${superLeague._id}`,
                payload
            );
            if (!res.data.error) {
                addAlert("Super League Updated Successfully", "success");
                setTimeout(() => {
                    if (onUpdate) onUpdate();
                }, 2000);
            } else {
                // setError(res.data.message || "Could not update Super League.");
                addAlert(res.data.message || "Could not update Super League.", "error");
            }
        } catch (err) {
            // setError("Error updating Super League.");
            addAlert("Error updating Super League.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <form onSubmit={handleSubmit} className="w-full text-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4 xl:gap-16">
                    <div className="flex flex-col space-y-6 sm:space-y-8">
                        {/* Image */}
                        <div className="flex flex-col space-y-2">
                            <label
                                className="font-bold text-sm sm:text-base xl:text-lg"
                                htmlFor="superleague-logo"
                            >
                                Super League Logo
                            </label>
                            <div className="flex items-center">
                                <input
                                    id="superleague-logo"
                                    type="file"
                                    accept="image/png"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 xl:w-40 xl:h-40 bg-[#0c1922] flex relative items-center justify-center rounded-lg">
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt="Super League Logo"
                                            fill
                                            className="object-cover object-center rounded-lg"
                                        />
                                    ) : (
                                        <FaImage size={40} className="text-[#828282]" />
                                    )}
                                </div>
                                <label
                                    htmlFor="superleague-logo"
                                    className="cursor-pointer py-1 lg:py-2 px-6 ml-4 sm:ml-4 rounded-full text-white font-bold text-sm sm:text-base xl:text-lg border border-[#fff] hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all text-center"
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col lg:hidden">
                            <label
                                className="font-bold text-sm sm:text-base xl:text-lg mb-2 block"
                                htmlFor="superleague-name"
                            >
                                Super League Name<span className="text-red-400">*</span>
                            </label>

                            <input
                                id="superleague-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter super league name"
                                className="w-full px-4 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm xl:text-base"
                                maxLength={40}
                                required
                            />
                        </div>


                        {/* Add leagues by invite code */}
                        <div className="mb-4">
                            <label className="font-bold text-sm sm:text-base xl:text-lg mb-1 sm:mb-2 block">
                                Add Leagues (by Invite Code)
                            </label>
                            <div className="flex flex-row md:items-center space-x-2 md:space-x-4 w-full">
                                <input
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    placeholder="Enter Invite Code"
                                    className={`flex-1 px-3 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm xl:text-base ${selectedLeagues.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}`}
                                    maxLength={16}
                                    disabled={selectedLeagues.length >= 6 || searching}
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchLeague}
                                    disabled={
                                        searching ||
                                        !inviteCode ||
                                        selectedLeagues.length >= 6
                                    }
                                    className={`bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00] transition px-4 py-1 sm:py-2 rounded-3xl text-white text-sm xl:text-base min-w-[100px] flex items-center justify-center ${selectedLeagues.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {searching ? (
                                        <span className="flex items-center">
                                            <FaSpinner className="animate-spin mr-2" /> Searching...
                                        </span>
                                    ) : (
                                        "Search"
                                    )}
                                </button>
                            </div>

                            {/* League Card Display if Search Result Found */}
                            {searchResult && (
                                <div className="w-full mt-4 px-4 py-4 md:py-6 bg-[#0C1922] rounded-xl md:rounded-3xl shadow-[0_0_1px_4px_#1D374A] flex flex-col space-y-2 md:space-y-4 relative">
                                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:justify-between ">
                                        <div className="flex items-center space-x-4 ">
                                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-20 md:h-20 xl:w-24 xl:h-24 overflow-hidden rounded-lg bg-[#101e2b] border border-[#232e38]">
                                                <Image
                                                    src={searchResult.league_image_path ? searchResult.league_image_path : "/images/default_team_logo.png"}
                                                    alt="League Logo"
                                                    fill
                                                    className="object-cover object-center"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-sm sm:text-xl xl:text-2xl font-bold">{searchResult.league_name}</h2>
                                                <div className="text-xs xl:text-sm text-gray-400">
                                                    Owner: {searchResult.creator}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-2 md:top-[6px] sm:right-6">
                                        <button
                                            type="button"
                                            className="bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00] px-4 sm:px-6 py-1 xl:py-2 rounded-3xl flex items-center justify-start text-sm xl:text-base"
                                            onClick={handleAddLeague}
                                        >
                                            Confirm Add
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm xl:text-base mt-2">
                                        <div className="space-y-2">
                                            <p>
                                                Players Joined:
                                                <strong className="ml-2 text-white">
                                                    {searchResult.users_onboard?.length}
                                                </strong>
                                            </p>
                                            <p>
                                                Auto Subs:
                                                <strong className="ml-2 text-white">
                                                    {searchResult.league_configuration?.auto_subs ? "Enabled" : "Disabled"}
                                                </strong>
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p>
                                                Format:
                                                <strong className="ml-2 text-white">
                                                    {searchResult.league_configuration?.format}
                                                </strong>
                                            </p>
                                            <p>
                                                Waiver Format:
                                                <strong className="ml-2 text-white">
                                                    {searchResult.league_configuration?.waiver_format}
                                                </strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-6 sm:space-y-8">
                        {/* Name */}
                        <div className="hidden lg:flex flex-col">
                            <label
                                className="font-bold text-sm sm:text-base xl:text-lg mb-2 block"
                                htmlFor="superleague-name"
                            >
                                Super League Name<span className="text-red-400">*</span>
                            </label>

                            <input
                                id="superleague-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter super league name"
                                className="w-full px-3 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm xl:text-base"
                                maxLength={40}
                                required
                            />
                        </div>
                        {/* Added Leagues - Drag and Drop */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm sm:text-base xl:text-lg mb-2 block">
                                Added Leagues (Drag to reorder, At least 1)<span className="text-red-400">*</span>
                            </label>
                            {/* 3x2 grid, always 6 slots */}
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="leagues" direction="vertical">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
                                        >
                                            {Array.from({ length: 6 }).map((_, idx) => {
                                                const leagues = selectedLeagues[idx];
                                                return (
                                                    <Draggable
                                                        key={leagues?.inviteCode || `empty-${idx}`}
                                                        draggableId={leagues?.inviteCode || `empty-${idx}`}
                                                        index={idx}
                                                        isDragDisabled={!leagues}
                                                    >
                                                        {(dragProvided) => (
                                                            <div
                                                                ref={dragProvided.innerRef}
                                                                {...dragProvided.draggableProps}
                                                                {...dragProvided.dragHandleProps}
                                                                className={`h-14 xl:h-16 flex items-center justify-center rounded-xl border-2 border-dashed ${leagues ? "border-[#1bffa2]" : "border-gray-400/60"} bg-transparent px-4 transition`}
                                                            >
                                                                {leagues ? (
                                                                    <div className="flex items-center w-full">
                                                                        <div className="relative w-10 h-10 sm:w-8 sm:h-8 xl:w-10 xl:h-10 flex-shrink-0 mr-2">
                                                                            <Image
                                                                                src={leagues.leagueImage || "/images/default_team_logo.png"}
                                                                                alt=""
                                                                                fill
                                                                                className="object-cover rounded-lg"
                                                                            />
                                                                        </div>
                                                                        <span className="font-semibold flex-1 truncate text-sm xl:text-base">
                                                                            {leagues.leagueName}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveLeague(leagues.inviteCode)}
                                                                            className={`ml-2 sm:ml-3 p-2 text-red-400 hover:text-red-700 ${selectedLeagues.length <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                            aria-label="Remove league"
                                                                            disabled={selectedLeagues.length <= 1}
                                                                        >
                                                                            <FaTimes />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <FaPlus className="text-gray-400" />
                                                                )}
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
                    </div>
                </div>

                {/* Submit Row */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between mt-8 sm:mt-12 gap-4">
                    {/* Errors */}
                    {error ?
                        <div className="text-[#df2d2d] text-sm xl:text-base font-bold flex-1">{error}</div>
                        : <div className="flex-1"></div>
                    }
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`fade-gradient font-bold px-4 sm:px-6 py-2 bg-gray-300 rounded-3xl flex items-center justify-center text-sm xl:text-base`}
                        disabled={submitting}
                    >
                        {submitting ? "Updating..." : "Update Super League"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SuperLeagueEditForm;
