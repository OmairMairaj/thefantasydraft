import React from 'react';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';
import Link from 'next/link';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

export default function Intro() {
    return (
        <section className="intro-section py-8 sm:py-12 md:py-16">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
                {/* Right Content - Image */}
                <div className="w-full md:w-1/2">
                    <Image
                        src="/images/intro-image.svg"  // Replace with the correct path to your image
                        alt="Introduction Image"
                        width={1200}
                        height={700}
                        className="rounded-xl object-cover"
                    />
                </div>

                {/* Left Content */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <h2 className={`text-2xl sm:text-3xl md:text-5xl font-bold italic mb-4 ${exo2.className}`}>
                        Welcome to Fantasy Football Drafting
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl mb-4">
                        Our platform allows you to experience fantasy football in a whole new way. Draft unique squads and compete head-to-head with friends or players around the world. Build your team, make strategic decisions, and enjoy the most exhilarating fantasy football experience. With innovative features and real-time performance tracking, you'll always stay in control.
                    </p>
                    <p className="text-base sm:text-lg md:text-xl mb-6">
                        Join the community today and become the true champion of fantasy football!
                    </p>
                    <Link href="/how-to-play" className={`fade-gradient px-4 sm:px-6 md:px-8 lg:px-12 pt-2 pb-3 rounded-full text-white text-center font-bold text-sm md:text-base lg:text-lg cursor-pointer ${exo2.className}`}>
                        Learn How to Play <span className="ml-2 text-xl md:text-2xl">»</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
