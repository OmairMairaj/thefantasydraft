import React from 'react';
import Image from 'next/image';
import { Exo_2 } from '@next/font/google';

const exo2 = Exo_2({
    weight: ['400', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

export default function UpcomingGames() {
    const games = [
        {
            id: 1,
            homeTeam: {
                name: 'FC Barcelona',
                logo: '/images/barcelona-logo.svg', // Replace with actual path
            },
            awayTeam: {
                name: 'Man City',
                logo: '/images/man-city-logo.svg', // Replace with actual path
            },
            date: '10th September 2024',
            time: '8:00PM',
        },
        {
            id: 2,
            homeTeam: {
                name: 'FC Barcelona',
                logo: '/images/barcelona-logo.svg', // Replace with actual path
            },
            awayTeam: {
                name: 'Man City',
                logo: '/images/man-city-logo.svg', // Replace with actual path
            },
            date: '10th September 2024',
            time: '8:00PM',
        },
        {
            id: 3,
            homeTeam: {
                name: 'FC Barcelona',
                logo: '/images/barcelona-logo.svg', // Replace with actual path
            },
            awayTeam: {
                name: 'Man City',
                logo: '/images/man-city-logo.svg', // Replace with actual path
            },
            date: '10th September 2024',
            time: '8:00PM',
        },
        {
            id: 4,
            homeTeam: {
                name: 'FC Barcelona',
                logo: '/images/barcelona-logo.svg', // Replace with actual path
            },
            awayTeam: {
                name: 'Man City',
                logo: '/images/man-city-logo.svg', // Replace with actual path
            },
            date: '10th September 2024',
            time: '8:00PM',
        },
        {
            id: 5,
            homeTeam: {
                name: 'FC Barcelona',
                logo: '/images/barcelona-logo.svg', // Replace with actual path
            },
            awayTeam: {
                name: 'Man City',
                logo: '/images/man-city-logo.svg', // Replace with actual path
            },
            date: '10th September 2024',
            time: '8:00PM',
        },
        {
            id: 6,
            homeTeam: {
                name: 'FC Barcelona',
                logo: '/images/barcelona-logo.svg', // Replace with actual path
            },
            awayTeam: {
                name: 'Man City',
                logo: '/images/man-city-logo.svg', // Replace with actual path
            },
            date: '10th September 2024',
            time: '8:00PM',
        },
        // Add more games here as needed
    ];

    return (
        <section className="upcoming-games-section py-16">
            <div className="">
                {/* Section Title */}
                <h2 className={`text-orange-500 text-3xl md:text-4xl font-bold mb-12 text-center ${exo2.className}`}>
                    UPCOMING GAME WEEKS
                </h2>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
                    {games.map((game) => (
                        <div key={game.id} className="bg-[#070E13] rounded-xl  text-center space-y-4 pb-4">
                            {/* Teams Logos and VS */}
                            <div className="flex justify-between items-center">
                                {/* Home Team */}
                                <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-r from-[#0C192200] to-[#0C1922]">
                                    <Image
                                        src={game.homeTeam.logo}
                                        alt={game.homeTeam.name}
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                    <span className="text-white mt-2">{game.homeTeam.name}</span>
                                </div>

                                {/* VS */}
                                <div className={`flex justify-center items-center relative ${exo2.className}`} style={{ height: '4rem', width: '4rem', fontSize: '3rem' }}>
                                    <span className="absolute text-orange-500 font-bold" style={{ top: '-0.5rem', left: '0rem' }}>V</span>
                                    <span className="absolute text-orange-500 font-bold" style={{ top: '0.5rem', left: '1.6rem' }}>S</span>
                                </div>

                                {/* Away Team */}
                                <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-l from-[#0C192200] to-[#0C1922]">
                                    <Image
                                        src={game.awayTeam.logo}
                                        alt={game.awayTeam.name}
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                    <span className="text-white mt-2">{game.awayTeam.name}</span>
                                </div>
                            </div>

                            {/* Game Date and Time */}
                            <div className={`text-orange-500 text-lg ${exo2.className}`}>
                                {game.date} {game.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
