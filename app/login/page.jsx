"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useAlert } from "../../components/AlertContext/AlertContext";
import { Exo_2 } from "next/font/google";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const LoginContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addAlert } = useAlert();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/login";
    const body = {
      email: email,
      password: password,
    };
    axios
      .post(URL, body)
      .then((res) => {
        addAlert(res.data.message, res.data.error ? "error" : "success");
        if (!res.data.error) {
          if (stayLoggedIn) {
            localStorage.setItem("user", JSON.stringify(res.data));
          } else {
            sessionStorage.setItem("user", JSON.stringify(res.data));
          }
          if (searchParams.get("redirect"))
            router.push(searchParams.get("redirect"));
          else {
            setTimeout(() => {
              router.push("/dashboard");
            }, [2000])
          }
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
      <div className="w-full max-w-sm sm:max-w-lg bg-[#0C1922] p-8 px-6 sm:p-12 md:p-16 rounded-3xl shadow-lg">
        <h1
          className={`text-3xl sm:text-4xl font-bold italic ${exo2.className}`}
        >
          LOGIN
        </h1>
        <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email*"
              className="w-full text-sm md:text-base p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
              required
              autoComplete="off"
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password*"
                className="w-full text-sm md:text-base p-3 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-orange-500 text-white"
                required
                autoComplete="off"
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
          </div>
          <div className="sm:flex items-center justify-between mt-4">
            <label className="flex items-center text-white text-sm md:text-base">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="mr-2"
              />
              Stay Logged In?
            </label>
            <a
              href="/forgot-password"
              className="text-orange-500 text-sm md:text-base hover:underline mt-3 sm:mt-0 flex justify-end"
            >
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading} // Disable the button when loading
            className={`w-full mt-6 py-2 md:py-3 bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] rounded-full text-white font-bold text-base md:text-lg hover:bg-[#FF8A00] transition-all ${exo2.className} ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <ImSpinner2 className="animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default Login;
