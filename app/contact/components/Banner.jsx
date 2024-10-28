import React from 'react';
import Image from 'next/image';

const Banner = () => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center relative  md:px-10 lg:px-16">
            {/* Background Shape */}
            <div className="md:flex absolute top-0 left-0 rounded-lg z-0">
                <Image
                    src="/images/croppedball.svg" // Replace with your actual image path
                    alt="Cropped Ball"
                    width={100}
                    height={100}
                    className="object-contain w-16 h-16 md:w-24 md:h-24"
                />
            </div>
            {/* Left Section: Text and Button */}
            <div className="text-white p-10 max-w-full md:max-w-[50%] space-y-6 m-auto z-10 text-center md:text-left ">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold italic text-[#FF8A00]">
                    CONTACT US
                </h1>
                <p className="text-base md:text-lg lg:text-xl">
                    We’d love to hear from you! Whether you have a question, feedback, or just want to say hello,
                    our team is here to assist you. Please fill out the form below, and we’ll get back to you as
                    soon as possible.
                </p>
            </div>

            {/* Right Section: Image */}
            <div className="relative w-full md:w-2/6 md:mt-0 ">
                {/* Main Image */}
                <Image
                    src="/images/cristiano.svg" // Replace with your actual image path
                    alt="Player Image"
                    width={500}
                    height={500}
                    className="relative z-0 w-full object-contain max-h-96 md:max-h-min"
                />
            </div>
        </div>
    );
};

export default Banner;
