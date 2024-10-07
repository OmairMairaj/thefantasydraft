import React from 'react';
import Image from 'next/image';
import bannerImage from '../../public/images/banner-image.svg'; // Path to your SVG image
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '600', '700', '800'], // Weights that you need
    style: ['normal', 'italic'],
    subsets: ['latin'],
});

const Hero = () => {
    return (
        <section className="hero-section relative overflow-hidden">
            <div className=" md:flex md:items-center md:justify-between">
                {/* Left Content - Headline and Text */}
                <div className="text-content py-40 w-1/2">
                    <h1 className={`text-4xl lg:text-4xl xl:text-6xl font-bold leading-tight mb-4 text-white italic ${exo2.className}`}>
                        FANTASY FOOTBALL, <br />
                        BUT <span className="text-[#FF8A00]">BETTER</span>
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg 2xl:text-xl mb-8">
                        Do you love fantasy football, but you're bored of everyone having the same teams? Welcome to Fantasy football drafting. Play with unique squads in an enthralling head to head style competition to crown the true champion of fantasy football.
                    </p>
                    <a href="/signup" className={`fade-gradient relative italic px-6 md:px-8 lg:px-12 py-4 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className}`}>
                        START PLAYING <span className="ml-2 text-2xl">»</span>
                    </a>
                </div>

                {/* Right Content - Image */}
                <div className="image-content relative w-1/2">
                    <Image
                        src={bannerImage}
                        alt="Fantasy Football Players"
                        layout="responsive"
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
