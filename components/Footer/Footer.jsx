import React from 'react';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Footer = () => {
    return (
        <footer className="footer bg-[url('/images/Ellipse.svg')] bg-cover bg-center bg-no-repeat text-white py-4 px-4 md:px-10 lg:px-20">
            <div className="flex flex-col sm:flex-row sm:justify-between md:items-center space-y-4 sm:space-y-1">
                {/* Left side - Logo */}
                <div className="flex md:justify-start px-4 md:px-0 items-center">
                    <Image
                        src="/images/logo.png" // Your logo path
                        width={60}
                        height={60}
                        alt="Logo"
                        className="w-16 h-16 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28"
                    />
                    <h1 className={`sm:hidden text-lg lg:text-4xl xl:text-6xl font-bold leading-tight ml-2 text-white italic ${exo2.className}`}>
                        THE <span className="text-[#FF8A00]">FANTASY</span> <br disabled />DRAFT
                    </h1>
                </div>

                {/* Center - Navigation Links */}
                <div className="footer-links px-6 grid grid-cols-2 gap-x-2 gap-y-4 md:flex md:space-x-6 lg:space-x-8 text-white md:text-center text-sm sm:text-base md:text-lg">
                    <a href="/" className={`hover:text-[#FF8A00] ${exo2.className}`}>Home</a>
                    <a href="/how-to-play" className={`hover:text-[#FF8A00] ${exo2.className}`}>How To Play</a>
                    <a href="/contact" className={`hover:text-[#FF8A00] ${exo2.className}`}>Contact</a>
                    <a href="/terms-and-conditions" className={`hover:text-[#FF8A00] ${exo2.className}`}>Terms & Condition</a>
                    <a href="/privacy-policy" className={`hover:text-[#FF8A00] ${exo2.className}`}>Privacy Policy</a>
                </div>

                {/* Right side - Social media links */}
                <div className="footer-right flex justify-center md:justify-end items-center space-x-6">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Facebook.svg" alt="Facebook" width={20} height={20} className="w-6 h-6 md:w-8 md:h-8" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Twitter.svg" alt="Twitter" width={20} height={20} className="w-6 h-6 md:w-8 md:h-8" />
                    </a>
                    <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Vimeo.svg" alt="Vimeo" width={20} height={20} className="w-6 h-6 md:w-8 md:h-8" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Youtube.svg" alt="YouTube" width={20} height={20} className="w-6 h-6 md:w-8 md:h-8" />
                    </a>
                </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-gray-500 my-8"></div>

            {/* Copyright section */}
            <div className={`text-center text-white ${exo2.className}`}>
                <p className="text-xs sm:text-sm md:text-base">&copy; {new Date().getFullYear()} All rights reserved</p>
            </div>
        </footer>
    );
};

export default Footer;
