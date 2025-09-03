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
    weight: ['400', '500', '600', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Achievements = () => {
    const router = useRouter();
    const { addAlert } = useAlert();
    const [user, setUser] = useState(null);
    const [leagueId, setLeagueId] = useState(null);
    const [leagueData, setLeagueData] = useState(null);
    const [userTeam, setUserTeam] = useState(null);
    const [leagueTeams, setLeagueTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const achievements = [
        { id: 1, name: "UNSTOPPABLE", description: "Win 8 matches in a row.", image: "/images/achievements/unstoppable.png", unlocked: true },
        { id: 2, name: "KING", description: "Win a draft league.", image: "/images/achievements/king.png", unlocked: true },
        { id: 3, name: "TACTICIAN", description: "Score 15+ points by a player picked up this week.", image: "/images/achievements/tactician.png", unlocked: true },
        { id: 4, name: "BIN MAN", description: "Lose a draft league.", image: "/images/achievements/binman.png", unlocked: false },
        { id: 5, name: "DESTROYER", description: "Double your opponent's score in a single gameweek.", image: "/images/achievements/destroyer.png", unlocked: true },
        { id: 6, name: "PIRATE", description: "Pick up 5 players dropped last week.", image: "/images/achievements/pirate.png", unlocked: true },
        { id: 7, name: "ICEMAN", description: "Lead for 30 weeks out of 38.", image: "/images/achievements/iceman.png", unlocked: true },
        { id: 8, name: "MIXOLOGIST", description: "Win a game with 11 players from different teams.", image: "/images/achievements/mixologist.png", unlocked: true },
        { id: 9, name: "ROCKETMAN", description: "Get 2000+ points in a season.", image: "/images/achievements/rocketman.png", unlocked: true },
        { id: 10, name: "FORTRESS", description: "Win a gameweek with 6 clean sheets.", image: "/images/achievements/fortress.png", unlocked: true },
        { id: 11, name: "GUARDIAN", description: "22 keeper clean sheets.", image: "/images/achievements/guardian.png", unlocked: true },
        { id: 12, name: "POLITICIAN", description: "Draw 4 matches.", image: "/images/achievements/politician.png", unlocked: true },
        { id: 13, name: "PUNCH BAG", description: "Lose 8 matches in a row.", image: "/images/achievements/punchbag.png", unlocked: true },
        { id: 14, name: "TARGETMAN", description: "Score 8 goals in a gameweek.", image: "/images/achievements/targetman.png", unlocked: true },
        { id: 15, name: "THE WALL", description: "3 clean sheets from players of same team.", image: "/images/achievements/thewall.png", unlocked: true },
        { id: 16, name: "EARLY BIRD", description: "Drafted for the 25/26 season.", image: "/images/achievements/earlybird.png", unlocked: true },
        { id: 17, name: "THE CLIMBER", description: "Promoted from a super league.", image: "/images/achievements/climber.png", unlocked: true },
        { id: 18, name: "LUCKY", description: "Win a match by 1 point three times.", image: "/images/achievements/lucky.png", unlocked: true },
        { id: 19, name: "DREAMCATCHER", description: "Pick up the same player 4 times.", image: "/images/achievements/dreamcatcher.png", unlocked: true },
        { id: 20, name: "THE BEAST", description: "21+ points from a defender.", image: "/images/achievements/beast.png", unlocked: true },
        { id: 21, name: "THE BOTTLER", description: "Lose a draft on the final day.", image: "/images/achievements/bottler.png", unlocked: true },
        { id: 22, name: "THE GHOST", description: "Go 3 weeks without a transfer.", image: "/images/achievements/ghost.png", unlocked: true },
        { id: 23, name: "THE REAPER", description: "Beat a player in every matchup.", image: "/images/achievements/reaper.png", unlocked: true },
        { id: 24, name: "THE CUPSMITH", description: "Win a cup.", image: "/images/achievements/cupsmith.png", unlocked: true },
        { id: 25, name: "THE GOAT", description: "Win 2 consecutive draft leagues.", image: "/images/achievements/goat.png", unlocked: true },
        { id: 26, name: "THE WIZARD", description: "Average score of 50 per week.", image: "/images/achievements/wizard.png", unlocked: true },
        { id: 27, name: "THE WOUNDED", description: "Lose 3 games with second highest weekly score.", image: "/images/achievements/wounded.png", unlocked: true },
        { id: 28, name: "THE LOYAL", description: "Keep 12 of your original 15 players all season.", image: "/images/achievements/loyal.png", unlocked: true },
        { id: 29, name: "THE SAVAGE", description: "Beat every player in the league in a row.", image: "/images/achievements/savage.png", unlocked: true },
        { id: 30, name: "THE TINKERMAN", description: "Make 7 transfers in a single deadline.", image: "/images/achievements/tinkerman.png", unlocked: true },
        { id: 31, name: "THE COLLECTOR", description: "Make over 200 transfers.", image: "/images/achievements/collector.png", unlocked: true },
        { id: 32, name: "THE CLOWN", description: "Drop 2 players who score next week.", image: "/images/achievements/clown.png", unlocked: true },
        { id: 33, name: "THE RETURNED", description: "Promoted after being relegated.", image: "/images/achievements/returned.png", unlocked: true },
        { id: 34, name: "THE NUKE", description: "Score 26+ points with a single player.", image: "/images/achievements/nuke.png", unlocked: true },
        { id: 35, name: "THE GREMLIN", description: "Win 3 games with second lowest score.", image: "/images/achievements/gremlin.png", unlocked: true },
        { id: 36, name: "THE RELAXED", description: "25+ points from subs in a gameweek.", image: "/images/achievements/relaxed.png", unlocked: true },
        { id: 37, name: "THE DROWNED", description: "Score less than 15 points in a single gameweek.", image: "/images/achievements/drowned.png", unlocked: true },
        { id: 38, name: "THE RAT", description: "Avoid last place on the final day.", image: "/images/achievements/rat.png", unlocked: true },
        { id: 39, name: "THE COWBOY", description: "Pick up 2 players who score 1 point each in a gameweek.", image: "/images/achievements/cowboy.png", unlocked: true },
        { id: 40, name: "THE SPINELESS", description: "Lose a league by 12 or more points.", image: "/images/achievements/spineless.png", unlocked: true },
        { id: 41, name: "THE SNAKE", description: "Have a player from each position score 10+ points in a single week", image: "/images/achievements/snake.png", unlocked: true }, // Description unclear
    ];


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
                // fetchCurrentGameweek();
                console.log(userData.user.email);

                // Check if selectedLeagueID is in sessionStorage
                const storedLeagueID = sessionStorage.getItem("selectedLeagueID");
                if (storedLeagueID) {
                    setLeagueId(storedLeagueID); // Temporarily set league with just ID
                }
            }
        }
    }, []);

    useEffect(() => {
        if (user?.email && leagueId) {
            fetchUserTeamForLeague(user.email, leagueId);
        }
    }, [user, leagueId]);

    const fetchUserTeamForLeague = async (userEmail, leagueId) => {
        try {
            // Step 1: Get League Data
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `fantasyleague?leagueId=${leagueId}`);

            if (response.data && !response.data.error) {
                const league = response.data.data;
                setLeagueData(league);
                console.log(`League Data (leagueData): `, response.data.data);

                if (league) {
                    // Step 2: Find the user's team in the league
                    const userTeam = league.teams.find(team => team.user_email === userEmail);

                    if (userTeam) {
                        // Step 4: Fetch the fantasy team details using teamId
                        console.log("User's Team: ", userTeam.team);
                        setUserTeam(userTeam.team);
                        // fetchTeamDetails(userTeam.team._id);


                    } else {
                        console.error("No team found for the user in this league.");
                        addAlert("No team found for the selected league.", "error");
                    }

                    const teams = league.teams;
                    console.log("League Teams: ", teams);
                    setLeagueTeams(teams);
                } else {
                    console.error("No matching league found.");
                    addAlert("No matching league found.", "error");
                }
            } else {
                console.error("Error fetching league Data: ", response.data.message);
                addAlert(response.data.message, "error");
            }
        } catch (error) {
            console.error('Error fetching league:', error);
            addAlert("An error occurred while fetching league.", "error");
        }
    };

    useEffect(() => {
        if (leagueId && user && leagueData && userTeam) {
            setLoading(false);
        }
    }
        , [leagueId, user, leagueData, userTeam]);


    if (loading) return (
        <div className="w-full min-h-[70vh] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className={`min-h-[88vh] flex flex-col my-8 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className} `}>
            <h1 className="text-4xl font-bold mb-6">ACHIEVEMENTS</h1>
            {loading ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Team Info Box */}
                    < div className="bg-[#0C1922] rounded-lg p-6 flex flex-col mb-6">
                        <div className="flex items-center space-y-2 justify-between">
                            <div className="flex space-x-4 items-center">
                                <div className="rounded-md">
                                    <img
                                        src={userTeam?.team_image_path || "/default_team_image.png"}
                                        alt="League Logo"
                                        className="w-16 h-16 object-cover rounded-lg sm:w-20 sm:h-20 md:w-32 md:h-32"
                                    />
                                </div>
                                <div className="h-full flex flex-col justify-center ">
                                    <h2 className="text-4xl font-bold uppercase">{userTeam.team_name}</h2>
                                    <p className="text-2xl text-gray-400">{leagueData?.league_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-right">
                                <div className="flex flex-col">
                                    <h3 className="text-5xl font-bold">7<span className="text-3xl">/40</span></h3>
                                    <p className="text-xl text-gray-400">Acquired</p>
                                </div>
                                <img src="/images/medal.png" alt="Medal" className="w-16 h-16 object-cover rounded-lg sm:w-20 sm:h-20 md:w-32 md:h-32" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-2xl my-6">Achievements Unlocked</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 rounded-lg">
                                {achievements.map((ach, i) => (
                                    <div className="flex flex-col items-center relative group" key={i}>
                                        <div
                                            key={ach.id}
                                            className={`aspect-[5/3] w-full rounded-md overflow-hidden flex items-center justify-center relative  shadow-md ${ach.unlocked ? 'bg-[#1a1a1a]' : 'bg-[#2e2e2e] opacity-40'}`}
                                        >
                                            <img
                                                src={ach.image}
                                                alt={ach.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {!ach.unlocked && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-xs px-2 text-center">
                                                    Locked
                                                </div>
                                            )}

                                        </div>
                                        <h3 className="text-lg font-semibold mt-0">{ach.name}</h3>
                                        <div className="absolute bottom-1/2 mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs sm:text-sm bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-[80%] text-center pointer-events-none">
                                            {ach.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div >
    )
}

export default Achievements