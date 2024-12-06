import React, { useEffect, useState } from 'react';

const CircularProgress = ({ percentage }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate the progress when component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPercentage((prev) => {
        if (prev >= percentage) {
          clearInterval(interval);
          return percentage;
        }
        return prev + 1;
      });
    }, 10);
  }, [percentage]);

  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg
        className="w-full h-full"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#373737"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#FF8A00"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 2s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
        {animatedPercentage}%
      </div>
    </div>
  );
};

export default CircularProgress;
