'use client';

import React from 'react';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Confirmation = ({ onComplete, onBack }) => {
    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
            <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
                <h1 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 3: Confirm Joining
                </h1>
                <p className='my-4'>
                    Confirm that you are ready to join the league with your team.
                </p>
                <div className='flex space-x-8 mt-8'>
                    <button
                        onClick={onComplete}
                        className={`fade-gradient py-4 px-20 rounded-full text-white font-bold text-lg transition-all ease-in-out mt-6 ${exo2.className}`}
                    >
                        CONFIRM AND JOIN LEAGUE
                    </button>
                    <button
                        onClick={onBack}
                        className={`fade-gradient py-4 px-20 rounded-full text-white font-bold text-lg transition-all ease-in-out mt-6 ${exo2.className}`}
                    >
                        BACK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;
