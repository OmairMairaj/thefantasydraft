// app/transfers/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Exo_2 } from 'next/font/google';
import { FaExchangeAlt, FaUserPlus, FaUserMinus, FaClipboard, FaChevronDown } from 'react-icons/fa';
import { MdOutlineCompareArrows } from 'react-icons/md';
import { useAlert } from '@/components/AlertContext/AlertContext';
import Transfer from './components/Transfer';
import History from './components/History';
import Offers from './components/Offers';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Transfers = () => {
    const [activeTab, setActiveTab] = useState('Make Transfer');


    return (
        <div className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            <h1 className={`text-4xl font-bold mb-4 ${exo2.className}`}>Transfers</h1>

            {/* Tabs */}
            <div className='flex gap-2 mb-4'>
                {['Make Transfer', 'Offers', 'History'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={` ${activeTab === tab ? "bg-[#FF8A00]" : "bg-[#2c2c2c] hover:bg-[#3a3a3a]"} px-8 py-1 rounded-lg`}>{tab}</button>
                ))}
            </div>

            {activeTab === 'Make Transfer' &&
                <Transfer />
            }
			{activeTab === 'History' &&
                <History />
            }
			{activeTab === 'Offers' &&
                <Offers />
            }


        </div>
    );
};

export default Transfers;
