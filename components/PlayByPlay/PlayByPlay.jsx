"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Exo_2 } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";


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
    <section
      className="
        relative py-8
      "
    >
      <div className="mx-auto px-4 md:px-0">
        {/* Hero row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 tracking-tight ${exo2.className}`}>
              PLAY BY PLAY
            </h2>
            <p className="ext-base sm:text-lg xl:text-xl leading-relaxed">
              Compete in football-based games for real money. Our extra
              competitions run alongside the fantasy draft—play score predictors
              and last man standing to win actual cash.
            </p>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 blur-2xl opacity-30 bg-[conic-gradient(from_0deg,transparent,rgba(255,138,0,0.6),transparent)] rounded-2xl" />
            <div className="relative w-full sm:w-[80%] md:w-[70%] lg:w-full h-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden">
              <Image
                src="/images/football-lineup2.png"
                alt="Football Lineup"
                width={1200}
                height={600}
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Carousel row */}
        <div
          className="
            grid grid-cols-1 lg:grid-cols-2 gap-10 items-center
          "
        >
          <div className="order-1 md:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[activeStep].id + "-img"}
                initial={{ opacity: 0, x: 30, rotate: 2, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, rotate: -2, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 60) handlePrev();
                  if (info.offset.x < -60) handleNext();
                }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-2xl opacity-25 blur-2xl bg-[conic-gradient(from_180deg,transparent,rgba(255,138,0,0.7),transparent)]" />
                <div className="relative w-full h-40 sm:h-72 md:h-96 lg:h-[23vw] 2xl:h-[22rem] overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                  <Image
                    src={steps[activeStep].image}
                    alt={steps[activeStep].title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Text & controls */}
          <div className="order-2 md:order-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
                PLAY BY PLAY
              </h3>

              {/* Progress bar */}
              {/* <div className="hidden md:block w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={activeStep}
                  className="h-full bg-[#FF8A00]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div> */}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2 mb-6">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(i)}
                  className={`h-2 rounded-full transition-all ${i === activeStep
                    ? "w-8 bg-[#FF8A00] shadow-[0_0_12px_rgba(255,138,0,0.6)]"
                    : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  aria-label={`Go to ${s.title}`}
                />
              ))}
            </div>

            {/* Animated copy */}
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[activeStep].id + "-text"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.035] backdrop-blur-md p-5"
              >
                <div className="mb-2 inline-flex items-center gap-2 text-[#FF8A00]">
                  <span className="text-xs tracking-widest">CURRENT</span>
                  <span className="h-px w-8 bg-[#FF8A00]/40" />
                </div>
                <h4 className="text-2xl font-bold mb-3">{steps[activeStep].title}</h4>
                <p className="leading-relaxed">
                  {steps[activeStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="group inline-flex items-center gap-2 rounded-full px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <span className="grid place-items-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#FF8A00]/20">
                  ←
                </span>
                <span className="hidden sm:inline text-white/90">Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2 bg-[#FF8A00] text-black hover:brightness-110 transition"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="grid place-items-center w-8 h-8 rounded-full bg-black/10">
                  →
                </span>
              </button>
            </div>
          </div>

          {/* Image with swipe/drag */}

        </div>
      </div>
    </section>
  );
}
