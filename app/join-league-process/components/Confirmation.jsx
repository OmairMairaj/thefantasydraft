'use client';

import React from 'react';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Confirmation = ({ onComplete, onBack, loading }) => {
    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
            <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
                <h1 className={`text-2xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 3: Confirm Joining
                </h1>
                <p className='my-4 text-sm md:text-base'>
                    Confirm that you are ready to join the league with your team.
                </p>
                <div className='flex space-x-8 mt-8'>

                    <button
                        onClick={onBack}
                        className={`py-2 px-8 md:py-3 md:px-12 flex items-center rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] text-sm md:text-lg ${exo2.className}`}
                    >
                        BACK
                    </button>
                    <button
                        onClick={onComplete}
                        disabled={loading}
                        className={`py-2 px-8 md:py-3 md:px-12 gap-2 flex items-center rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] text-sm md:text-lg ${exo2.className}
                        ${loading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                    >
                        {loading ? "JOINING..." : "CONFIRM"}
                        <span className="hidden sm:inline">{loading ? "" : "AND JOIN LEAGUE"}</span>
                    </button>
                </div>
            </div>
        </div >
    );
};

export default Confirmation;
