'use client';

import React, { useEffect, useState } from 'react';
import { FaImage, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
        sessionStorage.setItem(
            'leagueData',
            JSON.stringify({ leagueName, leagueLogo, maxTeams, secPerPick, format, startDraft, draftTime })
        );
        onNext();  // Move to next step
    };

    useEffect(() => {
        const savedLeagueData = JSON.parse(sessionStorage.getItem('leagueData')) || {};
        if (savedLeagueData.leagueLogo) {
            setLeagueLogo(savedLeagueData.leagueLogo);
        }
    }, []);

    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
            <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
                <h1 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 1: Create League
                </h1>
                <p className='my-4 w-2/3'>
                    Enter the details for your new league. Customize the name, logo, number of teams, and how your draft will start. This information will define your league and its structure, ensuring all participants have a clear understanding before joining.
                </p>

                <div className='mt-8 grid grid-cols-2 gap-x-12'>
                    <div className='flex flex-col space-y-8'>
                        {/* League Name Input */}
                        <div className="flex flex-col w-[60%] space-y-2">
                            <label className="font-bold text-lg" htmlFor="league-name">League Name</label>
                            <input
                                id="league-name"
                                type="text"
                                value={leagueName}
                                onChange={(e) => setLeagueName(capitalizeWords(e.target.value))}
                                placeholder="Enter your league name"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                            />
                        </div>
                        {/* Maximum Number of Teams Input */}
                        <div className="flex flex-col w-[60%] mt-4 space-y-2">
                            <label className="font-bold text-lg" htmlFor="max-teams">Maximum Number of Teams</label>
                            <input
                                id="max-teams"
                                type="text"
                                value={maxTeams}
                                onChange={(e) => setMaxTeams(e.target.value)}
                                placeholder="Enter the Maximum Number of Teams"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                            />
                        </div>
                        {/* Seconds Per Pick Input */}
                        <div className="flex flex-col w-[60%] mt-4 space-y-2">
                            <label className="font-bold text-lg" htmlFor="sec-per-pick">Seconds per Pick</label>
                            <input
                                id="sec-per-pick"
                                type="text"
                                value={secPerPick}
                                onChange={(e) => setSecPerPick(e.target.value)}
                                placeholder="Enter seconds per pick for the draft"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-x-4">
                        {/* League Logo Upload */}
                        <div className="flex items-start space-x-4">
                            <div className="flex flex-col space-y-4">
                                <label className="font-bold text-lg" htmlFor="league-logo">League Logo</label>
                                <label
                                    htmlFor="league-logo"
                                    className="cursor-pointer py-2 px-8 mr-24 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all"
                                >
                                    Choose File
                                </label>
                                <input
                                    id="league-logo"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="bg-[#0C1922] w-[200px] h-[200px] flex items-center justify-center rounded-lg p-2">
                                {leagueLogo ? (
                                    <Image
                                        src={leagueLogo}
                                        alt="League Logo"
                                        width={200}
                                        height={200}
                                        className="object-cover rounded-lg"
                                    />
                                ) : (
                                    <FaImage size={80} className="text-[#828282]" />
                                )}
                            </div>
                        </div>

                        {/* Format Selection */}
                        <div className="flex flex-col mb-8 space-y-2 relative">
                            <label className="font-bold text-lg flex items-center ">
                                Format
                                <FaInfoCircle
                                    className="ml-2 mb-1 cursor-pointer"
                                    onMouseOver={() => setFormatToolTipVisible(true)}
                                    onMouseLeave={() => setFormatToolTipVisible(false)}
                                />
                            </label>
                            {formatToolTipVisible && (
                                <div className="absolute -top-24 bg-white text-black text-sm p-3 rounded-lg shadow-md max-w-lg">
                                    In head to head leagues, each team plays another team each week. You earn 3 points for a win, and 1 point for a draw. In classic leagues, teams are ranked by total points scored.
                                </div>
                            )}
                            <div className="flex flex-col justify-center space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Classic"
                                        checked={format === 'Classic'}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-[#c2c2c2] text-lg mt-1">Classic</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Head to Head"
                                        checked={format === 'Head to Head'}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-[#c2c2c2] text-lg mt-1">Head to Head</span>
                                </label>
                            </div>
                        </div>

                        {/* Start Draft Selection */}
                        <div className="flex flex-col mb-8 space-y-2 relative">
                            <label className="font-bold text-lg flex items-center ">
                                Start Draft
                                <FaInfoCircle
                                    className="ml-2 mb-1 cursor-pointer"
                                    onMouseOver={() => setDraftToolTipVisible(true)}
                                    onMouseLeave={() => setDraftToolTipVisible(false)}
                                />
                            </label>
                            {draftToolTipVisible && (
                                <div className="absolute -top-20 bg-white text-black text-sm p-3 rounded-lg shadow-md w-72">
                                    The draft can either be started manually or scheduled to start automatically.
                                </div>
                            )}
                            <div className="flex flex-col justify-center space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Manual"
                                        checked={startDraft === 'Manual'}
                                        onChange={(e) => setStartDraft(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-[#c2c2c2] text-lg mt-1">Manual</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Scheduled"
                                        checked={startDraft === 'Scheduled'}
                                        onChange={(e) => setStartDraft(e.target.value)}
                                        className="custom-radio relative focus:outline-none"
                                    />
                                    <span className="ml-2 text-[#c2c2c2] text-lg mt-1">Scheduled</span>
                                </label>
                            </div>
                        </div>

                        {/* Draft Date and Time Picker */}
                        {startDraft === 'Scheduled' && (
                            <div className="flex flex-col mb-8 space-y-2">
                                <label className="font-bold text-lg">Draft Date and Time</label>
                                <DatePicker
                                    selected={draftTime}
                                    onChange={(date) => setDraftTime(date)}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className={`absolute right-0 bottom-0 fade-gradient py-4 px-20 mx-6 md:mx-10 lg:mx-16 xl:mx-20 mt-36 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
                >
                    NEXT : Create Your Team
                </button>
            </div>
        </div>
    );
};

export default CreateLeague;
