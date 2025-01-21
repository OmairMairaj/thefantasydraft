'use client';

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Exo_2 } from 'next/font/google';
import { FaChevronDown, FaCog, FaDraft2Digital, FaExclamationCircle } from 'react-icons/fa';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);


  // const customStyles = {
  //   control: (provided, state) => ({
  //     ...provided,
  //     backgroundColor: "#070E13",
  //     color: "#FFFFFF",
  //     border: state.isFocused ? "1px solid #ff8a00" : "1px solid #484848", // Custom border color when focused
  //     borderRadius: "10px",
  //     padding: "5px",
  //     outline: "none", // Remove blue outline
  //     minWidth: "150px",
  //     boxShadow: "none", // Explicitly remove box shadow
  //     "&:hover": {
  //       border: "1px solid #ff8a00", // Custom hover border color
  //       boxShadow: "none", // Ensure no shadow on hover
  //       cursor: 'pointer'
  //     },
  //   }),
  //   option: (provided, state) => ({
  //     ...provided,
  //     backgroundColor: "#070E13",
  //     outline: "none", // Remove default outline from options
  //     color: "#FFFFFF",
  //     padding: "10px",
  //     cursor: "pointer",
  //     "&:hover": {
  //       backgroundColor: "#232323", // Customize hover color if needed
  //     },
  //   }),
  //   singleValue: (provided) => ({
  //     ...provided,
  //     color: "#FFFFFF",
  //   }),
  //   menu: (provided) => ({
  //     ...provided,
  //     backgroundColor: "#070E13",
  //     borderRadius: '15px',
  //     overflow: 'hidden',
  //     boxShadow: '0px 0px 2px 0px #efefef88',
  //     padding: '5px'
  //   }),
  //   dropdownIndicator: (provided) => ({
  //     ...provided,
  //     color: "#FFFFFF",
  //     "&:hover": {
  //       color: "#FFFFFF", // Keep the dropdown indicator color consistent on hover
  //     },
  //   }),
  //   indicatorSeparator: () => ({
  //     display: "none", // Remove the separator line between the dropdown icon and the select input
  //   }),
  //   placeholder: (provided) => ({
  //     ...provided,
  //     color: "#FFFFFF", // To match the placeholder text color with the input text
  //   }),
  // };



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

        // Check if selectedLeagueID is in sessionStorage
        const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
        if (storedLeagueID) {
          setSelectedLeague({ _id: storedLeagueID }); // Temporarily set league with just ID
        }
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
    // If leagues are loaded and a stored league ID exists, set selectedLeague
    if (leagues && leagues.length > 0) {
      const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
      const storedLeague = leagues.find((league) => league._id === storedLeagueID);

      if (storedLeague) {
        setSelectedLeague(storedLeague);
      } else {
        setSelectedLeague(leagues[0]); // Default to the first league if no match
      }
      setShowEmptyView(false); // Hide the empty view if leagues exist
    } else if (leagues && leagues.length === 0) {
      setShowEmptyView(true); // Show empty view if no leagues exist
    }
    // Loading is complete after fetching leagues
  }, [leagues]);

  useEffect(() => {
    // Save selectedLeague to sessionStorage whenever it changes
    if (selectedLeague) {
      sessionStorage.setItem("selectedLeagueID", selectedLeague._id);
      setLoading(false);
    }
  }, [selectedLeague]);

  const markPaymentAsCompleted = (leagueDetails) => {
    const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "fantasyleague/payment";
    axios.post(URL, { league: leagueDetails }).then((response) => {
      addAlert(response.data.message, response.data.error ? "error" : "success");
      if (!response.data.error) {
        setSelectedLeague(response.data.data);
        setShowUnpaid(false);
      }
    });
  };

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // const handleLeagueChange = (selectedOption) => {
  //   const selectedLeagueId = selectedOption.value;
  //   const league = leagues.find((league) => league._id === selectedLeagueId);
  //   setSelectedLeague(league);
  //   sessionStorage.setItem('selectedLeagueId', selectedLeagueId);
  // };

  const handleLeagueChange = (league) => {
    setSelectedLeague(league);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-[88vh] flex flex-col my-8 items-center text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10">
      {loading ? (
        <div className="w-full min-h-[70vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
        </div>
      ) : showEmptyView ? (
        <div className={`w-full relative bg-[#070A0A] custom-dash-spacing px-4 rounded-3xl shadow-lg flex flex-col items-center ${selectedLeague && !showEmptyView ? 'space-y-4 sm:space-y-8 py-10 sm:py-16' : 'space-y-12 py-36 lg:py-16 xl:py-24 2xl:py-36'}`}>
          <div className="flex items-center space-x-2 sm:space-x-4 ">
            <FaExclamationCircle className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl text-[#FF8A00]" />
            <h2 className={`text-xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold ${exo2.className}`}>CREATE OR JOIN A LEAGUE</h2>
          </div>
          <p className="text-center text-sm sm:text-lg md:text-lg lg:text-base max-w-3xl">
            {`${selectedLeague && !showEmptyView ? 'You can create a new league or join another existing one!'
              : 'Welcome to the ultimate fantasy sports platform. You can create a new league or join an existing one. Take your fantasy experience to the next level!'}`}
          </p>
          <div className="flex flex-row space-x-4 justify-center md:space-x-8 w-full md:w-auto">
            <Link href="/create-league-process" className={`fade-gradient px-3 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-base border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
              CREATE A LEAGUE
            </Link>
            <Link href="/join-league-process" className={`fade-gradient px-3 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-base border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
              JOIN A LEAGUE
            </Link>
          </div>


          <div className="absolute right-0 bottom-0">
            {!showEmptyView && (
              <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowEmptyView(true)}>
                Show Empty View
              </button>
            )}
            {showEmptyView && (
              <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowEmptyView(false)} >
                Hide Empty View
              </button>
            )}
            {!showEmptyView && !showUnpaid && (
              <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowUnpaid(true)} >
                Mark Unpaid
              </button>
            )}
            {!showEmptyView && showUnpaid && (
              <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowUnpaid(false)} >
                Hide Unpaid
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {leagues && selectedLeague && !showEmptyView && (
            <>
              <div className="relative w-full">
                <div className="flex flex-col md:flex-row md:justify-between w-full relative space-y-2 md:space-y-0">
                  <div className="w-full flex flex-col">
                    <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between fade-gradient-no-hover cursor-default px-4 md:px-6 py-4 rounded-xl shadow-md mb-6">
                      <div className="flex flex-row items-center space-x-4 md:space-x-4 space-y-2 md:space-y-0 mb-3 sm:mb-0">
                        <img
                          src={selectedLeague.league_image_path}
                          alt="League Logo"
                          className="w-16 h-16 object-cover rounded-lg sm:w-20 sm:h-20 md:w-24 md:h-24"
                        />
                        <div className="flex flex-col space-y-0 sm:space-y-2 text-left">
                          <h2 className={`text-2xl sm:text-2xl md:text-4xl lg:text-3xl xl:text-4xl font-bold ${exo2.className}`}>
                            {selectedLeague.league_name}
                          </h2>
                          <div className="flex flex-wrap md:justify-start text-sm lg:text-sm xl:text-base"><strong className="mr-2">Owner:</strong>{selectedLeague.creator}</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4 md:pb-2 z-40 sm:mt-3">
                        {!showUnpaid ? (
                          <div className="flex space-x-2 md:space-x-4">
                            <Link href={"/league-settings?leagueID=" + selectedLeague._id} className="fade-gradient text-sm lg:text-sm xl:text-base flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 md:px-6 lg:px-3 py-1 sm:py-2 md:py-2 lg:py-2 xl:px-5 text-white rounded-full font-bold transition-all ease-in-out">
                              <FaCog className="text-sm md:text-base lg:text-lg xl:text-xl" />
                              <span>Configurations</span>
                            </Link>
                            <Link href={"/drafting?leagueID=" + selectedLeague._id} className="fade-gradient text-sm lg:text-sm xl:text-base flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 md:px-6 lg:px-3 py-1 sm:py-2 lg:py-2 md:py-2 xl:px-5 text-white rounded-full font-bold transition-all ease-in-out">
                              <FaDraft2Digital className="text-sm md:text-base lg:text-lg xl:text-xl" />
                              <span>Drafting</span>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 space-x-2 text-sm sm:text-base lg:text-sm xl:text-base">
                            <FaExclamationCircle className="text-sm md:text-base lg:text-lg xl:text-xl" />
                            <span>Payment Pending</span>
                          </div>
                        )}
                        {/* {leagues && leagues.length > 1 && (
                    <div className="w-full md:w-auto">
                      <Select
                        value={{ value: selectedLeague._id, label: selectedLeague.league_name }}
                        onChange={handleLeagueChange}
                        options={leagues.map((league) => ({
                          value: league._id,
                          label: league.league_name,
                        }))}
                      // styles={customStyles}
                      />
                    </div>
                  )} */}
                        {leagues && leagues.length > 1 && (
                          <div ref={dropdownRef} className="relative w-full sm:w-48 md:w-56 xl:w-64">
                            {/* Dropdown Button */}
                            <button
                              onClick={() => setDropdownOpen(!dropdownOpen)}
                              className="w-full bg-[#070E13] border border-[#484848] rounded-lg px-2 sm:px-4 lg:px-3 py-1 sm:py-2 lg:py-2 text-left text-sm lg:text-sm xl:text-base flex justify-between items-center"
                            >
                              <span>
                                {selectedLeague ? selectedLeague.league_name : "Select League"}
                              </span>
                              <FaChevronDown />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                              <div className="absolute w-full bg-[#0C1922] border border-[#484848] rounded-lg mt-2 z-10">
                                {leagues &&
                                  leagues.map((league) => (
                                    <div
                                      key={league._id}
                                      onClick={() => handleLeagueChange(league)}
                                      className="px-4 py-3 hover:bg-[#FF8A00A3] cursor-pointer text-sm lg:text-sm xl:text-base"
                                    >
                                      {league.league_name}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full relative">
                      {showUnpaid && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-3xl text-center text-white z-20">
                          <div className="w-[90%] md:w-[90%] lg:w-[80%] xl:w-[70%] flex flex-col text-white p-4 md:py-16 md:px-12 rounded-md items-center custom-dash-spacing">
                            <div className="flex flex-col space-y-4">
                              <div className="flex items-center justify-center space-x-2">
                                <AiOutlineExclamationCircle className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl mt-[2px] text-[#FF8A00]" />
                                <h1 className={`text-xl sm:text-2xl md:text-3xl text-left lg:text-3xl xl:text-4xl font-bold ${exo2.className}`}>League Payment Pending</h1>
                              </div>
                              <p className="text-sm md:text-base lg:text-sm xl:text-base">Your league is not yet paid. Please complete the payment to access league features.</p>
                            </div>
                            <button
                              onClick={() => markPaymentAsCompleted(selectedLeague)}
                              className="mt-3 sm:mt-6 md:mt-8 py-1 sm:py-2 md:py-3 px-4 sm:px-6 md:px-8 lg:px-10 bg-[#FF8A00] text-white text-sm md:text-base lg:text-sm xl:text-base rounded-full font-bold hover:bg-[#ff8a00ee] hover:scale-105 transition-transform ease-in-out"
                            >
                              Mark Payment as Completed
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="w-full ">
                        <div className="flex flex-col lg:flex-row justify-between flex-wrap gap-4 sm:gap-6 md:gap-6 lg:gap-3 xl:gap-4">
                          {/* Team Name Card */}
                          <Link href={'/team'} className="w-full lg:w-[49.2%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative flex flex-col justify-between bg-cover bg-center cursor-pointer hover:inset-0.5 transition-transform ease-in-out"
                            style={{
                              backgroundImage: "url('/images/myteamimage.png')",
                            }}>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
                              <div className="flex items-center">
                                <img
                                  src={team && team.team_image_path ? team.team_image_path : "/images/myteamimage.png"}
                                  alt="Team Logo"
                                  className="w-16 h-16 sm:w-12 sm:h-12 md:w-20 md:h-20 lg:w-14 lg:h-14 xl:w-20 xl:h-20 object-cover mr-4 lg:mr-2 xl:mr-3"
                                />
                                <div>
                                  <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] ${exo2.className}`}>{team ? team.team_name : 'Team Name'}</h3>
                                  <p className="sm:hidden text-white text-xs md:text-sm lg:text-sm xl:text-base">Current Points: 120</p>
                                  <div className="sm:hidden flex space-x-1 md:space-x-2 mt-1">
                                    {['L', 'L', 'W', 'L', 'W'].map((result, idx) => (
                                      <span key={idx} className={`rounded-sm sm:rounded-md lg:rounded-sm w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-sm sm:text-base lg:text-sm xl:text-base justify-center text-white ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}>{result}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="hidden sm:flex flex-col items-center justify-center px-4 md:px-6 lg:px-2 py-2 lg:py-1 xl:px-4 xl:py-3 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                                <p className="text-white text-xs md:text-sm lg:text-sm xl:text-base">Current Points: 120</p>
                                <div className="flex space-x-1 md:space-x-2 mt-1">
                                  {['L', 'L', 'W', 'L', 'W'].map((result, idx) => (
                                    <span key={idx} className={`rounded-md lg:rounded-sm w-5 h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-base lg:text-sm xl:text-base justify-center text-white ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}>{result}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm md:text-base lg:text-sm xl:text-base">Next Opponent:</p>
                              <div className="flex items-center mt-2 sm:mt-2 px-3 sm:px-3 md:px-4 py-2 sm:py-2 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                                <img
                                  src="/images/man-city-logo.svg"
                                  alt="Opponent Logo"
                                  className="w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 object-cover rounded-full mr-2 sm:mr-4 lg:mr-2 xl:mr-3"
                                />
                                <div>
                                  <p className="text-white text-sm md:text-base lg:text-sm xl:text-base">Man City</p>
                                  <div className="flex space-x-1 md:space-x-2 mt-1 sm:mt-3 lg:mt-1">
                                    {['L', 'L', 'W', 'L', 'W'].map((result, idx) => (
                                      <span key={idx} className={`rounded-sm sm:rounded-md lg:rounded-sm w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-sm sm:text-base lg:text-sm justify-center text-white ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}>{result}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>

                          {/* League Table Card */}
                          <div className={`w-full lg:w-[49.2%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative bg-cover bg-center`}
                            style={{
                              backgroundImage: "url('/images/matchcenterImage.png')",
                            }}>
                            <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] mb-2 ${exo2.className}`}>LEAGUE TABLE</h3>
                            <p className="text-sm md:text-base lg:text-sm xl:text-base text-gray-300 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            <div className="p-2 sm:p-4 w-full md:w-[80%] lg:w-[90%] xl:w-[80%] rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                              <table className="w-full text-white text-sm md:text-sm lg:text-sm xl:text-base">
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
                                      <td className="w-2/5 text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base">{team.team_name}</td>
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
                          <div className={`${showUnpaid ? "hidden lg:block" : "block"} w-full lg:w-[32%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative bg-cover bg-center`}
                            style={{
                              backgroundImage: "url('/images/transfersimage.png')",
                            }}>
                            <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] mb-4 ${exo2.className}`}>TRANSFERS</h3>
                            <p className="text-sm md:text-base lg:text-sm xl:text-base">Manage your transfers to get the best team performance.</p>
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-4 rounded-b-3xl">
                              <Image
                                src="/images/transfericon.svg"
                                alt="Transfer Icon"
                                width={80}
                                height={80}
                                className="object-contain"
                              />
                            </div>
                          </div>

                          {/* Match Center Card */}
                          <Link href={'/match-center'} className={`${showUnpaid ? "hidden lg:block" : "block"} w-full lg:w-[32%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative flex flex-col justify-between bg-cover bg-center cursor-pointer hover:inset-0.5 transition-transform ease-in-out`}
                            style={{
                              backgroundImage: "url('/images/gameweekimage.png')",
                            }}>
                            <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] mb-4 lg:mb-1 xl:mb-2 ${exo2.className}`}>MATCH CENTER</h3>
                            <ul className="w-full text-white space-y-1">
                              {[...Array(3)].map((_, idx) => (
                                <li key={idx} className="flex items-center justify-between py-1 rounded-md shadow-md">
                                  <div className="flex items-center w-1/2">
                                    <img src="/images/man-city-logo.svg" alt="Man City Logo" className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                                    <span className="text-sm md:text-base lg:text-sm xl:text-base ml-4 lg:ml-1 xl:ml-2">Man City</span>
                                  </div>
                                  <span className="text-[#FF8A00] text-base md:text-xl mx-2">v/s</span>
                                  <div className="flex items-center justify-end w-1/2">
                                    <span className="text-sm md:text-base lg:text-sm xl:text-base mr-4 lg:mr-1 xl:mr-2">FC Barcelona</span>
                                    <img src="/images/barcelona-logo.svg" alt="FC Barcelona Logo" className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </Link>

                          {/* Achievements Card */}
                          <div className={`${showUnpaid ? "hidden lg:block" : "block"} w-full lg:w-[32%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative bg-cover bg-center`}
                            style={{
                              backgroundImage: "url('/images/achievementsimage.png')",
                            }}>
                            <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] mb-4 ${exo2.className}`}>ACHIEVEMENTS</h3>
                            <p className="text-sm md:text-base lg:text-sm xl:text-base text-gray-300 mb-4">Track your team's achievements throughout the league.</p>
                            <div className="flex items-center mt-8 lg:mt-1 xl:mt-6">
                              <CircularProgress percentage={52} />
                              <div className="ml-2">
                                <p className="text-lg md:text-xl lg:text-lg xl:text-xl font-bold text-white">21/40</p>
                                <p className="text-xs md:text-sm text-gray-300">Total Achievements Completed</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>


              <div className={`w-full relative bg-[#070A0A] custom-dash-spacing px-4 rounded-3xl shadow-lg flex flex-col items-center ${selectedLeague && !showEmptyView ? 'space-y-4 sm:space-y-8 my-8 py-10 sm:py-16' : 'space-y-12 my-8 py-36 lg:py-16 xl:py-24 2xl:py-36'}`}>
                <div className="flex items-center space-x-2 sm:space-x-4 ">
                  <FaExclamationCircle className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl text-[#FF8A00]" />
                  <h2 className={`text-xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold ${exo2.className}`}>CREATE OR JOIN A LEAGUE</h2>
                </div>
                <p className="text-center text-sm sm:text-lg md:text-lg lg:text-base max-w-3xl">
                  {`${selectedLeague && !showEmptyView ? 'You can create a new league or join another existing one!'
                    : 'Welcome to the ultimate fantasy sports platform. You can create a new league or join an existing one. Take your fantasy experience to the next level!'}`}
                </p>
                <div className="flex flex-row space-x-4 justify-center md:space-x-8 w-full md:w-auto">
                  <Link href="/create-league-process" className={`fade-gradient px-3 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-base border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
                    CREATE A LEAGUE
                  </Link>
                  <Link href="/join-league-process" className={`fade-gradient px-3 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 rounded-full text-white font-bold text-sm md:text-base lg:text-base border-2 cursor-pointer ${exo2.className} bg-gradient-to-r from-[#FF8A00] to-[#FF8A00A3] hover:from-[#FF8A00] hover:to-[#FF8A00]`}>
                    JOIN A LEAGUE
                  </Link>
                </div>


                <div className="absolute right-0 bottom-0">
                  {!showEmptyView && (
                    <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowEmptyView(true)}>
                      Show Empty View
                    </button>
                  )}
                  {showEmptyView && (
                    <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowEmptyView(false)} >
                      Hide Empty View
                    </button>
                  )}
                  {!showEmptyView && !showUnpaid && (
                    <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowUnpaid(true)} >
                      Mark Unpaid
                    </button>
                  )}
                  {!showEmptyView && showUnpaid && (
                    <button className="p-2 sm:p-4 text-sm sm:text-base text-[#efefef]" onClick={() => setShowUnpaid(false)} >
                      Hide Unpaid
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;