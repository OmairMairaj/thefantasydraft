'use client';

import React from 'react';
import { Exo_2 } from 'next/font/google';
import { FaBell, FaCog, FaDraft2Digital, FaPlay, FaLink } from 'react-icons/fa';
import Link from 'next/link';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Drafting = () => {
    return (
        <div className="min-h-[88vh] flex flex-col my-16 text-white px-6 md:px-10 lg:px-16 xl:px-20 pb-10">
            {/* Admin Section */}
            <div className="bg-[#1C1C1C] w-full rounded-xl shadow-lg p-6 mb-8 flex justify-between align-bottom relative">
                <div className="flex flex-col space-y-2 w-2/3">
                    <h2 className={`text-4xl font-bold ${exo2.className}`}>Admin</h2>
                    <p className="text-gray-400">Actions only available to Admin.</p>
                    {/* Invite Section */}
                    <div className="flex space-x-4 mb-8">
                        <input
                            type="text"
                            value="Invite via Link"
                            className="bg-[#1C1C1C] w-2/3 px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]"
                        />
                        <button className="fade-gradient py-3 px-6 rounded-full flex items-center space-x-2 ">
                            <FaLink />
                            <span>Copy Link</span>
                        </button>
                    </div>
                </div>

                <div className="flex space-x-4 absolute bottom-0 right-0 p-6">
                    <button className="bg-[#FF8A00] py-3 px-6 text-lg rounded-full flex items-center space-x-2 hover:bg-[#FF9A00]">
                        <FaPlay />
                        <span>Start Draft</span>
                    </button>
                    <button className="bg-[#333333] py-3 px-6 text-lg rounded-full flex items-center space-x-2 hover:bg-[#444444]">
                        <FaCog />
                        <span>League Settings</span>
                    </button>
                </div>
            </div>



            {/* Drafting Info Section */}
            <div className="flex justify-between mb-8">
                <div className='flex space-x-4 w-1/2 pr-4 border-r border-[#404040]'>
                    <div className='flex flex-col space-y-4 w-3/5'>
                        <div className="bg-[#333333] px-4 py-4 rounded-lg text-center">
                            <p className="text-lg">Note: The Drafting has not yet started</p>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="bg-[#1C1C1C] w-1/2 p-4 text-center border border-[#FF8A00] rounded-lg hover:bg-[#444444]">List View</div>
                            <div className="bg-[#1C1C1C] w-1/2 p-4 rounded-lg text-center hover:bg-[#444444]">Pitch View</div>
                        </div>
                    </div>

                    <div className="bg-[#333333] px-8 py-4 rounded-lg text-center w-2/5">
                        <p className="text-2xl">Time Remaining</p>
                        <p className="text-5xl text-white mt-2">05:00 min</p>
                    </div>
                </div>

                <div className="flex flex-col space-y-2 w-1/2 pl-4">
                    <div className='text-xl'>Draft Order:</div>
                    <div className='flex gap-4 flex-wrap'>
                        <div className="bg-[#1C1C1C] flex items-center justify-center text-center border border-[#FF8A00] w-1/6 rounded-lg hover:bg-[#444444]">Turn 1</div>
                        <div className="bg-[#1C1C1C]  flex items-center justify-center text-center p-2 w-1/6 rounded-lg hover:bg-[#444444]">Turn 2</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 3</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 4</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 5</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 5</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 5</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 5</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 5</div>
                        <div className="bg-[#1C1C1C] p-2 w-1/6 rounded-lg flex items-center justify-center text-center hover:bg-[#444444]">Turn 5</div>
                    </div>
                </div>

            </div>

            {/* Main Draft Section */}
            <div className="grid grid-cols-4 gap-8">
                {/* Players - Take up half of the screen */}
                <div className="col-span-2 bg-[#1C1C1C] rounded-3xl p-6 h-[500px]">
                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>Players</h3>
                    <div className="h-[85%] overflow-auto flex flex-col space-y-2">
                        {[...Array(20)].map((_, index) => (
                            <div key={index} className="bg-[#333333] py-3 px-4 rounded-lg">Player {index + 1}</div>
                        ))}
                    </div>
                </div>

                {/* Auto Pick List */}
                <div className="bg-[#1C1C1C] rounded-3xl p-6 h-[500px]">
                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>Auto Pick List</h3>
                    <div className="h-[85%] overflow-auto flex flex-col space-y-2">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="bg-[#333333] py-3 px-4 rounded-lg">Auto Pick {index + 1}</div>
                        ))}
                    </div>
                </div>

                {/* Picks */}
                <div className="bg-[#1C1C1C] rounded-3xl p-6 h-[500px]">
                    <h3 className={`text-2xl font-bold text-[#FF8A00] ${exo2.className} mb-4`}>Picks</h3>
                    <div className="h-[85%] overflow-auto flex flex-col space-y-2">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="bg-[#333333] py-3 px-4 rounded-lg">Pick {index + 1}</div>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Drafting;
