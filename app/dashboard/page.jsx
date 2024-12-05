'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Exo_2 } from 'next/font/google';
import { FaCog, FaDraft2Digital, FaExclamationCircle } from 'react-icons/fa';
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import Select from 'react-select';
import { useRouter } from "next/navigation";
import CircularProgress from "../../components/CircularProgress/CircularProgress";
import { useAlert } from "@/components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ['700', '800'],
  style: ['italic'],
  subsets: ['latin'],
});

const Dashboard = () => {
  // const [leagueDetails, setLeagueDetails] = useState(null);
  const router = useRouter();
  const [leagues, setLeagues] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [user, setUser] = useState({});
  const [showEmptyView, setShowEmptyView] = useState(false);
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [team, setTeam] = useState(null);
  const [teams, setTeams] = useState(null);
  const { addAlert } = useAlert();


  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#070E13",
      color: "#FFFFFF",
      border: state.isFocused ? "1px solid #ff8a00" : "1px solid #484848", // Custom border color when focused
      borderRadius: "10px",
      padding: "5px",
      outline: "none", // Remove blue outline
      minWidth: "250px",
      boxShadow: "none", // Explicitly remove box shadow
      "&:hover": {
        border: "1px solid #ff8a00", // Custom hover border color
        boxShadow: "none", // Ensure no shadow on hover
        cursor: 'pointer'
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: "#070E13",
      outline: "none", // Remove default outline from options
      color: "#FFFFFF",
      padding: "10px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#232323", // Customize hover color if needed
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#FFFFFF",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#070E13",
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0px 0px 2px 0px #efefef88',
      padding: '5px'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#FFFFFF",
      "&:hover": {
        color: "#FFFFFF", // Keep the dropdown indicator color consistent on hover
      },
    }),
    indicatorSeparator: () => ({
      display: "none", // Remove the separator line between the dropdown icon and the select input
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#FFFFFF", // To match the placeholder text color with the input text
    }),
  };



  useEffect(() => {
    // Check if window is defined to ensure we are on the client side
    if (typeof window !== 'undefined') {
      let userData = null;

      if (sessionStorage.getItem("user")) {
        userData = JSON.parse(sessionStorage.getItem("user"));
      } else if (localStorage.getItem("user")) {
        userData = JSON.parse(localStorage.getItem("user"));
      } else {
        router.push("/login?redirect=" + window.location.toString());
      }

      if (userData && userData.user) {
        setUser(userData.user);
        fetchLeaguesByUser(userData.user.email)
        console.log(userData.user.email);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTeamsData = async () => {
      if (selectedLeague) {
        try {
          // Use Promise.all to fetch all team data in parallel
          const teamResponses = await Promise.all(
            selectedLeague.teams.map(async (team) => {
              try {
                if (team.team) {
                  const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyteam/${team.team}`);
                  if (!response.data.error) {
                    return response.data.data;
                  } else {
                    console.error("Error fetching team: ", response.data.message);
                    return null; // Return null if there's an error to maintain index consistency
                  }
                } else {
                  console.error("teamId is undefined for team: ", team);
                  return null; // Handle undefined teamId gracefully
                }
              } catch (error) {
                console.error("Error fetching team: ", error);
                return null; // Handle request errors gracefully
              }
            })
          );

          // Filter out any null values in case some requests failed
          const validTeams = teamResponses.filter((team) => team !== null);
          setTeams(validTeams);
          console.log(validTeams)

          if (!selectedLeague.paid) {
            setShowUnpaid(true);
          }

        } catch (error) {
          console.error("Error fetching teams data: ", error);
        }
      }
    };

    fetchTeamsData();
  }, [selectedLeague]);


  useEffect(() => {
    console.log("teams useEffect triggered")
    console.log(teams);
    console.log(user);
    if (teams && user) {
      let userTeam = teams.find(team => team.user_email === user.email);
      if (userTeam) {
        setTeam(userTeam);
      }
    }
  }, [teams]);

  const fetchLeaguesByUser = async (userEmail) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague?email=${userEmail}`);
      if (!response.data.error) {
        setLeagues(response.data.data);
        console.log(response.data.data);
      } else {
        console.error("Error fetching leagues: ", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching leagues: ", error);
    }
  };

  useEffect(() => {
    if (leagues) {
      setSelectedLeague(leagues[0])
    }
  }, [leagues])

  const markPaymentAsCompleted = (leagueDetails) => {
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyleague/payment";
    axios.post(URL, { league: leagueDetails }).then((response) => {
      addAlert(response.data.message, response.data.error ? "error" : "success");
      if (response.data.error == false) {
        setSelectedLeague(response.data.data);
        setShowUnpaid(false);
      }
    });
  };

  const handleLeagueChange = (event) => {
    const selectedLeagueId = event.target.value;
    const league = leagues.find((league) => league._id === selectedLeagueId);
    setSelectedLeague(league);
    sessionStorage.setItem('selectedLeagueId', selectedLeagueId);
  };

  return (
    <div className="min-h-[88vh] flex flex-col my-8 items-center text-white px-4 md:px-6 lg:px-10 pb-24">
      <div className="relative w-full">
        {selectedLeague && !showEmptyView && (
          <div className="flex flex-col md:flex-row md:justify-between w-full relative space-y-8 md:space-y-0">
            <div className="w-full flex flex-col space-y-6">
              <div className="w-full flex flex-col md:flex-row md:items-end md:justify-between fade-gradient-no-hover cursor-default px-4 md:px-6 py-4 rounded-xl shadow-md mb-6">
                <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-4 md:space-y-0">
                  <img
                    src={selectedLeague.league_image_path}
                    alt="League Logo"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex flex-col space-y-2 text-center md:text-left">
                    <h2 className={`text-2xl md:text-4xl font-bold ${exo2.className}`}>
                      {selectedLeague.league_name}
                    </h2>
                    <div className="flex justify-center md:justify-start"><strong className="mr-2">Owner:</strong>{selectedLeague.creator}</div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center md:pb-2 z-40">
                  {!showUnpaid ? (
                    <div className="flex space-x-4">
                      <button className="fade-gradient flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-full font-bold transition-all ease-in-out">
                        <FaCog size={20} />
                        <span>Configurations</span>
                      </button>
                      <Link href={"/drafting?leagueID="+selectedLeague._id} className="fade-gradient flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-full font-bold transition-all ease-in-out">
                        <FaDraft2Digital size={20} />
                        <span>Drafting</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 space-x-2">
                      <FaExclamationCircle size={20} />
                      <span>Payment Pending</span>
                    </div>
                  )}
                  {leagues && leagues.length > 1 && (
                    <div className="w-full md:w-auto">
                      <Select
                        value={{ value: selectedLeague._id, label: selectedLeague.league_name }}
                        onChange={handleLeagueChange}
                        options={leagues.map((league) => ({
                          value: league._id,
                          label: league.league_name,
                        }))}
                        styles={customStyles}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full relative">
                {showUnpaid && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-3xl text-center text-white z-20">
                    <div className="w-1/2 flex flex-col text-white py-16 rounded-md items-center custom-dash-spacing">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <AiOutlineExclamationCircle className="text-6xl text-[#FF8A00]" />
                          <h1 className={`text-4xl font-bold ${exo2.className}`}>League Payment Pending</h1>
                        </div>
                        <p>Your league is not yet paid. Please complete the payment to access league features.</p>
                      </div>
                      <button
                        onClick={() => markPaymentAsCompleted(selectedLeague)}
                        className=" mt-8 py-3 bg-[#FF8A00] px-8 text-white rounded-full font-bold hover:bg-[#ff8a00ee] hover:scale-105 transition-transform trasition-all ease-in-out"
                      >
                        Mark Payment as Completed
                      </button>
                    </div>
                  </div>
                )}
                <div className="w-full ">
                  <div className="flex flex-col md:flex-row flex-wrap gap-6 md:space-x-4">
                    {/* Team Name Card */}
                    <div className="w-full md:w-1/2 p-6 rounded-3xl shadow-lg relative flex flex-col justify-between bg-cover bg-center"
                      style={{
                        backgroundImage: "url('/images/myteamimage.png')",
                      }}>
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center">
                          <img
                            src={team && team.team_image_path ? team.team_image_path : "/images/myteamimage.png"}
                            alt="Team Logo"
                            className="w-20 h-20 object-cover mr-4"
                          />
                          <div>
                            <h3 className={`text-2xl md:text-4xl font-bold text-[#FF8A00] ${exo2.className}`}>{team ? team.team_name : 'Team Name'}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-center px-6 md:px-8 py-2 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                          <p className="text-white text-sm md:text-base">Current Points: 120</p>
                          <div className="flex space-x-2 mt-1">
                            {['L', 'L', 'W', 'L', 'W', 'W'].map((result, idx) => (
                              <span key={idx} className={`rounded-md w-6 h-6 flex items-center justify-center text-white ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}>{result}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold">Next Opponent:</p>
                        <div className="flex items-center mt-2 px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                          <img
                            src="/images/man-city-logo.svg"
                            alt="Opponent Logo"
                            className="w-12 md:w-20 h-12 md:h-20 object-cover rounded-full mr-4"
                          />
                          <div>
                            <p className="text-white">Man City</p>
                            <div className="flex space-x-2 mt-3">
                              {['L', 'L', 'W', 'L', 'W', 'W'].map((result, idx) => (
                                <span key={idx} className={`rounded-md w-6 h-6 flex items-center justify-center text-white ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}>{result}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* League Table Card */}
                    <div className="w-full md:w-1/2 p-6 rounded-3xl shadow-lg relative bg-cover bg-center"
                      style={{
                        backgroundImage: "url('/images/matchcenterImage.png')",
                      }}>
                      <h3 className={`text-2xl md:text-4xl font-bold text-[#FF8A00] mb-2 ${exo2.className}`}>LEAGUE TABLE</h3>
                      <p className="text-base text-gray-300 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <div className="p-4 w-full md:w-2/3 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                        <table className="w-full text-white text-sm md:text-base">
                          <thead className="border-b border-[#5b5b5b]">
                            <tr className="text-[#FF8A00] pb-4">
                              <th className="w-2/5 text-left">Players</th>
                              <th className="text-center">Played</th>
                              <th className="text-center">Won</th>
                              <th className="text-center">Lost</th>
                            </tr>
                          </thead>
                          <tbody className="pt-4">
                            {teams && teams.slice(0, 3).map((team, index) => (
                              <tr key={index}>
                                <td className="w-2/5">{team.team_name}</td>
                                <td className="text-center">{team.played || 0}</td>
                                <td className="text-center">{team.won || 0}</td>
                                <td className="text-center">{team.lost || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

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
              </div>
            </div>
          </div>
        )
        }
      </div>


      <div className={`w-full relative bg-[#070A0A] custom-dash-spacing rounded-3xl shadow-lg flex flex-col items-center ${selectedLeague && !showEmptyView ? 'space-y-8 my-8 py-16' : 'space-y-12 my-8 py-36'}`}>
        <div className="flex items-center space-x-4">
          <FaExclamationCircle className="text-3xl md:text-4xl text-[#FF8A00]" />
          <h2 className={`text-3xl md:text-4xl font-bold ${exo2.className}`}>CREATE OR JOIN A LEAGUE</h2>
        </div>
        <p className="text-center text-lg md:text-xl max-w-3xl">
          {` ${selectedLeague && !showEmptyView ? 'You can create a new league or join another existing one!'
            : 'Welcome to the ultimate fantasy sports platform. You can create a new league or join an existing one. Take your fantasy experience to the next level!'}`}
        </p>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 w-full md:w-auto">
          <Link href="/create-league-process" className={`fade-gradient px-6 md:px-8 lg:px-12 py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
            CREATE A LEAGUE
          </Link>
          <Link href="/join-league-process" className={`fade-gradient px-6 md:px-8 lg:px-12 py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-lg border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
            JOIN A LEAGUE
          </Link>
        </div>


        <div className="absolute right-0 bottom-0">
          {!showEmptyView && (
            <button className="p-4 text-white" onClick={() => setShowEmptyView(true)}>
              Show Empty View
            </button>
          )}
          {showEmptyView && (
            <button className="p-4 text-white" onClick={() => setShowEmptyView(false)} >
              Hide Empty View
            </button>
          )}
          {!showEmptyView && !showUnpaid && (
            <button className="p-4 text-white" onClick={() => setShowUnpaid(true)} >
              Mark Unpaid
            </button>
          )}
          {!showEmptyView && showUnpaid && (
            <button className="p-4 text-white" onClick={() => setShowUnpaid(false)} >
              Hide Unpaid
            </button>
          )}
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
