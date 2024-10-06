
import React from 'react';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const HeroSection = () => {
    return (
        <section className=" my-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 ">
                <div className="md:w-1/2 space-y-8 ">
                    <h1 className={`text-5xl md:text-6xl font-bold text-white italic ${exo2.className}`}>
                        HOW TO <span className="text-[#FF8A00]">PLAY</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                        The match result is based on the Gameweek score of each team minus any transfer points spent preparing for the Gameweek.
                        3 points are awarded for a win and 1 point for a draw, teams are then ranked on points earned in Head-to-Head matches.
                        Head-to-Head fixtures are generated at the start of the league's first Gameweek.
                    </p>
                    <button className={`fade-gradient text-white flex items-center py-2 px-16 rounded-full font-bold ${exo2.className}`}>
                        LEARN MORE <span className="ml-2 text-2xl flex items-center mb-1.5"> »</span>
                    </button>
                </div>
                <div className="md:w-1/2 relative">
                    {/* Main Image */}
                    <Image
                        src="/images/how-to-play-hero.svg"  // Use your actual image path
                        alt="How to Play"
                        width={1000}
                        height={500}
                        className="object-cover z-20 w-full h-auto rounded-lg relative"
                    />

                    {/* Ellipse Image */}
                    <Image
                        src="/images/CircleBlur.svg"  // Use your actual image path
                        alt="Ellipse"
                        width={1000}
                        height={500}
                        className="object-contain absolute top-[-80px] z-10"
                    />
                </div>
            </div>
            <div className=" flex flex-col md:flex-row items-center justify-between mb-20 ">
                <div className="md:w-1/2 pr-12">
                    <Image
                        src="/images/section-image.svg"  // Use your actual image path
                        alt="How to Play"
                        width={1000}
                        height={500}
                        className="object-cover z-20 w-full rounded-3xl shadow-xl relative"
                    />
                </div>
                <div className="md:w-1/2 space-y-8">
                    <h1 className={`text-4xl md:text-5xl font-bold italic ${exo2.className}`}>
                        GETTING TO KNOW THE BASICS
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                        From your 15 player squad, select 11 players by the Gameweek deadline to form your team.
                        All your points for the Gameweek will be scored by these 11 players, however if one or more doesn't
                        play they may be automatically substituted. Your team can play in any formation providing that 1 goalkeeper,
                        at least 3 defenders and at least 1 forward are selected at all times. rom your starting 11 you nominate a captain and a vice-captain.
                        Your captain's score will be doubled.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
