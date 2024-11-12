'use client';

import React, { useEffect, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import Image from 'next/image';
import Slider from 'react-slick'; // For carousel functionality
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const CreateTeam = ({ onNext, onBack }) => {
    const savedData = JSON.parse(sessionStorage.getItem('teamData')) || {};

    const [teamName, setTeamName] = useState(savedData.teamName || '');
    const [teamLogo, setTeamLogo] = useState(savedData.teamLogo || null);
    const [groundName, setGroundName] = useState(savedData.groundName || '');
    const [selectedGround, setSelectedGround] = useState(savedData.selectedGround || '/images/stadium1.png');

    const groundImages = [
        '/images/stadium1.png',
        '/images/stadium2.png',
        '/images/stadium3.png',
        '/images/stadium4.png',
        '/images/stadium5.png',
        '/images/stadium6.png',
        '/images/stadium7.png',
        '/images/stadium8.png',
        '/images/stadium9.png',
        '/images/stadium10.png',
        '/images/stadium11.png',
        '/images/stadium12.png',
    ];

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
            setTeamLogo(base64Image);
        }
    };

    const handleSubmit = () => {
        // Store data to session storage
        sessionStorage.setItem('teamData', JSON.stringify({ teamName, teamLogo, groundName, selectedGround }));
        onNext();  // Move to next step
    };

    const handleBack = () => {
        // Store data to session storage
        sessionStorage.setItem('teamData', JSON.stringify({ teamName, teamLogo, groundName, selectedGround }));
        onBack();  // Go back to previous step
    };

    const NextArrow = ({ onClick }) => (
        <div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#FF8A00] text-3xl cursor-pointer hover:text-white z-10"
            onClick={onClick}
        >
            <FaChevronRight />
        </div>
    );

    const PrevArrow = ({ onClick }) => (
        <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#FF8A00] text-3xl cursor-pointer hover:text-white z-10"
            onClick={onClick}
        >
            <FaChevronLeft />
        </div>
    );

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        dotsClass: "slick-dots custom-dots",
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
            <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
                <h1 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 2 : Create Your Team
                </h1>
                <p className='my-4 w-2/3'>
                    Create your team by giving it a name, selecting a home ground, and adding a unique logo. The choices you make here will personalize your experience and help others identify your team within the league.
                </p>

                <div className='mt-8 grid grid-cols-2 gap-x-12'>
                    <div className='flex flex-col space-y-8'>
                        {/* Team Name Input */}
                        <div className="flex flex-col w-[60%] space-y-2">
                            <label className="font-bold text-lg" htmlFor="team-name">Team Name</label>
                            <input
                                id="team-name"
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(capitalizeWords(e.target.value))}
                                placeholder="Enter your team name"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                            />
                        </div>
                        {/* Ground Name Input */}
                        <div className="flex flex-col w-[60%] mt-4 space-y-2">
                            <label className="font-bold text-lg" htmlFor="ground-name">Ground Name</label>
                            <input
                                id="ground-name"
                                type="text"
                                value={groundName}
                                onChange={(e) => setGroundName(capitalizeWords(e.target.value))}
                                placeholder="Enter the ground name"
                                className="w-full px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                            />
                        </div>
                    </div>

                    {/* Team Logo Upload */}
                    <div className="flex items-start space-x-4">
                        <div className="flex flex-col space-y-4">
                            <label className="font-bold text-lg" htmlFor="team-logo">Team Logo</label>
                            <label
                                htmlFor="team-logo"
                                className="cursor-pointer py-2 px-8 mr-24 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all"
                            >
                                Choose File
                            </label>
                            <input
                                id="team-logo"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <div className="bg-[#0C1922] w-[200px] h-[200px] flex items-center justify-center rounded-lg p-2">
                            {teamLogo ? (
                                <Image
                                    src={teamLogo} // Use base64 URL directly
                                    alt="Team Logo"
                                    width={200}
                                    height={200}
                                    className="object-cover rounded-lg"
                                />
                            ) : (
                                <FaImage size={80} className="text-[#828282]" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Ground Selection Carousel */}
                <div className="my-8 w-full space-y-2">
                    <label className="font-bold text-lg">Select Ground</label>
                    <Slider {...sliderSettings} className="flex px-12 justify-center items-center ">
                        {groundImages.map((ground, index) => (
                            <div
                                key={index}
                                className={`rounded-lg outline-none`}
                                onClick={() => setSelectedGround(ground)}
                            >
                                <div className="w-[400px] h-[200px] overflow-hidden relative">
                                    <Image
                                        src={ground}
                                        alt={`Ground ${index + 1}`}
                                        fill
                                        className={`object-cover rounded-lg cursor-pointer ${selectedGround === ground ? 'border border-4 border-[#FF8A00]' : ''}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={handleBack}
                    className={`absolute left-0 bottom-0 fade-gradient py-4 px-20 mx-6 md:mx-10 lg:mx-16 xl:mx-20 mt-36 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
                >
                    BACK : League Settings
                </button>
                <button
                    onClick={handleSubmit}
                    className={`absolute right-0 bottom-0 fade-gradient py-4 px-20 mx-6 md:mx-10 lg:mx-16 xl:mx-20 mt-36 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
                >
                    NEXT : Invite Members
                </button>
            </div>
        </div>
    );
};

export default CreateTeam;
