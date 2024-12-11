'use client';

import React, { useEffect, useState } from 'react';
import { FaImage, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const CreateLeague = ({ onNext }) => {
    const savedLeagueData = JSON.parse(sessionStorage.getItem('leagueData')) || {};

    const [leagueName, setLeagueName] = useState(savedLeagueData.leagueName || '');
    const [leagueLogo, setLeagueLogo] = useState(savedLeagueData.leagueLogo || null);
    const [maxTeams, setMaxTeams] = useState(savedLeagueData.maxTeams || 12);
    const [secPerPick, setSecPerPick] = useState(savedLeagueData.secPerPick || 30);
    const [format, setFormat] = useState(savedLeagueData.format || 'Classic');
    const [startDraft, setStartDraft] = useState(savedLeagueData.startDraft || 'Manual');
    const [draftTime, setDraftTime] = useState(savedLeagueData.draftTime ? new Date(savedLeagueData.draftTime) : null);
    const [formatToolTipVisible, setFormatToolTipVisible] = useState(false);
    const [draftToolTipVisible, setDraftToolTipVisible] = useState(false);
    const [timeZone, setTimeZone] = useState(moment.tz.guess());

    const capitalizeWords = (str) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64Image = await toBase64(file);
            setLeagueLogo(base64Image);
        }
    };

    const handleSubmit = () => {
        const draftTimeUTC = startDraft === 'Scheduled' && draftTime ? moment(draftTime).utc().format() : null;
        sessionStorage.setItem(
            'leagueData',
            JSON.stringify({ leagueName, leagueLogo, maxTeams, secPerPick, format, startDraft, draftTime: draftTimeUTC })
        );
        onNext(); // Move to next step
    };

    useEffect(() => {
        const savedLeagueData = JSON.parse(sessionStorage.getItem('leagueData')) || {};
        if (savedLeagueData.leagueLogo) {
            setLeagueLogo(savedLeagueData.leagueLogo);
        }
    }, []);

    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8 px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-24">
            <div className="w-full relative pb-20">
                <h1 className={`text-2xl md:text-4xl font-bold ${exo2.className}`}>Step 1: Create League</h1>
                <p className="my-4 text-sm md:text-base lg:text-lg max-w-3xl">
                    Enter the details for your new league. Customize the name, logo, number of teams, and how your draft will start. This information will define your league and its structure, ensuring all participants have a clear understanding before joining.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                    <div className="flex flex-col space-y-6 max-w-sm lg:max-w-lg">
                        {/* League Name Input */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm md:text-lg mb-2" htmlFor="league-name">League Name</label>
                            <input
                                id="league-name"
                                type="text"
                                value={leagueName}
                                onChange={(e) => setLeagueName(capitalizeWords(e.target.value))}
                                placeholder="Enter your league name"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
                            />
                        </div>

                        {/* Maximum Number of Teams Input */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm md:text-lg mb-2" htmlFor="max-teams">Maximum Number of Teams</label>
                            <input
                                id="max-teams"
                                type="number"
                                value={maxTeams}
                                onChange={(e) => setMaxTeams(e.target.value)}
                                placeholder="Enter the Maximum Number of Teams"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
                            />
                        </div>

                        {/* Seconds Per Pick Input */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm md:text-lg mb-2" htmlFor="sec-per-pick">Seconds per Pick</label>
                            <input
                                id="sec-per-pick"
                                type="number"
                                value={secPerPick}
                                onChange={(e) => setSecPerPick(e.target.value)}
                                placeholder="Enter seconds per pick for the draft"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
                            />
                        </div>

                        {/* Format Selection */}
                        <div className="flex flex-col relative">
                            <label className="font-bold text-sm md:text-lg flex items-center">
                                Format
                                <FaInfoCircle
                                    className="ml-2 cursor-pointer"
                                    onMouseOver={() => setFormatToolTipVisible(true)}
                                    onMouseLeave={() => setFormatToolTipVisible(false)}
                                />
                            </label>
                            {formatToolTipVisible && (
                                <div className="absolute top-[-70px] left-0 bg-white text-black text-xs p-3 rounded-lg shadow-md max-w-md">
                                    In head-to-head leagues, each team plays another team each week. You earn 3 points for a win, and 1 point for a draw. In classic leagues, teams are ranked by total points scored.
                                </div>
                            )}
                            <div className="flex flex-row space-x-4 mt-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Classic"
                                        checked={format === 'Classic'}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-sm md:text-base">Classic</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Head to Head"
                                        checked={format === 'Head to Head'}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-sm md:text-base">Head to Head</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6 max-w-sm lg:max-w-lg">
                        {/* League Logo Upload */}
                        <div className="flex flex-col space-y-4">
                            <label className="font-bold text-sm md:text-lg">League Logo</label>
                            <div className="flex items-center space-x-4">
                                <label
                                    htmlFor="league-logo"
                                    className="cursor-pointer py-2 px-6 rounded-full text-white font-bold text-sm md:text-base border border-[#fff] hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all"
                                >
                                    Choose File
                                </label>
                                <input
                                    id="league-logo"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-[#0C1922] flex items-center justify-center relative rounded-lg">
                                    {leagueLogo ? (
                                        <Image
                                            src={leagueLogo}
                                            alt="League Logo"
                                            fill
                                            className="object-cover object-center rounded-lg relative"
                                        />
                                    ) : (
                                        <FaImage size={50} className="text-[#828282]" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Start Draft Selection */}
                        <div className="flex flex-col relative">
                            <label className="font-bold text-sm md:text-lg flex items-center">
                                Start Draft
                                <FaInfoCircle
                                    className="ml-2 cursor-pointer"
                                    onMouseOver={() => setDraftToolTipVisible(true)}
                                    onMouseLeave={() => setDraftToolTipVisible(false)}
                                />
                            </label>
                            {draftToolTipVisible && (
                                <div className="absolute top-[-50px] left-0 bg-white text-black text-xs p-3 rounded-lg shadow-md w-64">
                                    The draft can either be started manually or scheduled to start automatically.
                                </div>
                            )}
                            <div className="flex flex-row space-x-4 mt-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Manual"
                                        checked={startDraft === 'Manual'}
                                        onChange={(e) => setStartDraft(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-sm md:text-base">Manual</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Scheduled"
                                        checked={startDraft === 'Scheduled'}
                                        onChange={(e) => setStartDraft(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-sm md:text-base">Scheduled</span>
                                </label>
                            </div>
                        </div>

                        {/* Draft Date and Time Picker */}
                        {startDraft === 'Scheduled' && (
                            <div className="flex flex-col">
                                <label className="font-bold text-sm md:text-lg mb-2">Draft Date and Time (Local Time Zone: {timeZone})</label>
                                <DatePicker
                                    selected={draftTime}
                                    onChange={(date) => setDraftTime(date)}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
                                />
                                {draftTime && (
                                    <p className="text-xs md:text-sm text-gray-400 mt-2">
                                        Your draft will be scheduled for: {moment(draftTime).tz(timeZone).format('LLLL')} ({timeZone})
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className={`absolute bottom-0 right-0 mt-10 fade-gradient py-2 px-4 md:py-3 md:px-12 rounded-full text-white font-bold text-sm md:text-lg transition-all ease-in-out ${exo2.className}`}
                    onClick={handleSubmit}
                >
                    NEXT: Create Your Team
                </button>
            </div>
        </div>
    );
};

export default CreateLeague;
