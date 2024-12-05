"use client"; // This ensures the page is rendered on the client

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Import useRouter to use client-side navigation
import { Exo_2 } from "next/font/google";
import axios from "axios";
import { useAlert } from "../../components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const ChangePasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter(); // Make sure useRouter is called within the client component
  const email = searchParams.get("email");
  const code = searchParams.get("code");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const { addAlert } = useAlert();

  const handleSubmit = (e) => {
    e.preventDefault();
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/change-password";
    const body = {
      email: email,
      password1: password1,
      password2: password2,
      code: code,
    };
    axios
      .post(URL, body)
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
    <div className="min-h-[88vh] flex flex-col items-center justify-center mb-[40]">
      <div className="max-w-lg mx-20 bg-[#0C1922] p-16 rounded-3xl shadow-lg mb-500">
        <h1 className={`text-4xl font-bold italic ${exo2.className}`}>
          RESET PASSWORD
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mt-8 mb-4 space-y-4">
            {/* <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email*"
                            className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
                            required
                            autoComplete="off"
                            autoFocus
                        /> */}
            {/* </div> */}
            {/* <div> */}
            <input
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              placeholder="Password*"
              className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
              required
              autoComplete="off"
            />
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Re-Enter Password*"
              className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
              required
              autoComplete="off"
            />
          </div>
          {/* <div className="flex items-center justify-between">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="mr-2 ml-1 size-4"
              />
              Stay Logged In?
            </label>
            <a
              href="/forgot-password"
              className="text-orange-500 text-sm hover:underline"
            >
              Forgot Password?
            </a>
          </div> */}
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

const ChangePassword = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordContent />
    </Suspense>
  );
};

export default ChangePassword;
