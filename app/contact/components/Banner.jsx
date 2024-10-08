import React from 'react';
import Image from 'next/image';
// <section className={`max-h-[120px] flex justify-between items-center py-10 relative`}>

const Banner = () => {
    return (
        <div className="flex justify-between items-center relative">
            {/* Background Shape */}
            <div className="absolute top-0 left-0 w-full h-full  rounded-lg z-0">
                <Image
                    src="/images/croppedball.svg" // Replace with your actual image path
                    alt="Cropped Ball"
                    width={100}
                    height={100}
                    className="object-contain"
                />
            </div>
            {/* Left Section: Text and Button */}
            <div className="text-white  max-w-[50%] space-y-6 m-auto ml-6 md:ml-10 lg:ml-16 xl:ml-20 z-10">
                <h1 className="text-4xl md:text-5xl font-bold italic text-[#FF8A00]">
                    CONTACT US
                </h1>
                <p className="text-lg">
                    We’d love to hear from you! Whether you have a question, feedback, or just want to say hello,
                    our team is here to assist you. Please fill out the form below, and we’ll get back to you as
                    soon as possible.
                </p>
                {/* <button className="fade-gradient text-white font-bold py-3 px-8 rounded-full">
                    Get In Touch With Us!
                </button> */}
            </div>

            {/* Right Section: Image */}
            <div className="relative w-2/6 md:mt-0">
                {/* Main Image */}
                <Image
                    src="/images/cristiano.svg" // Replace with your actual image path
                    alt="Player Image"
                    width={500}
                    height={500}
                    className="relative z-0 w-full object-contain"
                />
            </div>
        </div>
    );
};

export default Banner;
