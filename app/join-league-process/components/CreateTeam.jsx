"use client";

import React, { useEffect, useState } from "react";
import { Exo_2 } from "next/font/google";
import axios from "axios";
import Image from "next/image";
import Slider from "react-slick"; // For carousel functionality
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaImage, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAlert } from "@/components/AlertContext/AlertContext";

const exo2 = Exo_2({
  weight: ["700", "800"],
  style: ["italic"],
  subsets: ["latin"],
});

const CreateTeam = ({ onNext, onBack }) => {
  const [groundImages, setGroundImages] = useState([
    "/images/stadium1.png",
    "/images/stadium2.png",
    "/images/stadium3.png",
    "/images/stadium4.png",
    "/images/stadium5.png",
    "/images/stadium6.png",
    "/images/stadium7.png",
    "/images/stadium8.png",
    "/images/stadium9.png",
    "/images/stadium10.png",
    "/images/stadium11.png",
    "/images/stadium12.png",
    "/images/stadium13.png",
    "/images/stadium14.png",
    "/images/stadium15.png",
    "/images/stadium16.png",
    "/images/stadium17.png",
    "/images/stadium18.png",
    "/images/stadium19.png",
    "/images/stadium20.png",
  ]);

  const savedData =
    JSON.parse(sessionStorage.getItem("joinLeagueTeamData")) || {};
  const [leagueID, setLeagueID] = useState(
    JSON.parse(sessionStorage.getItem("joinLeagueData")).leagueDetails.data
      ._id || null
  );
  const [selectedGrounds, setSelectedGrounds] = useState([]);
  const [teamName, setTeamName] = useState(savedData.teamName || "");
  const [teamLogo, setTeamLogo] = useState(savedData.teamLogo || null);
  const [groundName, setGroundName] = useState(savedData.groundName || "");
  const [selectedGround, setSelectedGround] = useState(
    savedData.selectedGround || "/images/stadium1.png"
  );
  const { addAlert } = useAlert();

  useEffect(() => {
    if (leagueID) {
      try {
        const URL =
          process.env.NEXT_PUBLIC_BACKEND_URL +
          "fantasyleague/join?leagueID=" +
          leagueID;
        axios.get(URL).then((response) => {
          if (response && response.data && response.data.error === false) {
            setSelectedGrounds(response.data.data);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [leagueID]);

  useEffect(() => {
    if (selectedGrounds.length > 0) {
      let newList = [];
      groundImages.map((ground) => {
        if (selectedGrounds.indexOf(ground) === -1) newList.push(ground);
      });
      setGroundImages(newList);
    }
  }, [selectedGrounds]);

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      setTeamLogo(base64Image);
    }
  };

  const handleSubmit = () => {
    // Store data to session storage
    if (!teamName || !groundName || !selectedGround) {
      addAlert("Please fill in all fields before proceeding.", "error");
      return;
    }
    sessionStorage.setItem(
      "joinLeagueTeamData",
      JSON.stringify({ teamName, teamLogo, groundName, selectedGround })
    );
    onNext(); // Move to next step
  };

  const handleBack = () => {
    // Store data to session storage
    sessionStorage.setItem(
      "joinLeagueTeamData",
      JSON.stringify({ teamName, teamLogo, groundName, selectedGround })
    );
    onBack(); // Go back to previous step
  };

  const NextArrow = ({ onClick }) => (
    <div
      className="absolute right-0 top-1/2 transform -translate-y-8 sm:-translate-y-1/2 text-[#FF8A00] text-3xl cursor-pointer hover:text-white z-10"
      onClick={onClick}
    >
      <FaChevronRight />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute left-0 top-1/2 transform -translate-y-8 sm:-translate-y-1/2 text-[#FF8A00] text-3xl cursor-pointer hover:text-white z-10"
      onClick={onClick}
    >
      <FaChevronLeft />
    </div>
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots custom-dots",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="min-h-[88vh] flex flex-col space-y-8 text-white mt-8 px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-24">
      <div className="w-full relative">
        <h1 className={`text-2xl md:text-4xl font-bold ${exo2.className}`}>
          Step 2: Create Your Team
        </h1>
        <p className="my-4 text-sm md:text-base lg:text-lg max-w-3xl">
          Create your team by giving it a name, selecting a home ground, and
          adding a unique logo. The choices you make here will personalize your
          experience and help others identify your team within the league.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="flex flex-col space-y-6 max-w-sm lg:max-w-lg">
            {/* Team Name Input */}
            <div className="flex flex-col">
              <label
                className="font-bold text-sm md:text-lg mb-2"
                htmlFor="team-name"
              >
                Team Name
              </label>
              <input
                id="team-name"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(capitalizeWords(e.target.value))}
                placeholder="Enter your team name"
                className="w-full px-4 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
              />
            </div>
            {/* Ground Name Input */}
            <div className="flex flex-col">
              <label
                className="font-bold text-sm md:text-lg mb-2"
                htmlFor="ground-name"
              >
                Ground Name
              </label>
              <input
                id="ground-name"
                type="text"
                value={groundName}
                onChange={(e) => setGroundName(capitalizeWords(e.target.value))}
                placeholder="Enter the ground name"
                className="w-full px-4 py-2 rounded-lg bg-[#0C1922] border border-[#828282] focus:outline-none focus:border-[#FF8A00] text-white text-sm md:text-base"
              />
            </div>
          </div>

          {/* Team Logo Upload */}
          <div className="flex flex-col space-y-1">
            <label className="font-bold text-sm md:text-lg" htmlFor="team-logo">
              Team Logo
            </label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="team-logo"
                className="cursor-pointer py-2 px-6 rounded-full text-white font-bold text-sm md:text-base border border-[#fff]  hover:bg-[#FF8A00] hover:border-[#FF8A00] transition-all"
              >
                Choose File
              </label>
              <input
                id="team-logo"
                type="file"
                accept="image/png"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-32 h-32 md:w-40 md:h-40 bg-[#0C1922] flex relative items-center justify-center rounded-lg">
                {teamLogo ? (
                  <Image
                    src={teamLogo} // Use base64 URL directly
                    alt="Team Logo"
                    fill
                    className="object-cover object-center rounded-lg"
                  />
                ) : (
                  <FaImage size={50} className="text-[#828282]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ground Selection Carousel */}
        <div className="my-8">
          <label className="font-bold text-sm md:text-lg">Select Ground</label>
          <Slider {...sliderSettings} className="mt-4 px-8 sm:px-10">
            {groundImages.map((ground, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg cursor-pointer ${selectedGround === ground ? "border-4 border-[#FF8A00]" : ""
                  }`}
                onClick={() => setSelectedGround(ground)}
              >
                <div className="relative w-full h-36 sm:h-40 md:h-44 lg:h-40 xl:h-48">
                  <Image
                    src={ground}
                    alt={`Ground ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleBack}
            className={`py-2 px-8 flex items-center md:py-3 md:px-12 rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] text-sm md:text-lg ${exo2.className}`}
          >
            BACK<span className="hidden sm:block">: Join League</span>
          </button>
          <button
            onClick={handleSubmit}
            className={`py-2 px-8 md:py-3 md:px-12 flex items-center rounded-full text-white font-bold fade-gradient hover:bg-[#e77d00] text-sm md:text-lg ${exo2.className}`}
          >
            NEXT<span className="hidden sm:block">: Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
