'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(false);
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Logic to register the user (you can call an API here)
        console.log('Name:', name, 'Email:', email, 'Password:', password, 'Stay Logged In:', stayLoggedIn);
        // On success, redirect to the dashboard or another page
        router.push('/dashboard');
    };


    return (
        <div className='min-h-[67vh] flex flex-col items-center pt-[100px]'>
            <div className='w-2/5 bg-[#0C1922] p-16 rounded-3xl shadow-lg mb-500"'>
                <h1 className={`text-4xl font-bold italic ${exo2.className}`}>SIGN UP</h1>
                <form onSubmit={handleSubmit} className='mt-8'>
                    <div className='w-full mb-4 flex justify-between space-x-4 '>
                        <div className='w-1/2'>
                            <input type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name*"
                                className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                                required
                            />
                        </div>
                        <div className='w-1/2'>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name*"
                                className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                                required
                                autocomplete="off"
                            />
                        </div>
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email*"
                        className="w-full p-3 mb-4 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                        required
                        autocomplete="off"
                    />
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password*"
                            className="w-full mb-4 p-3 text-white bg-[#0C1922] border border-[#30363D] rounded-lg focus:outline-none focus:border-orange-500"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password*"
                            className="w-full mb-4 p-3 text-white bg-[#0C1922] border border-[#30363D] rounded-lg focus:outline-none focus:border-orange-500"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-white">
                            <input
                                type="checkbox"
                                checked={stayLoggedIn}
                                onChange={(e) => setStayLoggedIn(e.target.checked)}
                                className="mr-2"
                            />
                            Stay Logged In?
                        </label>
                        <a href="#" className="text-orange-500 text-sm hover:underline">Forgot Password?</a>
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-8 py-3 bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] rounded-full text-white font-bold text-lg hover:bg-orange-600 transition-all"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SignUp