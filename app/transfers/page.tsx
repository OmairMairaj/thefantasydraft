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
import { motion, AnimatePresence } from "framer-motion";

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Transfers = () => {
    const [activeTab, setActiveTab] = useState('Make Transfer');


    return (
        <div className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            <h1 className={`text-2xl xl:text-3xl font-bold mb-4 ${exo2.className}`}>Transfers</h1>

            {/* Tabs */}
            <div className='flex gap-1 mb-4'>
                {['Make Transfer', 'Offers', 'History'].map((tab, idx) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={` ${activeTab === tab ? "bg-[#ff8800b7]" : "bg-[#1d374a] hover:bg-[#244258]"} px-4 lg:px-6 xl:px-8 py-1 text-sm xl:text-base ${idx === 0 ? "rounded-l-lg" : idx === 2 ? "rounded-r-lg" : ""} `}>{tab}</button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'Make Transfer' && (
                    <motion.div
                        key="transfer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Transfer />
                    </motion.div>
                )}

                {activeTab === 'Offers' && (
                    <motion.div
                        key="offers"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Offers />
                    </motion.div>
                )}

                {activeTab === 'History' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <History />
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default Transfers;
