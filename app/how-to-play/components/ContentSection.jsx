'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Optional if you're linking to other sections
import { Exo_2 } from 'next/font/google';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });
import { Gi3dHammer } from "react-icons/gi";
import { FaStaffSnake } from "react-icons/fa6";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { TbExchange } from "react-icons/tb";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { AiOutlineQuestion } from "react-icons/ai";


const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic', 'normal'],
    subsets: ['latin'],
});

const ContentSection = () => {
    const [activeSection, setActiveSection] = useState(0);

    const handlePrev = () => {
        setActiveSection(activeSection - 1);
    }

    const handleNext = () => {
        setActiveSection(activeSection + 1);
    }

    return (
        <section className=" pt-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="sidebar md:sticky top-20 xl:p-6 rounded-lg shadow-lg h-screen overflow-y-auto">
                    {/* Sidebar Sections */}
                    <div className="mb-8">
                        <h2 className={`text-xl text-white mb-4 italic ${exo2.className}`}>Get Started</h2>
                        <ul className="space-y-2">
                            <li
                                className={`text-xl py-2 px-4 rounded-lg cursor-pointer italic ${exo2.className} ${activeSection === 0 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(0)}
                            >
                                Welcome
                            </li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className={`text-xl text-white mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <ul className="space-y-2">
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 1 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(1)}
                            >
                                <Gi3dHammer className="inline-block text-2xl mr-2" />
                                Auction Draft
                            </li>
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 2 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(2)}
                            >
                                <FaStaffSnake className="inline-block mr-2" />
                                Snake Draft
                            </li>
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 3 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(3)}
                            >
                                <MdOutlineInsertChartOutlined className="inline-block mr-2" />
                                Points
                            </li>
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 4 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(4)}
                            >
                                <FaUsersBetweenLines className="inline-block mr-2" />
                                Set Your Lineup
                            </li>
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 5 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(5)}
                            >
                                <TbExchange className="inline-block mr-2" />
                                Transfers
                            </li>
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 6 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(6)}
                            >
                                <AiOutlineSafetyCertificate className="inline-block mr-2" />
                                Waivers
                            </li>
                            <li
                                className={`text-xl py-2 lg:px-4 rounded-lg cursor-pointer flex items-center italic ${exo2.className} ${activeSection === 7 ? 'bg-[#FF8A0030] text-[#FF8A00]' : 'hover:bg-[#95959525] text-[#898989]'}`}
                                onClick={() => setActiveSection(7)}
                            >
                                <AiOutlineQuestion className="inline-block mr-2" />
                                FAQ
                            </li>
                            {/* Add more sections as needed */}
                        </ul>
                    </div>
                </div>

                {/* Main Content */}




                {activeSection === 0 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <div className='flex flex-col '>
                            <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>Get Started</h2>
                            <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Welcome</h3>
                            <p className="text-lg leading-relaxed mb-8">
                                Draft Fantasy is the home of draft fantasy football (soccer). We offer games for the English Premier League and Euro 2024, with more leagues coming soon.
                            </p>
                        </div>
                        <div className='flex flex-col'>
                            <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>What is a draft?</h3>
                            <p className="text-lg leading-relaxed mb-8">
                                We offer two types of drafts: Auction and Snake. In both formats each team is unique, but the difference is how players are picked.
                            </p>
                        </div>
                        <div className='flex flex-col'>
                            <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Demo</h3>
                            <div className='rounded-3xl lg:w-11/12 xl:w-2/3 overflow-hidden'>
                                <ReactPlayer
                                    url="https://www.youtube.com/watch?v=4W48aPtf7Ec&embeds_referring_euri=https%3A%2F%2Fdocs.draftfantasy.com%2F&source_ve_path=OTY3MTQ" // Replace with your actual video URL
                                    width="100%"
                                    controls={true}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                        <div className='flex flex-row justify-end mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                Auction Draft <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 1 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Auction Draft</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            How auction drafts work
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            In an auction draft each team has a £250 budget.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            On each turn there's a nomination phase, and a bidding phase.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            In the nomination phase, the selected manager chooses a player to nominate for the auction.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            They nominator automatically bids £1 for the player, and then there's a period of time (typically 30 seconds) where managers can bid on players. The manager that makes the highest bid wins the player, and the amount paid is subtracted from their balance.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            The draft continues until everyone in the league has a full team of players (typically 15 players per team).
                        </p>
                        <h3 className={`text-4xl font-bold text-white mb-4 mt-8 italic ${exo2.className}`}>Max bids</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            You can set max bids before or during the draft.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            This is the most you are willing to pay for a player. We will automatically bid up to this amount for you. But we will only ever bid £1 more than the previous highest bid up to the maximum you have set. You can continue to bid manually even after the maximum bid has been reached. But we won’t automatically bid for you after this point.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            For example, if you set a max bid of £80 for a player, and someone else bids £50, we will automatically bid £51 for you. But if someone bids £80, we will no longer bid for you.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            In the event that two players have a set maximum bids for a player, we will automatically bid up to the second highest bid and add £1.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            For example, if you have a max bid of £80 for a player, and someone else has a max bid of £70, we will automatically bid £71 for you.
                        </p>
                        <h3 className={`text-4xl font-bold text-white mb-4 mt-8 italic ${exo2.className}`}>Time per pick</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            The time per pick is set for each league. It’s typically 30 seconds. But there will be a minimum of 10 seconds after any bid is made.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            For example, if you make a bid with 20 seconds remaining, the clock will continue to count down from 20 seconds. But if you make a bid with 3 seconds remaining, we will reset the clock to 10 seconds so that everyone has enough time to make a higher bid.
                        </p>
                        <h3 className={`text-4xl font-bold text-white mb-4 mt-8 italic ${exo2.className}`}>When the clock runs out</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            If the clock runs out in the nomination phase, we will automatically pick a player for the nominator.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            This will be as follows:
                        </p>
                        <ul className="ml-5 list-disc">
                            <li className="text-lg leading-relaxed mb-4">
                                The player with the highest max bid, that they are still able to pick.
                            </li>
                            <li className="text-lg leading-relaxed mb-4">
                                The player with the highest rating (as set by Draft Fantasy).
                            </li>
                        </ul>
                        <p className="text-lg leading-relaxed mb-4">
                            When the clock runs out in the bidding phase, the team with the highest bid wins the player.
                        </p>
                        <h3 className={`text-4xl font-bold text-white mb-4 mt-8 italic ${exo2.className}`}>Remaining budget</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            There is no benefit to having budget left after the auction. The budget is only used for the draft and has no purpose after the draft is complete.
                        </p>
                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Welcome
                            </button>
                            <button className={`text-white flex items-center justify-end  hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                Snake Draft <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 2 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Snake Draft</h3>

                        {/* How to Play Snake Draft */}
                        <p className="text-lg leading-relaxed mb-4">
                            In a snake draft, managers pick players one at a time. You can pick any unpicked player as long as the player fits into the squad constraints for the league.
                        </p>

                        <p className="text-lg leading-relaxed mb-4">
                            Each round, the bidding order is reversed, hence the name “Snake Draft”.
                        </p>

                        {/* Round Example */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Draft Order Example</h3>
                        <p className="text-lg leading-relaxed mb-4">The order in a 5 person snake draft is as follows:</p>

                        {/* Round 1 */}
                        <h4 className={`text-3xl font-bold text-white mb-4 italic ${exo2.className}`}>Round 1</h4>
                        <ul className="text-lg leading-relaxed mb-4 ml-6">
                            <li>Manager 1 picks a player.</li>
                            <li>Manager 2 picks a player.</li>
                            <li>Manager 3 picks a player.</li>
                            <li>Manager 4 picks a player.</li>
                            <li>Manager 5 picks a player.</li>
                        </ul>

                        {/* Round 2 */}
                        <h4 className={`text-3xl font-bold text-white mb-4 italic ${exo2.className}`}>Round 2</h4>
                        <ul className="text-lg leading-relaxed mb-4 ml-6">
                            <li>Manager 5 picks a player.</li>
                            <li>Manager 4 picks a player.</li>
                            <li>Manager 3 picks a player.</li>
                            <li>Manager 2 picks a player.</li>
                            <li>Manager 1 picks a player.</li>
                        </ul>

                        {/* Round 3 */}
                        <h4 className={`text-3xl font-bold text-white mb-4 italic ${exo2.className}`}>Round 3</h4>
                        <ul className="text-lg leading-relaxed mb-4 ml-6">
                            <li>Manager 1 picks a player.</li>
                            <li>Manager 2 picks a player.</li>
                            <li>Manager 3 picks a player.</li>
                            <li>Manager 4 picks a player.</li>
                            <li>Manager 5 picks a player.</li>
                        </ul>

                        <p className="text-lg leading-relaxed mb-4">
                            Typically there are 15 rounds of picks, at which point the draft is complete.
                        </p>

                        {/* Auto Picks */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Auto Picks</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            If you run out of time, your autopick list is used to pick the next player for you. You can also use the autopick list as a shortlist to pick from during the draft.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            Offline managers aren't automatically autopicked, which did happen in previous versions of Draft Fantasy. The league admin can decide to end picking early for a manager by clicking “Force Pick” in the admin section at the top of the draft page.
                        </p>

                        {/* League Admin */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>League Admin</h3>
                        <p className="text-lg leading-relaxed mb-4">The league admin section is located at the top of the draft page and is only visible to the league admin.</p>
                        <p className="text-lg leading-relaxed mb-4">The league admin can end a user's turn before the timer runs out by cpcking “Force Pick”.</p>
                        <p className="text-lg leading-relaxed mb-4">The league admin can pause the draft.</p>
                        <p className="text-lg leading-relaxed mb-4">The league admin can restart the draft.</p>
                        <p className="text-lg leading-relaxed mb-4">The league admin can change the draft order before the draft starts.</p>
                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Auction Draft
                            </button>
                            <button className={`text-white flex items-center justify-end  hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                Points <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 3 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Points</h3>

                        {/* How You Score Points */}
                        <p className="text-lg leading-relaxed mb-4">
                            You can view scoring options for your league by visiting the Settings page for your league. You can find a link to this page on the dashboard. The default scoring system is shown below but you can customise to your needs.
                        </p>

                        {/* Default Scoring for Premier League */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Default scoring for Premier League</h3>
                        <div className="overflow-x-auto mb-8">
                            <table className="table-auto w-full text-left text-lg">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="px-4 py-2 font-semibold text-white">Stat</th>
                                        <th className="px-4 py-2 font-semibold text-white text-center">Goalkeeper</th>
                                        <th className="px-4 py-2 font-semibold text-white text-center">Defender</th>
                                        <th className="px-4 py-2 font-semibold text-white text-center">Midfielder</th>
                                        <th className="px-4 py-2 font-semibold text-white text-center">Forward</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Less than 60 mins played</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">60+ mins played</td>
                                        <td className="px-4 py-2 text-center">2</td>
                                        <td className="px-4 py-2 text-center">2</td>
                                        <td className="px-4 py-2 text-center">2</td>
                                        <td className="px-4 py-2 text-center">2</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Goal scored</td>
                                        <td className="px-4 py-2 text-center">10</td>
                                        <td className="px-4 py-2 text-center">6</td>
                                        <td className="px-4 py-2 text-center">5</td>
                                        <td className="px-4 py-2 text-center">4</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Assist</td>
                                        <td className="px-4 py-2 text-center">3</td>
                                        <td className="px-4 py-2 text-center">3</td>
                                        <td className="px-4 py-2 text-center">3</td>
                                        <td className="px-4 py-2 text-center">3</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Goal conceded</td>
                                        <td className="px-4 py-2 text-center">-1 per 2 conceded</td>
                                        <td className="px-4 py-2 text-center">-1 per 2 conceded</td>
                                        <td className="px-4 py-2 text-center">0</td>
                                        <td className="px-4 py-2 text-center">0</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Clean sheet</td>
                                        <td className="px-4 py-2 text-center">4</td>
                                        <td className="px-4 py-2 text-center">4</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                        <td className="px-4 py-2 text-center">0</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Yellow card</td>
                                        <td className="px-4 py-2 text-center">-1</td>
                                        <td className="px-4 py-2 text-center">-1</td>
                                        <td className="px-4 py-2 text-center">-1</td>
                                        <td className="px-4 py-2 text-center">-1</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Red card</td>
                                        <td className="px-4 py-2 text-center">-3</td>
                                        <td className="px-4 py-2 text-center">-3</td>
                                        <td className="px-4 py-2 text-center">-3</td>
                                        <td className="px-4 py-2 text-center">-3</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>



                        {/* Custom Scoring */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Custom scoring</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            To change the scoring system, visit the league Settings page, click Edit, and then click Edit Custom Scoring.
                            You will need to be the league admin to make changes.
                        </p>

                        {/* Bonus Points */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Bonus Points</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            1-3 points are awarded to the players that receive the most BPS (Bonus Points System) in a match. Bonus point ties are resolved as follows:
                        </p>

                        <ul className="list-disc text-lg leading-relaxed mb-4 ml-5">
                            <li>If there is a tie for first place, Players 1 & 2 will receive 3 points each and Player 3 will receive 1 point.</li>
                            <li>If there is a tie for second place, Player 1 will receive 3 points and Players 2 and 3 will receive 2 points each.</li>
                            <li>If there is a tie for third place, Player 1 will receive 3 points, Player 2 will receive 2 points and Players 3 & 4 will receive 1 point each.</li>
                        </ul>

                        <p className="text-lg leading-relaxed mb-4">
                            BPS is calculated based on different actions such as goals, assists, clean sheets, and other player statistics.
                        </p>

                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Snake Draft
                            </button>
                            <button className={`text-white flex items-center justify-end  hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                Set Your Lineup <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 4 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Set Your Lineup</h3>

                        {/* How to Set Your Lineup */}
                        <p className="text-lg leading-relaxed mb-4">
                            To set your team, click on the Team page on the dashboard.
                        </p>

                        {/* Valid Formations */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Valid Formations</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            The default formations allowed are:
                        </p>

                        {/* Table for Valid Formations */}
                        <div className="overflow-x-auto mb-8 w-1/2">
                            <table className="table-auto w-full text-left text-lg">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="px-4 py-2 font-semibold text-white">Position</th>
                                        <th className="px-4 py-2 font-semibold text-white text-center">Minimum</th>
                                        <th className="px-4 py-2 font-semibold text-white text-center">Maximum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Goalkeepers</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Defenders</td>
                                        <td className="px-4 py-2 text-center">3</td>
                                        <td className="px-4 py-2 text-center">5</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Midfielders</td>
                                        <td className="px-4 py-2 text-center">2</td>
                                        <td className="px-4 py-2 text-center">5</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="px-4 py-2">Forwards</td>
                                        <td className="px-4 py-2 text-center">1</td>
                                        <td className="px-4 py-2 text-center">3</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="text-lg leading-relaxed mb-4">
                            So for example, a 4-3-3 formation is valid, but a 6-3-1 formation is not, because more than 5 defenders are not allowed.
                        </p>

                        <p className="text-lg leading-relaxed mb-4">
                            The allowed formations can also be customized by the league admin. To view the formation rules for your league, visit the Settings page from the dashboard.
                        </p>

                        {/* Substitutes */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Substitutes</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            If a player in your starting lineup doesn’t play, they are automatically replaced with a player from your substitutes.
                        </p>

                        <p className="text-lg leading-relaxed mb-4">
                            The order of your substitutes matters. We will pick the first player in the list of substitutes (left-most in Pitch view).
                        </p>

                        <p className="text-lg leading-relaxed mb-4">
                            The formation constraints must still match. So we won’t replace a defender that hasn’t played with a goalkeeper if that leads to having 2 goalkeepers in the lineup.
                        </p>

                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Points
                            </button>
                            <button className={`text-white flex items-center justify-end  hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                Transfers <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 5 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Transfers</h3>

                        {/* Intro */}
                        <p className="text-lg leading-relaxed mb-4">
                            Go to the Transfers page to make a trade.
                        </p>

                        {/* Types of Transfers */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Types of Transfers</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            There are 3 types of transfers:
                        </p>

                        <ul className="list-disc ml-6 text-lg leading-relaxed mb-4">
                            <li>
                                <strong className='text-white'>Free: </strong> No one owns the player. The trade is executed immediately.
                            </li>
                            <li>
                                <strong className='text-white'>Trade: </strong> Someone else owns the player. The person you propose the trade to must accept the trade for it to be executed.
                            </li>
                            <li>
                                <strong className='text-white'>Waiver Requests: </strong> See the waivers page for more information.
                            </li>
                        </ul>

                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Set Your Lineup
                            </button>
                            <button className={`text-white flex items-center justify-end  hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                Waivers <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 6 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>Waivers</h3>

                        {/* Waivers Intro */}
                        <p className="text-lg leading-relaxed mb-4">
                            Waivers give everyone a fair chance to pick up unowned players. When a player is on waivers,
                            every manager in the league can put in a waiver request, and the player will be picked up by
                            the manager who is highest in the waiver queue (or has made the largest bid for the player).
                        </p>

                        {/* Waiver Formats */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Waiver Formats</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            There are 4 waiver formats you can choose from, which are explained below:
                        </p>
                        <ul className="list-disc ml-6 text-lg leading-relaxed mb-4">
                            <li>Waiver bids (FAAB)</li>
                            <li>Rolling</li>
                            <li>Weekly reset</li>
                            <li>None</li>
                        </ul>

                        {/* Waiver Time Details */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Waiver Timing</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            Players go on waivers at the start of a gameweek, when fixture games begin, when a player
                            is added to the game, or when a player is dropped from a team.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            Waivers are processed every Tuesday and Friday at 10am UTC. Additional processing days may be added
                            depending on how gameweeks fall during the season.
                        </p>

                        {/* Waiver Bids (FAAB) */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Waiver Bids (FAAB)</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            Each player starts with a £200 budget to bid on players on waivers. The player goes to the manager
                            with the highest bid, and that manager’s budget is reduced by the amount of the bid. If bids are
                            tied, the waiver queue is used to determine who gets the player.
                        </p>
                        <p className="text-lg leading-relaxed mb-4">
                            Example: Alice bids £80, Bob bids £95, and Charlie bids £150 for Dani Olmo. Charlie wins the player,
                            and his waiver budget is reduced to £50.
                        </p>

                        {/* Other Waiver Formats */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Rolling & Weekly Reset</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            The initial waiver order is set to the reverse draft order, and each time a successful waiver is made,
                            the manager drops to the bottom of the queue. The weekly reset format resets the waiver order to reverse
                            standings at the start of the gameweek.
                        </p>

                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>No Waivers</h3>
                        <p className="text-lg leading-relaxed mb-4">
                            If "None" is selected, there are no waivers in the league and players can be picked up at any time.
                        </p>

                        {/* Changes from Previous Seasons */}
                        <h3 className={`text-4xl font-bold text-white mb-4 italic ${exo2.className}`}>Changes from Previous Seasons</h3>
                        <p className="text-lg leading-relaxed mb-8">
                            New formats like FAAB have been added, and waiver reset now happens at the first waiver processing of
                            the gameweek. In previous seasons, this reset happened at the start of the gameweek.
                        </p>

                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Transfers
                            </button>
                            <button className={`text-white flex items-center justify-end  hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handleNext}>
                                FAQ <span className="ml-2 mb-1 text-2xl">{'>'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 7 && (
                    <div className="md:col-span-3 rounded-lg shadow-lg lg:p-8 pb-96">
                        <h2 className={`text-xl font-bold text-['#FF8A00'] mb-4 italic ${exo2.className}`}>How to Play</h2>
                        <h3 className={`text-5xl font-bold text-white mb-4 italic ${exo2.className}`}>FAQ</h3>

                        <h4 className="text-2xl text-white mb-4 italic">Frequently asked questions</h4>

                        {/* Question 1 */}
                        <h4 className="text-xl font-bold text-white mb-4">What’s the difference between the Free and Premium version of Draft Fantasy?</h4>
                        <p className="text-lg leading-relaxed mb-8">
                            In the free version, you can only draft. But all functionality after the draft is locked off until you upgrade your league to premium. The paid version unlocks the entire platform, allowing you to change your team, score points, and make trades.
                        </p>

                        {/* Question 2 */}
                        <h4 className="text-xl font-bold text-white mb-4">What happens if only part of my league upgrade to premium?</h4>
                        <p className="text-lg leading-relaxed mb-8">
                            The league will remain in the free version until everyone upgrades to the paid version. You can also purchase the single league package which automatically upgrades your league to the paid version.
                        </p>

                        {/* Question 3 */}
                        <h4 className="text-xl font-bold text-white mb-4">How do I contact support?</h4>
                        <p className="text-lg leading-relaxed mb-8">
                            You can contact support via email at <a href="mailto:support@draftfantasy.com" className="underline text-white hover:text-[#FF8A00]">support@draftfantasy.com</a>.
                        </p>

                        <div className='flex flex-row justify-between mt-10'>
                            <button className={`text-white flex items-center hover:text-[#FF8A00] py-2 italic ${exo2.className}`} onClick={handlePrev}>
                                <span className="mr-2 mb-1 text-2xl">{'<'}</span>Transfers
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ContentSection;
