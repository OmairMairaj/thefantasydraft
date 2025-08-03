"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Exo_2 } from "next/font/google";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

export default function PlayByPlay() {
  const [activeStep, setActiveStep] = useState(0);

  const handleStepClick = (step) => {
    setActiveStep(step - 1); // Toggle the same step or close it
  };

  const steps = [
    {
      id: 1,
      title: "STEP 1",
      description:
        "Gather your friends. Gather up to 20 players per unique league, with the added bonus of a super league functionality for larger leagues with big numbers of players. Make sure you have your own team and league logos to really enhance the experience.",
      image: "/images/step1.png", // Replace with actual image path
    },
    {
      id: 2,
      title: "STEP 2",
      description:
        "Set the rules. Adjust your squad formations and scoring to make your drafting experience unique and competitive with functions such as defensive points for midfielders, finally making those pesky CDMs useful.",
      image: "/images/step2.png", // Replace with actual image path
    },
    {
      id: 3,
      title: "STEP 3",
      description:
        "Draft. Take it in turns to pick your unique squads using our online draft room",
      image: "/images/step3.png", // Replace with actual image path
    },
    {
      id: 4,
      title: "STEP 4",
      description:
        "Battle it out. Set your teams weekly in a head to head or standard scoring league. Transfer in players that have not been picked for other squads, and battle it out for table dominance over your friends.",
      image: "/images/step4.png", // Replace with actual image path
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
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${exo2.className}`}
            >
              PLAY BY PLAY
            </h2>
            <p className="text-lg mb-4">
              Compete in football based games for real money! Our additional
              competitions run alongisde the fantasy draft where you can play
              games like score predictors and last man standing to win actual
              money.
            </p>
            {/* <p className="text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p> */}
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
          {steps.map((item, index) => {
            return (
              <>
                <div
                  className={`
                    ${activeStep === index ? "bg-black" : "bg-transparent"} 
                    rounded-lg p-6 border-2 border-[#FF8A00] transition-all duration-300`
                    }
                  onClick={() => handleStepClick(index + 1)}
                >
                  <h6
                    className={` text-xl font-bold mb-4 cursor-pointer ${
                      activeStep === index ? "" : "text-center py-4"
                    }`}
                  >
                    {item.title}
                  </h6>
                  {activeStep === index && (
                    <div className="text-lg mb-4">
                      {item.description}
                      <div className="flex justify-center mt-4">
                        <Image
                          src={item.image} // Replace with your actual image path
                          alt={item.title}
                          width={500}
                          height={200}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })}
        </div>
      </div>

      <div className="mt-20">
        {/* Play By Play Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          {/* Text Section */}
          <div>
            <h2
              className={` text-3xl md:text-4xl font-bold mb-4 ${exo2.className}`}
            >
              PLAY BY PLAY
            </h2>

            {/* Carousel Text */}
            <h3 className=" text-2xl font-bold mb-4">
              {steps[activeStep].title}
            </h3>
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
    </section>
  );
}
