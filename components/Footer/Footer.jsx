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
        <footer className="footer bg-[url('/images/Ellipse.svg')] bg-cover bg-center bg-no-repeat text-white py-4 m-auto px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20">
            <div className="flex flex-col sm:flex-row sm:justify-between md:items-center sm:space-y-1">
                {/* Left side - Logo */}
                <div className="flex md:justify-start  items-center">
                    <Image
                        src="/images/logo2.svg"
                        width={100}
                        height={100}
                        className="object-cover cursor-pointer w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28"
                        alt="The Fantasy Draft Logo"
                    />
                    <h1 className={`sm:hidden text-lg lg:text-4xl xl:text-6xl font-bold leading-tight ml-2 text-white italic ${exo2.className}`}>
                        THE <span className="text-[#FF8A00]">FANTASY</span> <br disabled />DRAFT
                    </h1>
                </div>

                {/* Center - Navigation Links */}
                <div className="footer-links grid grid-cols-2 gap-x-2 md:gap-x-8 lg:gap-x-2 gap-y-1 lg:flex lg:space-x-8 text-white lg:text-center text-sm sm:text-base xl:text-lg mt-4">
                    <a href="/" className={`hover:text-[#FF8A00] ${exo2.className}`}>Home</a>
                    <a href="/how-to-play" className={`hover:text-[#FF8A00] ${exo2.className}`}>How To Play</a>
                    <a href="/contact" className={`hover:text-[#FF8A00] ${exo2.className}`}>Contact</a>
                    <a href="/terms-and-conditions" className={`hover:text-[#FF8A00] ${exo2.className}`}>Terms & Condition</a>
                    <a href="/privacy-policy" className={`hover:text-[#FF8A00] ${exo2.className}`}>Privacy Policy</a>
                </div>

                {/* Right side - Social media links */}
                <div className="footer-right flex sm:flex-wrap xl:flex-nowrap sm:w-24 xl:w-auto sm:min-h-20 md:w-28 justify-center lg:justify-end items-center mt-8">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Facebook.svg" alt="Facebook" width={20} height={20} className="w-6 h-6 xl:w-8 xl:h-8 mx-2 lg:mx-4" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Twitter.svg" alt="Twitter" width={20} height={20} className="w-6 h-6 xl:w-8 xl:h-8 mx-2 lg:mx-4" />
                    </a>
                    <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Vimeo.svg" alt="Vimeo" width={20} height={20} className="w-6 h-6 xl:w-8 xl:h-8 mx-2 lg:mx-4" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
                        <Image src="/images/Youtube.svg" alt="YouTube" width={20} height={20} className="w-6 h-6 xl:w-8 xl:h-8 mx-2 lg:mx-4" />
                    </a>
                </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-gray-500 my-4"></div>

            {/* Copyright section */}
            <div className={`text-center text-white ${exo2.className}`}>
                <p className="text-xs sm:text-sm md:text-base">&copy; {new Date().getFullYear()} All rights reserved</p>
            </div>
        </footer>
    );
};

export default Footer;
