'use client';

import React, { useState, useEffect } from 'react';
import { Exo_2 } from 'next/font/google';
import { FaTrash } from 'react-icons/fa';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const InviteMembers = ({ onNext, onBack }) => {
    const savedInviteData = JSON.parse(sessionStorage.getItem('inviteData')) || { emails: [] };
    const [emails, setEmails] = useState(savedInviteData.emails || []);
    const [emailInput, setEmailInput] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleAddEmail = () => {
        if (emailInput && !emails.includes(emailInput)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput)) {
                setEmails([...emails, emailInput]);
                setEmailInput('');
                setEmailError('');
            } else {
                setEmailError('Please enter a valid email address.');
            }
        }
    };

    const handleDeleteEmail = (emailToDelete) => {
        setEmails(emails.filter(email => email !== emailToDelete));
    };

    useEffect(() => {
        sessionStorage.setItem('inviteData', JSON.stringify({ emails }));
    }, [emails]);

    const handleSubmit = () => {
        sessionStorage.setItem('inviteData', JSON.stringify({ emails }));
        onNext(); // Move to next step
    };

    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8 px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-24">
            <div className="w-full relative">
                <h1 className={`text-2xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 3: Invite Members
                </h1>
                <p className="my-4 text-sm md:text-base lg:text-lg max-w-3xl">
                    Enter the email addresses of your friends or league participants that you'd like to invite to join your league.
                </p>

                <div className="mt-8 space-y-4">
                    {/* Input for adding email */}
                    <div className="flex flex-row items-center space-x-2 sm:space-x-4">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full max-w-sm md:w-2/3 px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
                        />
                        <button
                            onClick={handleAddEmail}
                            className="px-6 sm:px-16 py-2 rounded-full text-white font-bold fade-gradient transition-all ease-in-out text-sm md:text-base"
                        >
                            Add
                        </button>
                    </div>
                    {emailError && <p className="text-red-500 text-sm md:text-base">{emailError}</p>}

                    {/* Display added emails */}
                    <div className="space-y-2 mt-4">
                        {emails.map((email, index) => (
                            <div
                                key={index}
                                className="flex max-w-sm items-center justify-between px-4 py-2 rounded-lg bg-[#030409] border border-[#373737] text-white text-sm md:text-base"
                            >
                                <span className="truncate">{email}</span>
                                <button
                                    onClick={() => handleDeleteEmail(email)}
                                    className="text-[#ff8800] font-bold hover:text-red-500"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-16">
                    <button
                        onClick={onBack}
                        className={`py-2 px-8 md:py-3 md:px-12 flex items-center rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] text-sm md:text-lg ${exo2.className}`}
                    >
                        BACK<span className="hidden sm:inline">: Create Team</span>
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`py-2 px-8 md:py-3 md:px-12 flex items-center rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] text-sm md:text-lg ${exo2.className}`}
                    >
                        NEXT<span className="hidden sm:inline">: Confirm</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMembers;
