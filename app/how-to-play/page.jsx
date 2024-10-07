'use client';
import React, { useRef } from 'react';
import HeroSection from './components/HeroSection';
import ContentSection from './components/ContentSection';

const HowToPlay = () => {
    const contentRef = useRef(null); // Create a ref for the ContentSection

    // Function to handle smooth scrolling to the content section
    const scrollToContent = () => {
        if (contentRef.current) {
            contentRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <HeroSection scrollToContent={scrollToContent} /> {/* Pass scrollToContent to HeroSection */}
            <div ref={contentRef}>
                <ContentSection />
            </div>
        </>
    );
};

export default HowToPlay;
