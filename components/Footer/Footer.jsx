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
        <footer className="footer bg-[url('/images/Ellipse.svg')] bg-cover bg-center bg-no-repeat text-white pt-16 pb-4">
            <div className="flex justify-between items-center">
                {/* Left side - Logo */}
                <div className="flex items-center">
                    <Image
                        src="/images/logo.png" // Your logo path
                        width={100}
                        height={100}
                        alt="Logo"
                    />
                </div>

                {/* Center - Navigation Links */}
                <div className="footer-links flex space-x-8 text-white">
                    <a href="/" className={`hover:text-[#FF8A00] ${exo2.className}`}>Home</a>
                    <a href="/how-to-play" className={`hover:text-[#FF8A00] ${exo2.className}`}>How To Play</a>
                    <a href="/contact" className={`hover:text-[#FF8A00] ${exo2.className}`}>Contact</a>
                    <a href="/terms-and-conditions" className={`hover:text-[#FF8A00] ${exo2.className}`}>Terms & Condition</a>
                    <a href="/privacy-policy" className={`hover:text-[#FF8A00] ${exo2.className}`}>Privacy Policy</a>
                </div>

                {/* Right side - Social media links */}
                <div className="footer-right flex space-x-10">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-150 transition-transform duration-200">
                        <Image src="/images/Facebook.svg" alt="Facebook" width={24} height={24} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-150 transition-transform duration-200">
                        <Image src="/images/Twitter.svg" alt="Twitter" width={24} height={24} />
                    </a>
                    <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="hover:scale-150 transition-transform duration-200">
                        <Image src="/images/Vimeo.svg" alt="Vimeo" width={24} height={24} />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:scale-150 transition-transform duration-200">
                        <Image src="/images/Youtube.svg" alt="YouTube" width={24} height={24} />
                    </a>
                </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-gray-500 my-4"></div>

            {/* Copyright section */}
            <div className={`text-center text-white ${exo2.className}`}>
                <p className="text-white">&copy; {new Date().getFullYear()} All rights reserved</p>
            </div>
            {/* <Image
                src="/images/Ellipse.svg" // Your logo path
                width={1000}
                height={300}
                alt="Logo"
                className='footer-gradient'
            /> */}
        </footer>
    );
};

export default Footer;
