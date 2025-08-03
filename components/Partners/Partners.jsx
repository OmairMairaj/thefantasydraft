import React from 'react';
import Image from 'next/image';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Partners = () => {
    const partners = [
        { name: 'Bundesliga', logo: '/images/bundesliga-logo.svg' },
        { name: 'MLS', logo: '/images/mls-logo.svg' },
        { name: 'Serie A', logo: '/images/seriea-logo.png' },
        { name: 'WSL', logo: '/images/wsl-logo.svg' },
        { name: 'La Liga', logo: '/images/laliga-logo.svg' },
    ];

    return (
        <section className="partners-section py-16">
            <div className="text-center">
                {/* Title */}
                <h2 className={`text-3xl md:text-5xl font-bold italic mb-8 ${exo2.className}`}>
                    PARTNERS
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {partners.map((partner, index) => (
                        <div
                            key={index}
                            className="flex justify-center items-center p-4 bg-[#0C1922] rounded-lg shadow-lg"
                        >
                            <Image
                                src={partner.logo}
                                alt={partner.name}
                                width={120}
                                height={120}
                                // layout="fixed"
                                className="object-contain h-[80px] w-[120px]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Partners;
