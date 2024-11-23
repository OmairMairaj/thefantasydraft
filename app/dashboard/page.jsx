'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Exo_2 } from 'next/font/google';
import { FaExclamationCircle } from 'react-icons/fa';
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import CircularProgress from "../../components/CircularProgress/CircularProgress";

const exo2 = Exo_2({
  weight: ['700', '800'],
  style: ['italic'],
  subsets: ['latin'],
});

const Dashboard = () => {
  const [leagueDetails, setLeagueDetails] = useState(null);

  const setLeague = () => {
    // Mock league details that you would actually fetch from an API
    const leagueData = {
      name: 'My League',
      owner: 'User123',
      leagueId: '123456',
      leagueLogo: '/images/barcelona-logo.svg',
      paid: false,  // Change to true if user has paid
    };
    // Set league details in session storage
    sessionStorage.setItem('leagueDetails', JSON.stringify(leagueData));
    setLeagueDetails(leagueData);
  };

  const clearLeague = () => {
    sessionStorage.removeItem('leagueDetails');
    setLeagueDetails(null);
  }

  const clearPay = () => {
    let leagueDetails = JSON.parse(sessionStorage.getItem('leagueDetails'));
    if (leagueDetails) {
      leagueDetails.paid = false;
      sessionStorage.setItem('leagueDetails', JSON.stringify(leagueDetails));
      setLeagueDetails(leagueDetails);
    }
  }

  useEffect(() => {
    // Check if league details exist in session storage
    const savedLeagueDetails = JSON.parse(sessionStorage.getItem('leagueDetails'));
    if (savedLeagueDetails) {
      setLeagueDetails(savedLeagueDetails);
    }
  }, []);

  return (
    <div className="min-h-[88vh] flex flex-col my-16 items-center text-white px-6 md:px-10 lg:px-16 xl:px-20 pb-24">
      <div className="relative w-full">
        {leagueDetails && (
          <div
            className={`flex flex-wrap justify-between w-full relative ${!leagueDetails.paid ? "blur-sm pointer-events-none" : ""
              }`}
          >
            <div className="w-full flex space-x-4 h-80">
              {/* Team Name Card */}
              <div className="w-1/2 p-8 rounded-3xl shadow-lg mb-6 relative flex flex-col justify-between"
                style={{
                  backgroundImage: "url('/images/myteamimage.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src="/images/barcelona-logo.svg" // Replace with your team logo URL
                      alt="Team Logo"
                      className="w-20 h-20 object-cover mr-4"
                    />
                    <div>
                      <h3 className={`text-4xl font-bold text-[#FF8A00] ${exo2.className}`}>Team Name</h3>
                      {/* <p className="text-white">Current Points: 120</p> */}
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-8 py-2 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                    <p className="text-white">Current Points: 120</p>
                    <div className="flex space-x-2 mt-1">
                      <span className="bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center">L</span>
                      <span className="bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center">L</span>
                      <span className="bg-green-500 text-white rounded-md w-6 h-6 flex items-center justify-center">W</span>
                      <span className="bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center">L</span>
                      <span className="bg-green-500 text-white rounded-md w-6 h-6 flex items-center justify-center">W</span>
                      <span className="bg-green-500 text-white rounded-md w-6 h-6 flex items-center justify-center">W</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold">Next Opponent:</p>
                  <div className="flex items-center mt-2 w-max px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                    <img
                      src="/images/man-city-logo.svg" // Replace with your opponent logo URL
                      alt="Opponent Logo"
                      className="w-20 h-20 object-cover rounded-full mr-4"
                    />
                    <div>
                      <p className="text-white">Man City</p>
                      <div className="flex space-x-2 mt-3">
                        <span className="bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center">L</span>
                        <span className="bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center">L</span>
                        <span className="bg-green-500 text-white rounded-md w-6 h-6 flex items-center justify-center">W</span>
                        <span className="bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center">L</span>
                        <span className="bg-green-500 text-white rounded-md w-6 h-6 flex items-center justify-center">W</span>
                        <span className="bg-green-500 text-white rounded-md w-6 h-6 flex items-center justify-center">W</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* League Table Card */}
              <div className="w-1/2 p-8 rounded-3xl shadow-lg mb-6 relative"
                style={{
                  backgroundImage: "url('/images/matchcenterImage.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                <h3 className={`text-4xl font-bold text-[#FF8A00] mb-2 ${exo2.className}`}>LEAGUE TABLE</h3>
                <p className="text-base text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                <div className="mt-6 p-4 w-2/3 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                  <table className="w-full text-white">
                    <thead className="border-b border-[#5b5b5b]">
                      <tr className="text-[#FF8A00] pb-4">
                        <th className="w-2/5 text-left">Players</th>
                        <th className="text-center">Played</th>
                        <th className="text-center">Won</th>
                        <th className="text-center">Lost</th>
                      </tr>
                      <tr className="h-2"></tr>
                    </thead>
                    <tr className="h-2"></tr>
                    <tbody className="pt-4">
                      <tr>
                        <td className="w-2/5">Omar</td>
                        <td className="text-center">23</td>
                        <td className="text-center">22</td>
                        <td className="text-center">1</td>
                      </tr>
                      <tr>
                        <td className="w-2/5">Haris</td>
                        <td className="text-center">15</td>
                        <td className="text-center">2</td>
                        <td className="text-center">13</td>
                      </tr>
                      <tr>
                        <td className="w-2/5">Maryam</td>
                        <td className="text-center">10</td>
                        <td className="text-center">5</td>
                        <td className="text-center">5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            <div className="w-full flex space-x-4 h-80">
              {/* Transfers Card */}
              <div className="w-1/3 p-8 rounded-3xl shadow-lg mb-6 relative"
                style={{
                  backgroundImage: "url('/images/transfersimage.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                <h3 className={`text-4xl font-bold text-[#FF8A00] mb-4 ${exo2.className}`}>TRANSFERS</h3>
                <p className="text-base">Manage your transfers to get the best team performance.</p>
                <div className="absolute bottom-0 left-0 right-0 p-8 rounded-b-3xl">
                  <Image
                    src="/images/transfericon.svg"
                    alt="Transfer Icon"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Match Center Card */}
              <div className="w-1/3 p-8 rounded-3xl shadow-lg mb-6 flex flex-col justify-between"
                style={{
                  backgroundImage: "url('/images/gameweekimage.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                <h3 className={`text-4xl font-bold text-[#FF8A00] mb-4 ${exo2.className}`}>MATCH CENTER</h3>
                <ul class="w-[80%] text-white space-y-1">
                  <li class="flex items-center justify-between py-1 rounded-md shadow-md">
                    <div class="flex items-center">
                      <img src="/images/man-city-logo.svg" alt="Man City Logo" class="w-10 h-10 mr-4" />
                      <span class="text-base">Man City</span>
                    </div>
                    <span class="text-[#FF8A00] text-xl mx-2">v/s</span>
                    <div class="flex items-center">
                      <span class="text-base mr-4">FC Barcelona</span>
                      <img src="/images/barcelona-logo.svg" alt="FC Barcelona Logo" class="w-10 h-10" />
                    </div>
                  </li>
                  <li class="flex items-center justify-between py-1 rounded-md shadow-md">
                    <div class="flex items-center">
                      <img src="/images/man-city-logo.svg" alt="Man City Logo" class="w-10 h-10 mr-4" />
                      <span class="text-base">Man City</span>
                    </div>
                    <span class="text-[#FF8A00] text-xl mx-2">v/s</span>
                    <div class="flex items-center">
                      <span class="text-base mr-4">FC Barcelona</span>
                      <img src="/images/barcelona-logo.svg" alt="FC Barcelona Logo" class="w-10 h-10" />
                    </div>
                  </li>
                  <li class="flex items-center justify-between py-1 rounded-md shadow-md">
                    <div class="flex items-center">
                      <img src="/images/man-city-logo.svg" alt="Man City Logo" class="w-10 h-10 mr-4" />
                      <span class="text-base">Man City</span>
                    </div>
                    <span class="text-[#FF8A00] text-xl mx-2">v/s</span>
                    <div class="flex items-center">
                      <span class="text-base mr-4">FC Barcelona</span>
                      <img src="/images/barcelona-logo.svg" alt="FC Barcelona Logo" class="w-10 h-10" />
                    </div>
                  </li>
                </ul>
              </div>

              {/* Achievements Card */}
              <div className="w-1/3 p-8 rounded-3xl shadow-lg mb-6"
                style={{
                  backgroundImage: "url('/images/achievementsimage.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                <h3 className={`text-4xl font-bold text-[#FF8A00] mb-4 ${exo2.className}`}>ACHIEVEMENTS</h3>
                <p className="text-base text-gray-300 mb-4">Track your team's achievements throughout the league.</p>
                <div className="flex items-center mt-8">
                  <CircularProgress percentage={52} />
                  <div className="ml-2">
                    <p className="text-xl font-bold text-white">21/40</p>
                    <p className="text-sm text-gray-300">Total Achievements Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        }
        {leagueDetails && !leagueDetails.paid && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-3xl text-center text-white z-20">
            <div className="w-1/2 flex flex-col text-white py-16 rounded-md items-center custom-dash-spacing">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <AiOutlineExclamationCircle className="text-6xl text-[#FF8A00]" />
                  <h1 className={`text-4xl font-bold ${exo2.className}`}>League Payment Pending</h1>
                </div>
                <p>Your league is not yet paid. Please complete the payment to access league features.</p>
              </div>
              <button
                onClick={() => {
                  let leagueDetails = JSON.parse(sessionStorage.getItem('leagueDetails'));
                  if (leagueDetails) {
                    leagueDetails.paid = true;
                    sessionStorage.setItem('leagueDetails', JSON.stringify(leagueDetails));
                    setLeagueDetails(leagueDetails);
                  }
                }}
                className=" mt-8 py-3 bg-[#FF8A00A3] px-8 text-white rounded-full font-bold hover:bg-[#ff8a00ee] hover:scale-105 transition-transform trasition-all ease-in-out"
              >
                Mark Payment as Completed
              </button>
            </div>
          </div>
        )}
      </div>


      <div className={`w-full relative bg-[#070A0A] custom-dash-spacing rounded-3xl shadow-lg flex flex-col items-center ${leagueDetails ? 'space-y-8 my-8 py-16' : 'space-y-12 my-8 py-36'}`}>
        <div className="flex items-center space-x-4">
          <FaExclamationCircle className="text-4xl text-[#FF8A00]" />
          <h2 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>CREATE OR JOIN A LEAGUE</h2>
        </div>
        <p className="text-center text-lg md:text-xl max-w-3xl">
          {` ${leagueDetails ? 'You can create a new league or join another existing one!.'
            : 'Welcome to the ultimate fantasy sports platform. You can create a new league or join an existing one. Take your fantasy experience to the next level!'}`}
        </p>
        <div className="flex space-x-8">
          <Link href="/create-league-process" className={`fade-gradient px-6 md:px-8 lg:px-12 py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
            CREATE A LEAGUE
          </Link>
          <Link href="/join-league-process" className={`fade-gradient px-6 md:px-8 lg:px-12 py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
            JOIN A LEAGUE
          </Link>
        </div>


        <div className="absolute right-0 bottom-0">
          {leagueDetails && leagueDetails.paid && (
            <button className="p-4 text-white" onClick={clearPay}>
              Mark Unpaid
            </button>
          )}
          {leagueDetails && (
            <button className="p-4 text-white" onClick={clearLeague}>
              Clear League
            </button>
          )}
          {!leagueDetails && (
            <button className="p-4 text-white" onClick={setLeague}>
              Set League
            </button>
          )}
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
