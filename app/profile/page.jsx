"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Exo_2 } from "next/font/google";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import axios from "axios";
import { useAlert } from "../../components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const Profile = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { addAlert } = useAlert();

  // console.log("we here");
  // console.log();

  React.useEffect(() => {
    if (sessionStorage.getItem("user")) {
      setUser(JSON.parse(sessionStorage.getItem("user")).user);
    } else {
      setUser(JSON.parse(localStorage.getItem("user")).user);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/update";
    console.log(URL);
    const body = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
    axios
      .post(URL, body)
      .then((res) => {
        console.log(res);
        addAlert(res.data.message, res.data.error ? "error" : "success");
        if (res.data.data) {
          setUser(res.data.data);
          if (sessionStorage.getItem("user")) {
            const obj = {
              ...JSON.parse(sessionStorage.getItem("user")),
              user: res.data.data,
            };
            sessionStorage.setItem("user", JSON.stringify(obj));
          } else {
            const obj = {
              ...JSON.parse(localStorage.getItem("user")),
              user: res.data.data,
            };
            localStorage.setItem("user", JSON.stringify(obj));
          }
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        console.log(err);
        addAlert("An unexpected error occurred. Please try again later", "error");
      });
  };

  if (user)
    return (
      <div className="min-h-[88vh] flex flex-col items-center justify-center">
        <div style={{ width: "100%" }} className="max-w-xl mx-20 bg-[#0C1922] p-16 rounded-3xl shadow-lg">
          <h1 className={`text-4xl font-bold italic ${exo2.className}`}>
            USER PROFILE
          </h1>
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="w-full mb-4 flex justify-between space-x-4">
              <div className="w-1/2 flex items-center">First Name</div>
              <div className="w-1/2">
                <input
                  type="text"
                  value={user.first_name}
                  onChange={(e) => {
                    setUser({ ...user, first_name: e.target.value });
                  }}
                  placeholder="First Name*"
                  className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="w-full mb-4 flex justify-between space-x-4">
              <div className="w-1/2 flex items-center">Last Name</div>
              <div className="w-1/2">
                <input
                  type="text"
                  value={user.last_name}
                  onChange={(e) => {
                    setUser({ ...user, last_name: e.target.value });
                  }}
                  placeholder="Last Name*"
                  className="w-full p-3 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="w-full mb-4 flex justify-between space-x-4">
              <div className="w-1/2 flex items-center">Email</div>
              <div className="w-1/2">
                <input
                  disabled={true}
                  value={user.email}
                  onChange={(e) => {
                    setUser({ ...user, email: e.target.value });
                  }}
                  className="w-full p-3 mb-4 rounded-lg bg-[#0C1922] border border-[#30363D] focus:outline-none focus:border-orange-500 text-white"
                  title="This field cannot be edited."
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full mt-8 py-3 rounded-full text-white font-bold text-lg transition-all bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] cursor-pointer hover:bg-[#FF8A00]`}
            >
              UPDATE
            </button>
            <div
              style={{ textAlign: "center" }}
              className={`w-full mt-8 py-3 rounded-full text-white font-bold text-lg transition-all bg-gradient-to-b from-[#FF8A00] to-[#FF8A00A3] cursor-pointer hover:bg-[#FF8A00]`}
              onClick={() => {
                router.push("/forgot-password");
              }}
            >
              CHANGE PASSWORD
            </div>
          </form>
        </div>
      </div>
    );
  else return <div style={{ minHeight: "60vh" }}></div>;
};

export default Profile;
