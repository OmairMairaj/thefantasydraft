'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Optional if you're linking to other sections
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic', 'normal'],
    subsets: ['latin'],
});

const ContentSection = () => {
    const [activeSection, setActiveSection] = useState('Welcome');

    return (
        <section className="pl-0 min-h-[1000px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="sidebar md:sticky top-20 p-6 rounded-lg shadow-lg">
                    {/* Sidebar Sections */}
                    <div className="mb-8">
                        <h2 className={`text-xl text-white mb-4 italic ${exo2.className}`}>Get Started</h2>
                        <ul className="space-y-2">
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Welcome' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Welcome')}
                            >
                                Welcome
                            </li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className={`text-xl text-white mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <ul className="space-y-2">
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Auction Draft' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Auction Draft')}
                            >
                                Auction Draft
                            </li>
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Snake Draft' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Snake Draft')}
                            >
                                Snake Draft
                            </li>
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Points' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Points')}
                            >
                                Points
                            </li>
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Set Your Lineup' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Set Your Lineup')}
                            >
                                Set Your Lineup
                            </li>
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Transfers' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Transfers')}
                            >
                                Transfers
                            </li>
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'Waivers' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('Waivers')}
                            >
                                Waivers
                            </li>
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 'FAQ' ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection('FAQ')}
                            >
                                FAQ
                            </li>
                            {/* Add more sections as needed */}
                        </ul>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 rounded-lg shadow-lg p-8 ">
                    <h3 className={`text-3xl font-bold text-orange-500 mb-4 italic ${exo2.className}`}>{activeSection}</h3>
                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                        {activeSection === 'Welcome' && 'Draft Fantasy is the home of draft fantasy football (soccer). We offer games for the English Premier League and Euro 2024, with more leagues coming soon.'}
                        {activeSection === 'Auction Draft' && 'In Auction Draft, each team starts with a balance of £250. You bid on players, and the team with the highest bid receives the player.'}
                        {activeSection === 'Snake Draft' && 'In Snake Draft, players are picked one by one. The order is reversed each round, which is why it’s called a snake draft.'}
                        {activeSection === 'Points' && 'Points are awarded based on real-life player performances. Actions such as goals, assists, clean sheets, and cards determine points.'}
                        {activeSection === 'Set Your Lineup' && 'Set your best 11 players for each Gameweek. Your starting lineup should consist of 1 goalkeeper, at least 3 defenders, and 1 forward.'}
                        {activeSection === 'Transfers' && 'Use transfers to swap out underperforming players. Each Gameweek allows a free transfer, with additional ones costing points.'}
                        {activeSection === 'Waivers' && 'Players that are dropped by other managers are placed on waivers. You can claim these players by submitting a waiver request.'}
                        {activeSection === 'FAQ' && 'Find answers to common questions, such as how scoring works, how transfers are managed, and other gameplay-related queries.'}
                    </p>

                    {/* Demo Video or Image
                    {activeSection === 'Welcome' && (
                        <div className="relative">
                            <Image
                                src="/images/demo-placeholder.svg"
                                alt="Demo"
                                width={1000}
                                height={600}
                                className="rounded-lg shadow-md"
                            />
                        </div>
                    )} */}
                </div>
            </div>
        </section>
    );
};

export default ContentSection;
