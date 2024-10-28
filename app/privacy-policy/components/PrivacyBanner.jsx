import React from 'react'
import Image from 'next/image'
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic', 'normal'],
    subsets: ['latin'],
});


const PrivacyBanner = () => {
    return (
        <section className="w-full h-[40vw] sm:h-[400px] md:h-[500px] lg:h-[540px] flex items-center justify-center bg-[url('/images/terms-banner.svg')] bg-contain md:bg-contain bg-center bg-no-repeat">
            <h1 className={`text-2xl sm:text-4xl md:text-5xl font-bold italic text-[#FF8A00] z-10 ${exo2.className}`}>
                Privacy Policy
            </h1>
        </section>
    )
}

export default PrivacyBanner