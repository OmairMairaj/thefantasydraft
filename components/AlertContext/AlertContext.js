'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCircleExclamation } from "react-icons/fa6";
import { FaCircleInfo } from "react-icons/fa6";
import { FaRegCheckCircle } from "react-icons/fa";

// Create the alert context
const AlertContext = createContext();

// Alert Provider Component
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    let alertCounter = 0; // Simple counter for unique alert ids

    // Function to add an alert
    const addAlert = (message, type, duration = 8000) => {
        alertCounter += 1;
        const alertId = alertCounter;

        setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: alertId, message, type, duration },
        ]);

        // Set timeout to remove the alert after the specified duration
        setTimeout(() => {
            removeAlert(alertId);
        }, duration);
    };

    // Function to remove an alert by ID
    const removeAlert = (id) => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    };

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
            <CustomAlert alerts={alerts} />
        </AlertContext.Provider>
    );
};

// Custom hook to use the alert context
export const useAlert = () => {
    return useContext(AlertContext);
};

// Custom Alert Component to Display Alerts
const CustomAlert = ({ alerts }) => {
    // Detect screen size to apply specific classes
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Update screen size state on window resize
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 640); // Mobile screen is defined as width <= 640px
        };

        handleResize(); // Initial call to set the correct state

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`fixed ${isMobile ? 'bottom-4 left-0 w-full px-[5%] flex justify-center' : 'bottom-10 right-4 space-y-4'} z-50`}>
            {alerts.map((alert, index) => (
                <div
                    key={alert.id}
                    className={`flex items-center p-4 px-8 max-w-full sm:max-w-sm w-auto rounded-xl shadow-lg transition-transform transform text-white fade-gradient-no-hover alert-slide-in`}
                    style={{
                        animation: isMobile
                            ? `slideUp 0.5s ease-out, fadeOut 1s ease-in ${alert.duration / 1000 - 1}s forwards` // For mobile, slide up and fade out
                            : `slideIn 0.5s ease-out, fadeOut 1s ease-in ${alert.duration / 1000 - 1}s forwards`, // For desktop, slide in from the right
                        bottom: `${isMobile ? '0' : `${index * 70}px`}` // Adjust spacing for stacked alerts
                    }}
                >
                    <div className="flex">
                        {alert.type === 'error' && (
                            <span className="mr-2">
                                <FaCircleExclamation size={20} color="#FF6347" /> {/* Error - Tomato Red */}
                            </span>
                        )}
                        {alert.type === 'success' && (
                            <span className="mr-2">
                                <FaRegCheckCircle size={20} color="#44b14d" /> {/* Success - Green */}
                            </span>
                        )}
                        {alert.type === 'info' && (
                            <span className="mr-2">
                                <FaCircleInfo size={20} color="#1E90FF" /> {/* Info - Dodger Blue */}
                            </span>
                        )}
                        <span>{alert.message}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CustomAlert;
