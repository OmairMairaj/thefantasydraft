'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

export default function PlayByPlay() {
    const [activeStep, setActiveStep] = useState(0);

    const handleStepClick = (step) => {
        setActiveStep(step - 1); // Toggle the same step or close it
    };

    const steps = [
        {
            id: 1,
            title: 'STEP 1',
            description: 'Description for step 1 goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            image: '/images/step1-image.svg', // Replace with actual image path
        },
        {
            id: 2,
            title: 'STEP 2',
            description: 'Description for step 2 goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            image: '/images/step1-image.svg', // Replace with actual image path
        },
        {
            id: 3,
            title: 'STEP 3',
            description: 'Description for step 3 goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            image: '/images/step1-image.svg', // Replace with actual image path
        },
        {
            id: 4,
            title: 'STEP 4',
            description: 'Description for step 4 goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            image: '/images/step1-image.svg', // Replace with actual image path
        },
    ];


    // Handle navigation to the next and previous steps
    const handleNext = () => {
        setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setActiveStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
    };

    return (
        <section className="playbyplay-section py-16">
            <div className="">

                {/* Play By Play Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    {/* Text Section */}
                    <div>
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${exo2.className}`}>PLAY BY PLAY</h2>
                        <p className="text-lg mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className="text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>
                    {/* Image Section */}
                    <div className="flex justify-center">
                        <Image
                            src="/images/football-lineup.svg" // Replace with your actual image path
                            alt="Football Lineup"
                            width={1000}
                            height={300}
                            className="rounded-lg shadow-md"
                        />
                    </div>
                </div>

                {/* Steps Section */}
                <div className="steps-section grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Step 1 */}
                    <div
                        className={`${activeStep === 0 ? 'bg-black' : 'bg-transparent'
                            } rounded-lg p-6 border-2 border-[#FF8A00] transition-all duration-300`}
                        onClick={() => handleStepClick(1)}
                    >
                        <h6
                            className={` text-xl font-bold mb-4 cursor-pointer ${activeStep === 0 ? '' : 'text-center py-4'
                                }`}
                        >
                            STEP 1
                        </h6>
                        {activeStep === 0 && (
                            <div className="text-white text-lg mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                <div className="flex justify-center mt-4">
                                    <Image
                                        src="/images/step1-image.svg" // Replace with your actual image path
                                        alt="Step 1"
                                        width={500}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2 */}
                    <div
                        className={`${activeStep === 1 ? 'bg-black' : 'bg-transparent'
                            } rounded-lg p-6 border-2 border-[#FF8A00] transition-all duration-300`}
                        onClick={() => handleStepClick(2)}
                    >
                        <h6
                            className={` text-xl font-bold mb-4 cursor-pointer ${activeStep === 1 ? '' : 'text-center py-4'
                                }`}
                        >
                            STEP 2
                        </h6>
                        {activeStep === 1 && (
                            <div className="text-white text-lg mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                <div className="flex justify-center mt-4">
                                    <Image
                                        src="/images/step1-image.svg" // Replace with your actual image path
                                        alt="Step 2"
                                        width={350}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 3 */}
                    <div
                        className={`${activeStep === 2 ? 'bg-black' : 'bg-transparent'
                            } rounded-lg p-6 border-2 border-[#FF8A00] transition-all duration-300`}
                        onClick={() => handleStepClick(3)}
                    >
                        <h6
                            className={`text-xl font-bold mb-4 cursor-pointer ${activeStep === 2 ? '' : 'text-center py-4'
                                }`}
                        >
                            STEP 3
                        </h6>
                        {activeStep === 2 && (
                            <div className="text-white text-lg mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                <div className="flex justify-center mt-4">
                                    <Image
                                        src="/images/step1-image.svg" // Replace with your actual image path
                                        alt="Step 3"
                                        width={350}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 4 */}
                    <div
                        className={`${activeStep === 3 ? 'bg-black' : 'bg-transparent'
                            } rounded-lg p-6 border-2 border-[#FF8A00] transition-all duration-300`}
                        onClick={() => handleStepClick(4)}
                    >
                        <h6
                            className={`text-xl font-bold mb-4 cursor-pointer ${activeStep === 3 ? '' : 'text-center py-4'
                                }`}
                        >
                            STEP 4
                        </h6>
                        {activeStep === 3 && (
                            <div className="text-white text-lg mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                <div className="flex justify-center mt-4">
                                    <Image
                                        src="/images/step1-image.svg" // Replace with your actual image path
                                        alt="Step 4"
                                        width={350}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-20">

                {/* Play By Play Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
                    {/* Text Section */}
                    <div>
                        <h2 className={` text-3xl md:text-4xl font-bold mb-4 ${exo2.className}`}>
                            PLAY BY PLAY
                        </h2>

                        {/* Carousel Text */}
                        <h3 className=" text-2xl font-bold mb-4">{steps[activeStep].title}</h3>
                        <p className="text-lg mb-4">{steps[activeStep].description}</p>

                        {/* Navigation Arrows */}
                        <div className="flex space-x-4 mt-4">
                            <button
                                className="bg-gray-800 text-white rounded-full p-2 hover:bg-orange-500 transition"
                                onClick={handlePrev}
                            >
                                ←
                            </button>
                            <button
                                className="bg-gray-800 text-white rounded-full p-2 hover:bg-orange-500 transition"
                                onClick={handleNext}
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {/* Image Carousel Section */}
                    <div className="flex justify-center relative">
                        <Image
                            key={steps[activeStep].id} // Re-render for image change
                            src={steps[activeStep].image}
                            alt={steps[activeStep].title}
                            width={500}
                            height={300}
                            className="rounded-lg transition-all duration-500 ease-in-out"
                        />
                    </div>
                </div>
            </div>

        </section >
    );
}
