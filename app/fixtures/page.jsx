"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Exo_2 } from "next/font/google";
import { useAlert } from "@/components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const Fixtures = () => {
  const [matches, setMatches] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const [gameweekName, setGameweekName] = useState(null);
  const [gameweekDetails, setGameweekDetails] = useState({});
  const { addAlert } = useAlert();

  useEffect(() => {
    // Check if user is authenticated
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userData) {
      router.push("/login");
    } else {
      fetchCurrentGameweek();
    }
  }, []);

  useEffect(() => {
    if (gameweekName) {
      console.log("Fetching data for gameweek: ", gameweekName);
      fetchMatches(gameweekName);
      fetchGameweekDetails(gameweekName);
    }
  }, [gameweekName]);

  const fetchCurrentGameweek = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gameweek/current`,{ cache: 'no-store' })
      .then((response) => {
        console.log("current")
        console.log(response)
        if (!response.data.error) {
          const currentGameweek = response.data.data;
          console.log(currentGameweek);
          if (currentGameweek) {
            setGameweekName(parseInt(currentGameweek.name, 10)); // Convert gameweek name to integer
            setGameweekDetails(currentGameweek);
            fetchTotalGameweeks();
          }
        }
        else {
          addAlert(response.data.message, "error");
          console.log(response.data.message);
        }
      })
      .catch((err) =>
        console.error("Error fetching current gameweek data: ", err)
      );
  };

  const fetchTotalGameweeks = () => {
    axios
      .get(`/api/gameweek/count`)
      .then((response) => {
        setTotalPages(response.data.totalGameweeks);
        console.log("Total gameweeks: ", response.data.totalGameweeks);
      })
      .catch((err) => console.error("Error fetching total gameweeks: ", err));
  };

  const fetchMatches = (gameweek) => {
    axios
      .get(`/api/match?gameweek=${gameweek}`)
      .then((response) => {
        setMatches(response.data.data);
        console.log(response.data.data);
      })
      .catch((err) => console.error("Error fetching match data: ", err));
  };

  const fetchGameweekDetails = (gameweek) => {
    axios
      .get(`/api/gameweek/${gameweek}`)
      .then((response) => {
        console.log(response.data.data);
        setGameweekDetails(response.data.data);
      })
      .catch((err) => console.error("Error fetching gameweek data: ", err));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setGameweekName(newPage);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center space-y-8">
      <div className="w-full max-w-5xl px-6 sm:px-20 my-20">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${exo2.className}`}
        >
          Gameweek {gameweekName ? `- ${gameweekName}` : null}
        </h2>
        <div className="text-sm sm:text-base md:text-lg mb-10 text-gray-300">
          {gameweekDetails?.starting_at && (
            <p>{`Starting at: ${new Date(
              gameweekDetails.starting_at
            ).toLocaleString('en-US', {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
            })}`}</p>
          )}
          {/* {gameweekDetails?.finished && gameweekDetails?.ending_at && (
                        <p>{`Ending at: ${new Date(gameweekDetails.ending_at).toLocaleString()}`}</p>
                    )} */}
        </div>
        <div className="overflow-x-auto">
          {matches && matches.length > 0 ? (
            <div className="min-w-full text-white">
              <div
                className={`flex flex-row justify-between border-b border-gray-600 ${exo2.className} text-xs sm:text-sm md:text-lg lg:text-xl`}
              >
                <h1 className="w-2/5 py-2 px-4 text-center font-bold text-white">
                  Home
                </h1>
                <h1 className="w-1/5 py-2 px-4 text-center font-bold text-white">
                  Score/Time
                </h1>
                <h1 className="w-2/5 py-2 px-4 text-center font-bold text-white">
                  Away
                </h1>
              </div>
              <div>
                {matches.map((match) =>
                  match.teams && match.teams.length > 0 ? (
                    <div
                      key={match.id}
                      className="border-b border-gray-600 items-center flex flex-row justify-between text-xs sm:text-sm md:text-lg lg:text-xl"
                    >
                      <div className="h-full w-2/5 py-3 sm:py-4 md:py-6 flex items-center justify-start">
                        <img
                          src={match.teams[0]?.image_path}
                          alt={match.teams[0]?.team_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14"
                        />
                        <div className="px-2 sm:px-3 md:px-5">
                          {match.teams[0]?.team_name || "N/A"}
                        </div>
                      </div>
                      <div className="h-full w-1/5 py-3 sm:py-4 md:py-6 text-center">
                        {match.state !== "Not Started"
                          ? `${match.scores.find(
                            (score) =>
                              score.score_type_name === "Current" &&
                              score.team_id === match.teams[0]?.team_id
                          )?.goals ?? 0
                          } - ${match.scores.find(
                            (score) =>
                              score.score_type_name === "Current" &&
                              score.team_id === match.teams[1]?.team_id
                          )?.goals ?? 0
                          }`
                          : new Date(match.starting_at).toLocaleString('en-US', {
                            timeZone: 'Australia/Brisbane', //Keeping this to cancel out the UK GMT
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                      </div>
                      <div className="h-full py-3 sm:py-4 md:py-6 w-2/5 flex items-center justify-end">
                        <div className="px-2 sm:px-3 md:px-5 text-right">
                          {match.teams[1]?.team_name || "N/A"}
                        </div>
                        <img
                          src={match.teams[1]?.image_path}
                          alt={match.teams[1]?.team_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14"
                        />
                      </div>
                    </div>
                  ) : (
                    <div key={match.id} className="py-4 text-center">
                      No teams found for this match
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-white">Loading matches...</p>
          )}
        </div>
        <div className="flex justify-between mt-4 items-center">
          <button
            onClick={() => handlePageChange(gameweekName - 1)}
            disabled={gameweekName === 1}
            className="bg-orange-500 text-white py-2 w-28 sm:w-36 md:w-40 rounded-lg hover:bg-orange-400 disabled:opacity-50 text-xs sm:text-sm md:text-lg"
          >
            Previous
          </button>
          <span className="text-white text-xs sm:text-sm md:text-lg text-center flex-grow">
            Gameweek {gameweekName} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(gameweekName + 1)}
            disabled={gameweekName === totalPages}
            className="bg-orange-500 text-white py-2 w-28 sm:w-36 md:w-40 rounded-lg hover:bg-orange-400 disabled:opacity-50 text-xs sm:text-sm md:text-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fixtures;
