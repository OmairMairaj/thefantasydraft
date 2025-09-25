"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Exo_2 } from "next/font/google";
import axios from "axios";

const exo2 = Exo_2({
  weight: ["400", "700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

export default function UpcomingGames() {
  const [matches, setMatches] = useState();
  const [gameweekName, setGameweekName] = useState(null);
  const [gameweekDetails, setGameweekDetails] = useState({});
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCurrentGameweek();
  }, []);

  const fetchCurrentGameweek = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}gameweek/current`,
        { cache: "no-store" }
      );
      if (!response.data.error) {
        const currentGameweek = response.data.data;
        setGameweekName(parseInt(currentGameweek.name, 10));
        console.log(currentGameweek);
      }
    } catch (error) {
      console.error("Error fetching current gameweek data:", error);
    }
  };

  useEffect(() => {
    if (gameweekName) {
      fetchMatches(gameweekName);
    }
  }, [gameweekName]);

  const fetchMatches = async (gameweek) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}match?gameweek=${gameweek}`
      );
      setMatches(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching match data:", error);
    }
  };

  const games = [
    {
      id: 1,
      teams: [
        {
          team_name: "FC Barcelona",
          location: "home",
          image_path: "/images/barcelona-logo.svg", // Replace with actual path
        },
        {
          team_name: "Man City",
          location: "away",
          image_path: "/images/man-city-logo.svg", // Replace with actual path
        },
      ],
      state: "Not Started",
      starting_at: "2025-08-15T14:00:00.000Z",
    },
    {
      id: 2,
      teams: [
        {
          team_name: "FC Barcelona",
          location: "home",
          image_path: "/images/barcelona-logo.svg", // Replace with actual path
        },
        {
          team_name: "Man City",
          location: "away",
          image_path: "/images/man-city-logo.svg", // Replace with actual path
        },
      ],
      state: "Not Started",
      starting_at: "2025-08-15T14:00:00.000Z",
    },
    {
      id: 3,
      teams: [
        {
          team_name: "FC Barcelona",
          location: "home",
          image_path: "/images/barcelona-logo.svg", // Replace with actual path
        },
        {
          team_name: "Man City",
          location: "away",
          image_path: "/images/man-city-logo.svg", // Replace with actual path
        },
      ],
      state: "Not Started",
      starting_at: "2025-08-15T14:00:00.000Z",
    },
    {
      id: 4,
      teams: [
        {
          team_name: "FC Barcelona",
          location: "home",
          image_path: "/images/barcelona-logo.svg", // Replace with actual path
        },
        {
          team_name: "Man City",
          location: "away",
          image_path: "/images/man-city-logo.svg", // Replace with actual path
        },
      ],
      state: "Not Started",
      starting_at: "2025-08-15T14:00:00.000Z",
    },
    {
      id: 5,
      teams: [
        {
          team_name: "FC Barcelona",
          location: "home",
          image_path: "/images/barcelona-logo.svg", // Replace with actual path
        },
        {
          team_name: "Man City",
          location: "away",
          image_path: "/images/man-city-logo.svg", // Replace with actual path
        },
      ],
      state: "Not Started",
      starting_at: "2025-08-15T14:00:00.000Z",
    },
    {
      id: 6,
      teams: [
        {
          team_name: "FC Barcelona",
          location: "home",
          image_path: "/images/barcelona-logo.svg", // Replace with actual path
        },
        {
          team_name: "Man City",
          location: "away",
          image_path: "/images/man-city-logo.svg", // Replace with actual path
        },
      ],
      state: "Not Started",
      starting_at: "2025-08-15T14:00:00.000Z",
    },
    // Add more games here as needed
  ];

  return (
    <section className="upcoming-games-section py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="mx-0">
        {/* Section Title */}
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center ${exo2.className}`}
        >
          UPCOMING GAME WEEKS
        </h2>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {(matches || games).slice(0, 6).map((game) => {
            const homeTeam = game.teams.find(
              (team) => team.location === "home"
            );
            const awayTeam = game.teams.find(
              (team) => team.location === "away"
            );
            return (
              <div
                key={game.id}
                className="bg-[#070E13] rounded-xl text-center space-y-4 pb-3 lg:pb-3"
              >
                {/* Teams Logos and VS */}
                <div className="flex justify-between items-center">
                  {/* Home Team */}
                  <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-r from-[#0C192200] to-[#0C1922] w-full max-w-[40%]">
                    <Image
                      src={homeTeam.image_path}
                      alt={homeTeam.team_name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                    <span className="text-white mt-2 text-sm md:text-base">
                      {homeTeam.team_name}
                    </span>
                  </div>

                  {/* VS */}
                  <div
                    className={`flex justify-center items-center w-8 h-12 xl:w-8 xl:h-12 text-2xl xl:text-3xl relative ${exo2.className}`}
                  >
                    <span className="absolute text-[#FF8A00] font-bold top-[0.2rem] xl:top-[-0.4rem] left-0">
                      V
                    </span>
                    <span className="absolute text-[#FF8A00] font-bold top-[0.8rem] xl:top-[0.4rem] left-3 xl:left-4">
                      S
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center py-4 rounded-xl bg-gradient-to-l from-[#0C192200] to-[#0C1922] w-full max-w-[40%]">
                    <Image
                      src={awayTeam.image_path}
                      alt={awayTeam.team_name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                    <span className="text-white mt-2 text-sm md:text-base">
                      {awayTeam.team_name}
                    </span>
                  </div>
                </div>

                {/* Game Date and Time */}
                <div
                  className={`text-[#FF8A00] text-sm sm:text-base md:text-lg ${exo2.className}`}
                >
                  {game.state !== "Not Started"
                    ? `${game.scores.find(
                      (score) =>
                        score.score_type_name === "Current" &&
                        score.team_id === homeTeam?.team_id
                    )?.goals ?? 0
                    } - ${game.scores.find(
                      (score) =>
                        score.score_type_name === "Current" &&
                        score.team_id === awayTeam?.team_id
                    )?.goals ?? 0
                    }`
                    : new Date(game.starting_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      weekday: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
