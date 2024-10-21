"use client"; // This ensures the page is rendered on the client

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation"; // Import useRouter to use client-side navigation
import { Exo_2 } from "next/font/google";
import axios from "axios";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const ForgotPasswordContent = () => {
  const [email, setEmail] = useState("");
  const router = useRouter(); // Make sure useRouter is called within the client component

  const handleSubmit = (e) => {
    e.preventDefault();
    const URL =
      process.env.NEXT_PUBLIC_BACKEND_URL +
      "user/change-password?email=" +
      email;
    axios
      .get(URL)
      .then((res) => {
        console.log(res);
        alert(res.data.message);
        if (!res.data.error) {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("An unexpected error occurred. Please try again later");
      });
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center mb-[40]">
      <div className="max-w-lg mx-20 bg-[#0C1922] p-16 rounded-3xl shadow-lg mb-500">
        <h1 className={`text-4xl font-bold italic ${exo2.className}`}>
          FORGOT PASSWORD
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mt-8 mb-4 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email*"
              className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
              required
              autoComplete="off"
              autoFocus
            />
            <br />
            <div>
              An email would be sent to your inbox with instructions to reset
              your password.
            </div>
          </div>
          <button
            type="submit"
            className={`w-full mt-8 py-3 bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] rounded-full text-white font-bold text-lg hover:bg-[#FF8A00] transition-all ${exo2.className}`}
          >
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPassword;
