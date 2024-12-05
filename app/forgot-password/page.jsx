"use client"; // This ensures the page is rendered on the client

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter to use client-side navigation
import { Exo_2 } from "next/font/google";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import { useAlert } from "../../components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const ForgotPasswordContent = () => {
  const [email, setEmail] = useState("");
  const router = useRouter(); // Make sure useRouter is called within the client component
  const { addAlert } = useAlert();

  const handleSubmit = (e) => {
    e.preventDefault();
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/change-password?email=" + email;
    axios
      .get(URL)
      .then((res) => {
        console.log(res);
        addAlert(res.data.message, res.data.error ? "error" : "success");
        if (!res.data.error) {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        addAlert("An unexpected error occurred. Please try again later", "error");
      });
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-4 sm:px-8 md:px-16">
      <div className="w-full max-w-sm sm:max-w-lg bg-[#0C1922] p-8 sm:p-12 md:p-16 rounded-3xl shadow-lg">
        <h1 className={`text-2xl sm:text-4xl font-bold italic ${exo2.className}`}>FORGOT PASSWORD</h1>
        <form onSubmit={handleSubmit} className="mt-0 md:mt-8">
          <div className="mt-4 mb-4 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email*"
              className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white text-sm md:text-base"
              required
              autoComplete="off"
              autoFocus
            />
            <p className="text-white text-sm md:text-base">An email would be sent to your inbox with instructions to reset your password.</p>
          </div>
          <button
            type="submit"
            className={`w-full mt-2 py-2 md:py-3 rounded-full text-white font-bold text-base md:text-lg transition-all ${exo2.className} bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] hover:bg-[#FF8A00]`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
  return (
    <ForgotPasswordContent />
  );
};

export default ForgotPassword;
