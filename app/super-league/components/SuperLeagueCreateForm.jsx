"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Exo_2 } from "next/font/google";
import { FaImage, FaPlus, FaSpinner, FaTimes } from "react-icons/fa";

const exo2 = Exo_2({
    weight: ["700", "800"],
    style: ["italic"],
    subsets: ["latin"],
});

const SuperLeagueCreateForm = ({ User, onBack, onCreated }) => {
    // Form state
    const [name, setName] = useState("");
    const [image, setImage] = useState(""); // base64 data URL
    const [inviteCode, setInviteCode] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [selectedLeagues, setSelectedLeagues] = useState([]);
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Handle image upload and preview as base64
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
        if (file) {
            const base64 = await toBase64(file);
            setImage(base64);
        }
    };

    // Add league via invite code
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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/superleague/code?inviteCode=${inviteCode.trim()}`
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

    const handleRemoveLeague = (inviteCode) => {
        setSelectedLeagues((prev) =>
            prev.filter((l) => l.inviteCode !== inviteCode)
        );
    };

    // Form validation and submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) return setError("Super League name is required.");
        if (selectedLeagues.length < 1)
            return setError("Add at least 1 league.");
        if (selectedLeagues.length > 6)
            return setError("Maximum 6 leagues allowed.");

        setSubmitting(true);
        try {
            const payload = {
                user: User?._id,
                name: name.trim(),
                image, // For now base64, replace with uploaded URL for production
                leagues: selectedLeagues.map((l) => l._id),
            };
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/superleague`,
                payload
            );
            if (!res.data.error) {
                if (onCreated) onCreated();
            } else {
                setError(res.data.message || "Could not create Super League.");
            }
        } catch (err) {
            setError("Error submitting form.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <form
                onSubmit={handleSubmit}
                className="w-full text-white"
            >
                <div className="grid grid-cols-2 gap-24">
                    <div className="flex flex-col space-y-8">
                        {/* Image (optional) */}
                        <div className="flex flex-col space-y-1">
                            <label
                                className="font-bold text-sm md:text-lg"
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
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-[#0C1922] flex relative items-center justify-center rounded-lg">
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt="Super League Logo"
                                            fill
                                            className="object-cover object-center rounded-lg"
                                        />
                                    ) : (
                                        <FaImage size={50} className="text-[#828282]" />
                                    )}
                                </div>
                                <label
                                    htmlFor="superleague-logo"
                                    className="cursor-pointer py-2 px-8 ml-4 rounded-full text-white font-bold text-sm md:text-base border border-[#fff]  hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all"
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>
                        {/* Add leagues by invite code */}
                        <div className="mb-6">
                            <label className="font-bold text-sm md:text-lg mb-2 block">
                                Add Leagues (by Invite Code)
                            </label>
                            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4 w-full">
                                <input
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    placeholder="Enter Invite Code"
                                    className={`flex-1 px-4 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base ${selectedLeagues.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                    className={`bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00] transition px-4 py-2 rounded-xl text-white font-bold text-sm md:text-base min-w-[100px] flex items-center justify-center ${selectedLeagues.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                <div className="w-full mt-4 px-4 md:px-6 py-4 md:py-6 bg-[#070E13] rounded-3xl shadow-[0_0_1px_4px_rgba(12,25,34,1)] flex flex-col space-y-2 md:space-y-4 relative">
                                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:justify-between ">
                                        <div className="flex items-center space-x-4 ">
                                            <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg bg-[#101e2b] border border-[#232e38]">
                                                {searchResult.league_image_path ? (
                                                    <Image
                                                        src={searchResult.league_image_path}
                                                        alt="League Logo"
                                                        fill
                                                        className="object-cover object-center"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-gray-500">No Logo</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-xl md:text-2xl font-bold">{searchResult.league_name}</h2>
                                                <div className="text-xs md:text-sm text-gray-400">
                                                    Owner:{" "}
                                                    {searchResult.creator}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-6">
                                        <button
                                            type="button"
                                            className="bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00] px-8 py-2 rounded-xl text-white mt-3 font-bold"
                                            onClick={handleAddLeague}
                                        >
                                            Confirm Add
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm md:text-base mt-2">
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
                    <div className="flex flex-col space-y-8">
                        {/* Name */}
                        <div className="flex flex-col">
                            <label
                                className="font-bold text-sm md:text-lg mb-2 block"
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
                                className="w-full px-4 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-base"
                                maxLength={40}
                                required
                            />
                        </div>
                        {/* Added Leagues */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm md:text-lg mb-2 block">
                                Added Leagues (At least 1)<span className="text-red-400">*</span>
                            </label>
                            {/* 3x2 grid, always 6 slots */}
                            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                                {Array.from({ length: 6 }).map((_, idx) => {
                                    const lg = selectedLeagues[idx];
                                    return (
                                        <div
                                            key={idx}
                                            className={`h-16 flex items-center justify-center rounded-xl border-2 border-dashed ${lg ? "border-[#1bffa2]" : "border-gray-400/60"} bg-transparent px-4 transition`}
                                        >
                                            {lg ? (
                                                <div className="flex items-center w-full">
                                                    <Image
                                                        src={lg.leagueImage || "/images/default_team_logo.png"}
                                                        alt=""
                                                        width={44}
                                                        height={44}
                                                        className="rounded-full"
                                                    />
                                                    <span className="ml-3 font-semibold flex-1 truncate">
                                                        {lg.leagueName}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLeague(lg.inviteCode)}
                                                        className="ml-3 text-red-400 hover:text-red-700"
                                                        aria-label="Remove league"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ) : (

                                                <FaPlus />

                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>


                <div className="w-full flex items-end justify-between mt-12">
                    {/* Errors */}
                    {error ?
                        <div className="text-[#df2d2d] text-end mb-2 text-lg font-bold">Error: {error}</div>
                        : <div className="text-[#df2d2d] text-end mb-2 text-lg font-bold"></div>
                    }
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`fade-gradient  py-3 rounded-full px-12 font-bold text-lg mt-3`}
                        disabled={submitting}
                    >
                        {submitting ? "Creating..." : "Create Super League"}
                    </button>

                </div>


            </form>
        </div>
    );
};

export default SuperLeagueCreateForm;
