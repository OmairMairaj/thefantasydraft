'use client';  // This ensures the page is rendered on the client

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter to use client-side navigation
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(false);
    const router = useRouter(); // Make sure useRouter is called within the client component

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email:', email, 'Password:', password);
        // Simulate successful login and navigate to another page
        router.push('/dashboard'); // Navigate to the dashboard page on success
    };

    return (
        <div className="min-h-[88vh] flex flex-col items-center justify-center mb-[40]">
            <div className="w-1/3 bg-[#0C1922] p-16 rounded-3xl shadow-lg mb-500">
                <h1 className={`text-4xl font-bold italic ${exo2.className}`}>LOGIN</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mt-8 mb-4 space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email*"
                            className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
                            required
                            autocomplete="off"
                        />
                        {/* </div> */}
                        {/* <div> */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password*"
                            className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
                            required
                            autocomplete="off"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-white">
                            <input
                                type="checkbox"
                                checked={stayLoggedIn}
                                onChange={(e) => setStayLoggedIn(e.target.checked)}
                                className="mr-2 ml-1 size-4"
                            />
                            Stay Logged In?
                        </label>
                        <a href="/forgot-password" className="text-orange-500 text-sm hover:underline">Forgot Password?</a>
                    </div>
                    <button
                        type="submit"
                        className={`w-full mt-8 py-3 bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] rounded-full text-white font-bold text-lg hover:bg-orange-600 transition-all ${exo2.className}`}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}