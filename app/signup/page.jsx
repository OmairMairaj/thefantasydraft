"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Exo_2 } from "next/font/google";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import axios from "axios";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password field
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("You must agree to the Terms & Conditions");
      return;
    }
    // Logic to register the user (you can call an API here)
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/signup";
    console.log(URL);
    const body = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      confirm_password: confirmPassword,
    };
    console.log(body);
    axios
      .post(URL, body)
      .then((res) => {
        console.log(res);
        alert(res.data.message);
        if (!res.data.error) {
        }
      })
      .catch((err) => {
        console.log(err);
        alert("An unexpected error occurred. Please try again later");
      });
    // On success, redirect to the dashboard or another page
    // router.push("/dashboard");
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center">
      <div className="max-w-xl mx-20 bg-[#0C1922] p-16 rounded-3xl shadow-lg">
        <h1 className={`text-4xl font-bold italic ${exo2.className}`}>
          SIGN UP
        </h1>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="w-full mb-4 flex justify-between space-x-4">
            <div className="w-1/2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name*"
                className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                required
                autoFocus
              />
            </div>
            <div className="w-1/2">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name*"
                className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                required
                autoComplete="off"
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
            autoComplete="off"
          />
          {/* Password Field with Toggle */}
          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"} // Toggle between password and text input types
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password*"
              className="w-full p-3 text-white bg-[#0C1922] border border-[#30363D] rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Confirm Password Field with Toggle */}
          <div className="relative w-full mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password*"
              className="w-full p-3 text-white bg-[#0C1922] border border-[#30363D] rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex items-start mb-4 space-x-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="align-top m-1 size-4"
            />
            <label className="text-white">
              By creating an account, you agree to our &nbsp;
              <a
                href="/terms-and-conditions"
                className="text-orange-500 underline hover:text-orange-400"
              >
                Terms & Conditions
              </a>
            </label>
          </div>
          <button
            type="submit"
            disabled={!agreedToTerms}
            className={`w-full mt-8 py-3 rounded-full text-white font-bold text-lg transition-all ${
              agreedToTerms
                ? "bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] cursor-pointer hover:bg-[#FF8A00]"
                : "bg-gray-500 cursor-default"
            }`}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
