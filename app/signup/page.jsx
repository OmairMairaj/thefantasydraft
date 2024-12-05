"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Exo_2 } from "next/font/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im"; // Import loading spinner icon
import { useAlert } from "../../components/AlertContext/AlertContext";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();
  const { addAlert } = useAlert(); // Use the alert context

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that passwords match before sending the request
    if (password !== confirmPassword) {
      addAlert("Passwords do not match", "error");
      return;
    }

    if (!agreedToTerms) {
      addAlert("You must agree to the Terms & Conditions", "info");
      return;
    }

    setLoading(true); // Set loading to true to show the spinner

    // Logic to register the user (you can call an API here)
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/signup";
    const body = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      confirm_password: confirmPassword
    };

    axios
      .post(URL, body)
      .then((res) => {
        // Add an alert for success or error
        addAlert(res.data.message, res.data.error ? "error" : "success");
        if (!res.data.error) {
          setTimeout(() => {
            router.push("/login");
          }, [1000]);
        }
      })
      .catch((err) => {
        addAlert("An unexpected error occurred. Please try again later", "error");
      })
      .finally(() => {
        setLoading(false); // Set loading to false once the API call is completed
      });
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-6 sm:px-8 md:px-16">
      <div className="w-full max-w-sm sm:max-w-lg bg-[#0C1922] p-8 sm:p-12 md:p-16 rounded-3xl shadow-lg">
        <h1 className={`text-3xl sm:text-4xl font-bold italic ${exo2.className}`}>SIGN UP</h1>
        <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
          <div className="w-full mb-4 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name*"
                className="w-full text-sm md:text-base p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                required
                autoFocus
              />
            </div>
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name*"
                className="w-full text-sm md:text-base p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
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
            className="w-full text-sm md:text-base p-3 mb-4 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
            required
            autoComplete="off"
          />

          {/* Password Field with Toggle */}
          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password*"
              className="w-full text-sm md:text-base p-3 text-white bg-[#0C1922] border border-[#30363D] rounded-lg focus:outline-none focus:border-orange-500"
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
              className="w-full text-sm md:text-base p-3 text-white bg-[#0C1922] border border-[#30363D] rounded-lg focus:outline-none focus:border-orange-500"
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

          <div className="flex items-start mb-2 space-x-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="align-top m-1 size-4"
            />
            <label className="text-white text-sm md:text-base">
              By creating an account, you agree to our &nbsp;
              <a
                href="/terms-and-conditions"
                target="_blank"
                className="text-orange-500 underline hover:text-orange-400"
              >
                Terms & Conditions
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className={`w-full mt-2 py-2 md:py-3 rounded-full text-white font-bold text-base md:text-lg transition-all ${loading || !agreedToTerms
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] hover:bg-[#FF8A00] cursor-pointer"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <ImSpinner2 className="animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
