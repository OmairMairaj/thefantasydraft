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
  const [gameweek, setGameweek] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [opponentStats, setOpponentStats] = useState(null);
  const [headToHeadTable, setHeadToHeadTable] = useState(null);
  const [classicTable, setClassicTable] = useState(null);
  const [currentFixtures, setCurrentFixtures] = useState(null);

  const { addAlert } = useAlert();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);

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

        // // Check if selectedLeagueID is in sessionStorage
        // const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
        // console.log("storedLeagueID", storedLeagueID);
        // if (storedLeagueID) {
        //   setSelectedLeague({ _id: storedLeagueID }); // Temporarily set league with just ID
        // }
      }
    }
  }, []);

  useEffect(() => {
    const fetchCurrentGameweek = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}gameweek/current`);
        if (res.data && res.data.error) {
          console.error("Error fetching current gameweek:", res.data.message);
          addAlert("Unable to fetch current gameweek.", "error");
          return;
        }
        // console.log("Current Gameweek Response: ", res.data.data);
        const current = res.data?.data?.name;
        setGameweek(current);
        console.log("Current Gameweek: ", current);
      } catch (err) {
        console.error("Error fetching current gameweek:", err);
        addAlert("Unable to fetch current gameweek.", "error");
      }
    };

    fetchCurrentGameweek();
  }, []);


  const fetchTeamsData = async () => {
    if (selectedLeague) {
      try {
        // Use Promise.all to fetch all team data in parallel
        const teamResponses = await Promise.all(
          selectedLeague.teams.map(async (team) => {
            try {
              if (team.team) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyteam/${team.team._id}`);
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
        console.log("League Teams (Teams): ", validTeams);
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


  useEffect(() => {
    if (selectedLeague) {
      sessionStorage.setItem("selectedLeagueID", selectedLeague._id);
      fetchTeamsData();
    }
  }, [selectedLeague]);

  useEffect(() => {
    console.log("teams useEffect triggered")
    // console.log("League Teams: ", teams);
    // console.log(user);
    if (teams && user) {
      let userTeam = teams.find(team => team.user_email === user.email);
      if (userTeam) {
        setTeam(userTeam);
        console.log("User Team (Team): ", userTeam);
      }
    }
  }, [teams]);

  const fetchLeaguesByUser = async (userEmail) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasyleague?email=${userEmail}`);
      if (!response.data.error) {
        setLeagues(response.data.data);
        console.log("Leagues By User: ", response.data.data);

        if (response.data.data.length === 0) {
          setShowEmptyView(true);
          setLoading(false); // Stop loading if no leagues found
          return;
        }

        // Validate stored league ID
        const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
        const validStoredLeague = response.data.data.find(league => league._id === storedLeagueID);

        if (validStoredLeague) {
          setSelectedLeague(validStoredLeague);
          console.log("Selected League (selectedLeague): ", validStoredLeague);
        } else {
          setSelectedLeague(response.data.data[0]); // Default to first league
          console.log("Selected League (selectedLeague): ", response.data.data[0]);
        }

        setShowEmptyView(false);
      }
    } catch (error) {
      console.error("Error fetching leagues: ", error);
    } finally {
      setLoading(false); // Ensures loading is stopped in all cases
    }
  };

  useEffect(() => {
    // If leagues are loaded and a stored league ID exists, set selectedLeague
    if (leagues && leagues.length > 0) {
      const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
      const storedLeague = leagues.find((league) => league._id === storedLeagueID);

      if (storedLeague) {
        setSelectedLeague(storedLeague);
        console.log("Selected League (selectedLeague): ", storedLeague);
      } else {
        setSelectedLeague(leagues[0]);
        console.log("Selected League (selectedLeague): ", leagues[0]); // Default to the first league if no match
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

  useEffect(() => {
    if (team && gameweek && selectedLeague) {
      const headToHeadData = selectedLeague.head_to_head_points;
      const classicData = selectedLeague.classic_points;
      const fixtures = selectedLeague.league_fixtures;

      // Find user team H2H stats
      const userStats = headToHeadData.find(entry => entry.team._id === team._id);
      setTeamStats(userStats); // you can display points, form, etc.
      console.log("User Team Stats (teamStats): ", userStats);

      // Get next gameweek (assuming gameweek is number or numeric string)
      const nextGW = (parseInt(gameweek, 10) + 1).toString();

      // Find fixture where user's team is involved
      const nextFixture = fixtures.find(
        (fixture) => fixture.gameweek === nextGW &&
          fixture.teams.some(t => t._id === team._id)
      );

      if (nextFixture) {
        const opponent = nextFixture.teams.find(t => t._id !== team._id);

        if (opponent) {
          const opponentStats = headToHeadData.find(entry => entry.team._id === opponent._id);
          setOpponent(opponent);
          console.log("Opponent Team (opponent): ", opponent);
          setOpponentStats(opponentStats); // show form, etc.
          console.log("Opponent Team Stats (opponentStats): ", opponentStats);
        }
      }

      // Show leaderboard (you can sort or manipulate if needed)
      setHeadToHeadTable(headToHeadData);
      console.log("Head to Head Table (headToHeadTable): ", headToHeadData);
      setClassicTable(classicData);
      console.log("Classic Table (classicData): ", classicData);

      // Match center: filter current gameweek fixtures
      const currentWeekFixtures = fixtures.filter(f => f.gameweek === gameweek);
      setCurrentFixtures(currentWeekFixtures.slice(0, 3)); // top 3 fixtures
      console.log("Current Fixtures (currentFixtures): ", currentWeekFixtures);
    }
  }, [team, gameweek, selectedLeague]);


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

  const handleLeagueChange = (league) => {
    setSelectedLeague(league);
    setDropdownOpen(false);
  };

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
                              <span>League Settings</span>
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
                              backgroundImage: `url('${team?.ground_image_path || "/images/myteamimage.png"}')`,
                              overlay: "rgba(0, 0, 0, 0.4)",
                              // backgroundImage: "url('/images/myteamimage.png')",
                            }}>
                            <div className="absolute inset-0 rounded-3xl z-0"
                              style={{ background: 'linear-gradient(90deg, #070E13fe 20%, #070E13d0 60%, #00000020)' }}></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-4 z-10">
                              <div className="flex items-center">
                                <img
                                  src={team && team.team_image_path ? team.team_image_path : "/images/default_team_logo.png"}
                                  alt="Team Logo"
                                  className="w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 xl:w-20 xl:h-20 object-cover rounded-md mr-4 lg:mr-2 xl:mr-3"
                                />
                                <div>
                                  <div className="flex flex-col gap-1 justify-center">
                                    <h3 className={`text-3xl md:text-3xl lg:text-3xl xl:text-3xl font-bold text-[#FF8A00] ${exo2.className}`}>{team ? team.team_name : 'Team Name'}</h3>
                                    {selectedLeague.league_configuration.format === "Classic" &&
                                      <p className="text-sm md:text-base lg:text-sm xl:text-base text-gray-300">Manage your squad and climb the leaderboard!</p>
                                    }
                                  </div>

                                  {selectedLeague.league_configuration.format === "Head to Head" &&
                                    <p className="sm:hidden text-white text-xs md:text-sm lg:text-sm xl:text-base">Current Points:<span className="ml-2">{teamStats?.points || '--'}</span></p>}
                                  {selectedLeague.league_configuration.format === "Head to Head" &&
                                    <div className="sm:hidden flex space-x-1 md:space-x-2 mt-1">
                                      {(teamStats?.form?.replace(/\s/g, '') || '').split('').slice(-5).map((result, idx) => (
                                        <span key={idx} className={`rounded-sm sm:rounded-md lg:rounded-sm w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-sm sm:text-base lg:text-sm xl:text-base justify-center text-white ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : result === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}>{result}</span>
                                      ))}
                                    </div>
                                  }
                                </div>
                              </div>
                              {selectedLeague.league_configuration.format === "Head to Head" &&
                                <div className="hidden sm:flex flex-col items-center justify-center px-4 md:px-6 lg:px-2 py-2 lg:py-1 xl:px-4 xl:py-3 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                                  <p className="text-white text-xs md:text-sm lg:text-sm xl:text-base">Current Points: <span className="ml-2">{teamStats?.points || '--'}</span></p>
                                  <div className="flex space-x-1 md:space-x-2 mt-1">
                                    {(teamStats?.form?.replace(/\s/g, '') || '').split('').slice(-5).map((result, idx) => (
                                      <span key={idx} className={`rounded-md lg:rounded-sm w-5 h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-base lg:text-sm xl:text-base justify-center text-white ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : result === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}>{result}</span>
                                    ))}
                                  </div>
                                </div>
                              }
                            </div>
                            {selectedLeague.league_configuration.format === "Head to Head" &&
                              <div className="z-10">
                                <p className="text-white font-bold text-sm md:text-base lg:text-sm xl:text-base">Next Opponent:</p>
                                <div className="flex items-center mt-2 sm:mt-2 px-3 sm:px-3 md:px-4 py-2 sm:py-2 rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                                  <img
                                    src={opponent?.team_image_path || "/images/default_team_logo.png"}
                                    alt="Opponent Logo"
                                    className="w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 object-cover rounded-full mr-2 sm:mr-4 lg:mr-2 xl:mr-3"
                                  />
                                  <div>
                                    <p className="text-white text-sm md:text-base lg:text-sm xl:text-base">{opponent?.team_name || "TBD"}</p>
                                    <div className="flex space-x-1 md:space-x-2 mt-1 sm:mt-3 lg:mt-1">
                                      {(opponentStats?.form?.replace(/\s/g, '') || '').split('').slice(-5).map((result, idx) => (
                                        <span key={idx} className={`rounded-sm sm:rounded-md lg:rounded-sm w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-sm sm:text-base lg:text-sm justify-center text-white ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : result === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}>{result}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            }
                          </Link>

                          {/* League Table Card */}
                          <Link href={'/league-table'} className={`w-full lg:w-[49.2%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative bg-cover bg-center cursor-pointer hover:inset-0.5 transition-transform ease-in-out`}
                            style={{
                              backgroundImage: "url('/images/matchcenterImage.png')",
                            }}>
                            <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] mb-2 ${exo2.className}`}>LEAGUE TABLE</h3>
                            <p className="text-sm md:text-base lg:text-sm xl:text-base text-gray-300 mb-4">Check where your team stands in the league</p>
                            <div className="p-2 sm:p-4 w-full md:w-[80%] lg:w-[90%] xl:w-[80%] rounded-xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                              <table className="w-full text-white text-sm md:text-sm lg:text-sm xl:text-base">
                                <thead className="border-b border-[#5b5b5b] mb-1">
                                  {selectedLeague.league_configuration.format === "Head to Head" ?
                                    <tr className="text-[#FF8A00] pb-4">
                                      <th className="w-2/5 text-left">Teams</th>
                                      <th className="text-center">Pts</th>
                                      {/* <th className="text-center">P</th> */}
                                      <th className="text-center">W</th>
                                      <th className="text-center">L</th>
                                      <th className="text-center">D</th>
                                      <th className="text-center hidden sm:block">Form</th>
                                    </tr>
                                    :
                                    <tr className="text-[#FF8A00] pb-4">
                                      <th className="w-2/5 text-left">Teams</th>
                                      <th className="text-center">GW{gameweek}</th>
                                      <th className="text-center">Total Points</th>
                                    </tr>
                                  }
                                </thead>
                                <tbody className="pt-4">
                                  {selectedLeague.league_configuration.format === "Head to Head" ?
                                    headToHeadTable && headToHeadTable.sort((a, b) => b.points - a.points).slice(0, 3).map((team, index) => (
                                      <tr key={index}>
                                        <td className="w-2/5 text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base">{team.team.team_name}</td>
                                        <td className="text-center">{team?.points || 0}</td>
                                        {/* <td className="text-center">{team.played || 0}</td> */}
                                        <td className="text-center px-1">{team?.wins || 0}</td>
                                        <td className="text-center px-1">{team?.loses || 0}</td>
                                        <td className="text-center px-1">{team?.draws || 0}</td>
                                        <td className="text-center hidden sm:flex justify-center gap-1">{(team?.form?.replace(/\s/g, '') || '').split('').slice(-5).map((result, idx) => (
                                          <span key={idx} className={`rounded-sm sm:rounded-md lg:rounded-sm w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center text-sm sm:text-base lg:text-sm justify-center text-white ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : result === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}>{result}</span>
                                        ))}</td>
                                      </tr>
                                    ))
                                    :
                                    classicTable && classicTable.sort((a, b) => b.points - a.points).slice(0, 3).map((team, index) => (
                                      <tr key={index}>
                                        <td className="w-2/5 text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base">{team?.team.team_name}</td>
                                        <td className="text-center">{team?.current_points || 0}</td>
                                        <td className="text-center">{team?.total_points || 0}</td>
                                      </tr>
                                    ))
                                  }
                                </tbody>
                              </table>
                            </div>
                          </Link>

                          {/* Transfers Card */}
                          <Link href={'/transfers'} className={`${showUnpaid ? "hidden lg:block" : "block"} w-full lg:w-[32%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative justify-between bg-cover bg-center cursor-pointer hover:inset-0.5 transition-transform ease-in-out`}
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
                          </Link>

                          {/* Match Center Card */}
                          <Link href={'/match-center'} className={`${showUnpaid ? "hidden lg:block" : "block"} w-full lg:w-[32%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative flex flex-col justify-between bg-cover bg-center cursor-pointer hover:inset-0.5 transition-transform ease-in-out`}
                            style={{
                              backgroundImage: "url('/images/gameweekimage.png')",
                            }}>
                            <div className="space-y-4">
                              <h3 className={`text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold text-[#FF8A00] mb-4 lg:mb-1 xl:mb-2 ${exo2.className}`}>MATCH CENTER</h3>
                              {selectedLeague.league_configuration.format === "Classic" &&
                                <p className="text-sm md:text-base lg:text-sm xl:text-base">Track upcoming matches and plan your transfers wisely to maximize points!</p>
                              }
                            </div>
                            {selectedLeague.league_configuration.format === "Head to Head" ?
                              <ul className="w-full text-white space-y-1 h-32 md:h-[75%]">
                                {currentFixtures && currentFixtures?.slice(0, 3).map((fixture, idx) => (
                                  <li key={idx} className="flex items-center justify-between py-1 rounded-md shadow-md">
                                    <div className="flex items-center w-1/2">
                                      <img src={fixture.teams[0]?.team_image_path || "/images/default_team_logo.png"} alt="First Team Logo" className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                                      <span className="text-sm md:text-base lg:text-sm xl:text-base ml-4 lg:ml-1 xl:ml-2">{fixture.teams[0]?.team_name || "Team 1"}</span>
                                    </div>
                                    <span className="text-[#FF8A00] text-base md:text-xl mx-2">v/s</span>
                                    <div className="flex items-center justify-end w-1/2">
                                      <span className="text-sm md:text-base lg:text-sm xl:text-base mr-4 lg:mr-1 xl:mr-2">{fixture.teams[1]?.team_name || "Team 2"}</span>
                                      <img src={fixture.teams[1]?.team_image_path || "/images/default_team_logo.png"} alt="Second Team Logo" className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              :
                              <></>
                            }
                          </Link>

                          {/* Achievements Card */}
                          <Link href={'/achievements'} className={`${showUnpaid ? "hidden lg:block" : "block"} w-full lg:w-[32%] min-h-56 p-4 md:p-6 rounded-3xl shadow-lg relative bg-cover bg-center cursor-pointer hover:inset-0.5 transition-transform ease-in-out`}
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
                          </Link>
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