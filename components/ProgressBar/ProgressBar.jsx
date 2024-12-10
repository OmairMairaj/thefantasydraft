import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className="w-auto bg-gray-300 rounded-full h-3 mb-8 mt-8 shadow-inner shadow-black m-auto mx-4 sm:mx-8 md:mx-10 lg:mx-16 xl:mx-20">
            <div
                className="bg-[#FF8A00] h-3 rounded-full transition-all duration-1000 ease-out shadow-inner shadow-black"
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
