'use client';

import React, { useState } from 'react';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const ContactForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const [errors, setErrors] = useState({});

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Form validation
    const validateForm = () => {
        let errors = {};

        if (!formData.firstName) {
            errors.firstName = 'First Name is required';
        }

        if (!formData.lastName) {
            errors.lastName = 'Last Name is required';
        }

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email address is invalid';
        }

        if (!formData.phone) {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            errors.phone = 'Phone number is invalid';
        }

        if (!formData.message) {
            errors.message = 'Message is required';
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            // Submit the form (e.g., call an API)
            console.log('Form data:', formData);

            // Reset form data
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                message: ''
            });
            alert('Message sent successfully!');
        }
    };

    return (
        <div className="my-20 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16">
            <div className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl bg-[#0C1922] p-8 sm:p-12 md:p-16 rounded-3xl shadow-lg flex flex-col md:flex-row shadow-black justify-between space-y-8 md:space-y-0 md:space-x-8">
                {/* Form Section */}
                <div className="w-full md:w-3/5">
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF8A00] mb-6 sm:mb-8 italic ${exo2.className}`}>
                        CONTACT FORM
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="First Name*"
                                className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                                required
                                autoFocus
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Last Name*"
                                className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                                required
                            />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email*"
                            className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Phone*"
                            className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                            required
                        />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Your message..."
                            className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                            rows="5"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className={`w-full mt-4 py-3 rounded-full text-white font-bold text-base sm:text-lg transition-all bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] cursor-pointer hover:bg-[#FF8A00] italic ${exo2.className}`}
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Details Section */}
                <div className={`w-full md:w-2/5 bg-[#0C1922] italic ${exo2.className}`}>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF8A00] mb-6 sm:mb-8 italic ${exo2.className}`}>
                        CONTACT DETAILS
                    </h2>
                    <div className="mb-6">
                        <h2 className="text-lg md:text-xl mb-1 font-bold text-white">Address:</h2>
                        <p className="text-sm md:text-base">House ABC Area 123 North Carolina, 81W567</p>
                    </div>
                    <div className="mb-6">
                        <h2 className="text-lg md:text-xl mb-1 font-bold text-white">Email:</h2>
                        <p className="text-sm md:text-base">
                            <a href="mailto:support@draft.com" className="hover:underline hover:text-[#FF8A00]">
                                support@draft.com
                            </a>
                        </p>
                    </div>
                    <div className="mb-6">
                        <h2 className="text-lg md:text-xl mb-1 font-bold text-white">Phone:</h2>
                        <p className="text-sm md:text-base">
                            <a href="tel:+1201123456" className="hover:underline hover:text-[#FF8A00]">
                                +1 (201) 123 456
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
