import React from 'react'
import Image from 'next/image'
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic', 'normal'],
    subsets: ['latin'],
});

const TermsBanner = () => {
    return (
        <section className="w-full h-[540px] flex items-center justify-center bg-[url('/images/terms-banner.svg')] bg-contain bg-center bg-no-repeat">
            {/* Adjusted margin-top for the section to create space below the navbar */}

            <h1 className={`text-4xl md:text-5xl font-bold italic text-[#FF8A00] z-10 ${exo2.className}`}>Terms & Conditions</h1>
            {/* <Image
                    src="/images/terms-banner.svg" // Replace with your actual image path
                    alt="Player Image"
                    width={1600}
                    height={500} // Cover the section fully
                    objectFit="cover" // Adjust the image to cover the space without distortion
                    className="absolute z-0 w-full"
                /> */}

        </section>
    )
}

export default TermsBanner
