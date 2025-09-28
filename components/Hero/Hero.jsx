import React from 'react';
import Image from 'next/image';
import bannerImage from '../../public/images/banner-image4.png'; // Path to your SVG image
import { Exo_2 } from 'next/font/google';
import Link from 'next/link';

const exo2 = Exo_2({
    weight: ['400', '600', '700', '800'], // Weights that you need
    style: ['normal', 'italic'],
    subsets: ['latin'],
});

const Hero = () => {
    return (
        <section className="hero-section relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">


                {/* Left Content - Headline and Text */}
                <div className="text-content py-10 md:py-40 w-full md:w-1/2 text-center md:text-left">
                    <h1 className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 text-white italic ${exo2.className}`}>
                        FANTASY FOOTBALL, <br />
                        BUT <span className="text-[#FF8A00]">BETTER</span>
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg 2xl:text-xl mb-8">
                        Do you love fantasy football, but you're bored of everyone having the same teams? Welcome to Fantasy football drafting. Play with unique squads in an enthralling head to head style competition to crown the true champion of fantasy football.
                    </p>
                    <Link href="/signup" className={`fade-gradient px-6 md:px-8 lg:px-12 pt-2 pb-3 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg cursor-pointer ${exo2.className}`}>
                        START PLAYING <span className="ml-2 text-2xl">»</span>
                    </Link>
                </div>

                {/* Right Content - Image */}
                <div className="image-content relative w-full md:w-1/2">
                    <Image
                        src={bannerImage}
                        alt="Fantasy Football Players"
                        // layout="responsive"
                        width={1000}
                        height={1000}
                        className="z-10 object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
