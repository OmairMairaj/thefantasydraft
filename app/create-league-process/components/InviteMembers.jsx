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

    // Handle adding an email
    const handleAddEmail = () => {
        if (emailInput && !emails.includes(emailInput)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput)) {
                setEmails([...emails, emailInput]);
                setEmailInput('');
                setEmailError('');
            } else {
                setEmailError("Please enter a valid email address.");
            }
        }
    };

    // Handle deleting an email
    const handleDeleteEmail = (emailToDelete) => {
        setEmails(emails.filter(email => email !== emailToDelete));
    };

    // Save invite data to session storage whenever emails state changes
    useEffect(() => {
        sessionStorage.setItem('inviteData', JSON.stringify({ emails }));
    }, [emails]);

    // Handle form submission
    const handleSubmit = () => {
        sessionStorage.setItem('inviteData', JSON.stringify({ emails }));
        onNext();  // Move to next step
    };

    return (
        <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8">
            <div className="w-full relative rounded-3xl shadow-lg px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
                <h1 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>
                    Step 3 : Invite Members
                </h1>
                <p className='my-4 w-2/3'>
                    Enter the email addresses of your friends or league participants that you'd like to invite to join your league.
                </p>

                <div className='mt-8 space-y-4 min-h-24'>
                    {/* Input for adding email */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full max-w-md px-4 py-2 rounded-lg bg-[#0e0e0e] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white"
                        />
                        <button
                            onClick={handleAddEmail}
                            className="px-16 py-2 rounded-full text-white font-bold fade-gradient transition-all ease-in-out"
                        >
                            Add
                        </button>
                    </div>
                    {emailError && <p className="text-red-500">{emailError}</p>}

                    {/* Display added emails */}
                    <div className="space-y-2 mt-4">
                        {emails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between w-full max-w-md px-4 py-2 rounded-lg bg-[#030409] border border-[#373737] text-white">
                                <span>{email}</span>
                                <button onClick={() => handleDeleteEmail(email)} className="text-[#ff8800] font-bold">
                                    <FaTrash size={26} style={{ padding: '4px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-16 ">
                    <button
                        onClick={onBack}
                        className={`fade-gradient py-4 px-20 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
                    >
                        BACK : Create Team
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`fade-gradient py-4 px-20 rounded-full text-white font-bold text-lg transition-all ease-in-out ${exo2.className}`}
                    >
                        NEXT : Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMembers;
