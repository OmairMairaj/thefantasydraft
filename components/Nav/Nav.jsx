'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Nav = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="flex justify-between items-center border-b border-white py-4">
            {/* Logo */}
            <div className="flex space-x-5 items-center">
                <Link href="/">
                    <Image
                        src="/images/logo.svg"
                        width={100}
                        height={100}
                        className="object-cover cursor-pointer"
                        alt="The Fantasy Draft Logo"
                    />
                </Link>
            </div>

            {/* Hamburger Icon for Mobile */}
            <div className="md:hidden">
                <button
                    className="text-white focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                        ></path>
                    </svg>
                </button>
            </div>

            {/* Nav Links (Hidden on Mobile, Shown in Hamburger Menu) */}
            <div className={`md:flex ${menuOpen ? 'block' : 'hidden'} md:space-x-6`}>
                <a href="/" className="hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer">
                    HOME
                </a>
                <a href="/how-to-play" className="hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer">
                    HOW TO PLAY
                </a>
                <a href="/contact" className="hover:text-[#FF8A00] text-xs md:text-base lg:text-lg cursor-pointer">
                    CONTACT US
                </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex space-x-2">
                <a href="/signup" className="button relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border-2 hover:bg-[#FF8A00] cursor-pointer">
                    SIGN UP
                </a>
                <a href="/login" className="button relative px-6 md:px-8 lg:px-12 py-2 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border-2 hover:bg-[#FF8A00] cursor-pointer">
                    LOGIN
                </a>
            </div>
        </nav>
    );
};

export default Nav;
