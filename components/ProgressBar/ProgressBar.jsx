import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className="w-auto bg-gray-300 rounded-full mx-20 h-3 mb-8 mt-8 shadow-lg shadow-inner shadow-black">
            <div
                className="bg-[#FF8A00] h-3 rounded-full transition-all duration-1000 ease-out shadow-md shadow-inner shadow-black"
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
