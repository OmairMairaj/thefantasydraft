import React from 'react'
import { Exo_2 } from 'next/font/google';


const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const LeagueSettings = () => {
    return (
        <div className="min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10">
            <h1 className={`text-4xl font-bold ${exo2.className}`}>League Settings</h1>
            <div className='grid grid-cols-3 gap-8 mt-10'>
                <div className='bg-[#32323226] rounded-xl shadow-lg p-6 flex flex-col space-y-4'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>LEAGUE</h2>
                    <p className='text-gray-400'>Edit your league's name and description.</p>
                    <div className='flex flex-col space-y-4'>
                        <input
                            type='text'
                            placeholder='League Name'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                        <textarea
                            placeholder='League Description'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                    </div>
                </div>
                <div className='bg-[#1C1C1C] rounded-xl shadow-lg p-6 flex flex-col space-y-4'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>League Info</h2>
                    <p className='text-gray-400'>Edit your league's name and description.</p>
                    <div className='flex flex-col space-y-4'>
                        <input
                            type='text'
                            placeholder='League Name'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                        <textarea
                            placeholder='League Description'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                    </div>
                </div>
                <div className='bg-[#1C1C1C] rounded-xl shadow-lg p-6 flex flex-col space-y-4'>
                    <h2 className={`text-2xl font-bold ${exo2.className}`}>TEAM</h2>
                    <p className='text-gray-400'>Edit your league's name and description.</p>
                    <div className='flex flex-col space-y-4'>
                        <input
                            type='text'
                            placeholder='League Name'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                        <textarea
                            placeholder='League Description'
                            className='bg-[#333333] px-4 py-3 rounded-lg text-white focus:outline-none focus:border-[#FF8A00] border border-[#333333]'
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default LeagueSettings