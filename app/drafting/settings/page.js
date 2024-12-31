'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const DraftSettings = () => {
    const [user, setUser] = useState(null);
    const [draftID, setDraftID] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser).user);
        } else {
            console.error("User not found in session storage");
        }

        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const draftIDFromURL = urlParams.get('draftID');

            if (draftIDFromURL) {
                setDraftID(draftIDFromURL);
                console.log("Draft ID found in URL:", draftIDFromURL);
            } else {
                console.error("Draft ID not found in URL");
            }
        }
    }, []);

    useEffect(() => {
        if (user && draftID) fetchDraftData();
    }, [user, draftID]);

    const fetchDraftData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/fantasydraft?draftID=${draftID}`
            );
            if (response.data && !response.data.error) {
                setDraftData(response.data.data);
                console.log("Draft data fetched successfully:", response.data.data);
            } else {
                console.error("Failed to fetch draft data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching draft data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !draftData) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-[88vh] flex flex-col my-16 text-white px-6 md:px-10 lg:px-16 xl:px-20 pb-10">
            <h1 className={`text-4xl font-bold ${exo2.className} mb-8`}>Draft Settings</h1>
            <div className="grid grid-cols-12 gap-6">
                {/* League Information */}
                <div className={`col-span-6 bg-[#1c1c1c] rounded-lg p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>League Information</h2>
                    <div className='grid grid-cols-6 gap-4 '>
                        <div className='col-span-2'>
                            {/* <div className='>Logo:</div> */}
                            <img
                                src={draftData?.leagueID?.league_image_path}
                                alt="League Logo"
                                className="w-16 h-16 object-cover rounded-lg sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                            />
                        </div>
                        <div className='col-span-4 space-y-1'>
                            <div className='grid grid-cols-2 gap-4 '>
                                <div className='col-span-1'>Name:</div>
                                <div className='text-left'> {draftData?.leagueID?.league_name || "Unknown"}</div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='col-span-1'>Min Teams:</div>
                                <div className='text-left'> {draftData?.leagueID?.min_teams || "--"}</div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='col-span-1'>Max Teams:</div>
                                <div className='text-left'> {draftData?.leagueID?.max_teams || "--"}</div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='col-span-1'>Creator:</div>
                                <div className='text-left'> {draftData?.creator || "Unknown"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Draft Settings */}
                <div className={`col-span-6 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Draft Settings</h2>
                    <div className='grid grid-cols-3 gap-4 '>
                        <div className='col-span-2'>Type:</div>
                        <div className='text-left'> {draftData?.type || "----"}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Start Time:</div>
                        <div className='text-left'> {new Date(draftData?.start_date).toLocaleString()}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Seconds per Pick:</div>
                        <div className='text-left'> {draftData?.time_per_pick || "--"}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>State:</div>
                        <div className='text-left'> {draftData?.state || "Unknown"}</div>
                    </div>
                </div>

                {/* Team Configurations */}
                <div className={`col-span-4 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Team Configurations</h2>
                    <div className='grid grid-cols-3 gap-4 '>
                        <div className='col-span-2'>Max Players per Club:</div>
                        <div className='text-center'> {draftData?.max_players_per_club || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Squad Players:</div>
                        <div className='text-center'> {draftData?.squad_players || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Lineup Players:</div>
                        <div className='text-center'> {draftData?.lineup_players || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Bench Players:</div>
                        <div className='text-center'> {draftData?.bench_players || '--'}</div>
                    </div>
                </div>

                {/* Squad and Lineup Configurations */}
                <div className={`col-span-4 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Squad Configuration</h2>
                    <div className='grid grid-cols-3 gap-4 '>
                        <div className='col-span-2'>Goalkeepers:</div>
                        <div className='text-center'> {draftData?.squad_configurations?.goalkeepers || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Defenders:</div>
                        <div className='text-center'> {draftData?.squad_configurations?.defenders || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Midfielders:</div>
                        <div className='text-center'> {draftData?.squad_configurations?.midfielders || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Attackers:</div>
                        <div className='text-center'> {draftData?.squad_configurations?.attackers || '--'}</div>
                    </div>
                </div>

                <div className={`col-span-4 bg-[#1c1c1c] rounded-lg space-y-1 p-6 shadow-lg ${exo2.className}`}>
                    <h2 className='text-xl font-bold text-[#FF8A00] mb-4'>Lineup Configuration</h2>
                    <div className='grid grid-cols-3 gap-4 '>
                        <div className='col-span-2'>Goalkeepers:</div>
                        <div className='text-center'> {draftData?.lineup_configurations?.goalkeepers || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Defenders:</div>
                        <div className='text-center'> {draftData?.lineup_configurations?.defenders || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Midfielders:</div>
                        <div className='text-center'> {draftData?.lineup_configurations?.midfielders || '--'}</div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='col-span-2'>Attackers:</div>
                        <div className='text-center'> {draftData?.lineup_configurations?.attackers || '--'}</div>
                    </div>
                </div>
            </div>

            {/* Points Table */}
            <div className='mt-10 bg-[#1c1c1c] rounded-xl'>
                <h2 className={`text-xl font-bold text-[#FF8A00] pt-6 pl-6 pb-3 ${exo2.className}`}>Points Table</h2>
                <div className={`grid grid-cols-2 gap-6 bg-[#03070A] ${exo2.className}`}>
                    <div className="col-span-1 rounded-b-xl shadow-lg pb-6 bg-[#1c1c1c]">
                        <table className="table-auto w-full text-left ">
                            <thead className='bg-[#2f2f2f]'>
                                <tr className='text-center'>
                                    <th className="p-2 border-b border-gray-700 text-left pl-6">Stat</th>
                                    <th className="p-2 border-b border-gray-700">GK</th>
                                    <th className="p-2 border-b border-gray-700">DEF</th>
                                    <th className="p-2 border-b border-gray-700">MID</th>
                                    <th className="p-2 border-b border-gray-700 pr-6">FWD</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">{`< 60 mins played`}</td>
                                    <td className="p-2 border-b border-gray-700">1</td>
                                    <td className="p-2 border-b border-gray-700">1</td>
                                    <td className="p-2 border-b border-gray-700">1</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">1</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">60+ mins played</td>
                                    <td className="p-2 border-b border-gray-700">2</td>
                                    <td className="p-2 border-b border-gray-700">2</td>
                                    <td className="p-2 border-b border-gray-700">2</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">2</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Goal scored</td>
                                    <td className="p-2 border-b border-gray-700">6</td>
                                    <td className="p-2 border-b border-gray-700">6</td>
                                    <td className="p-2 border-b border-gray-700">5</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Assist</td>
                                    <td className="p-2 border-b border-gray-700">3</td>
                                    <td className="p-2 border-b border-gray-700">3</td>
                                    <td className="p-2 border-b border-gray-700">3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Clean sheet</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Yellow card</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Red card</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Save</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700">4</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">4</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Negative Points Table */}
                    <div className="col-span-1 bg-[#1c1c1c] rounded-b-xl pb-6 shadow-lg">
                        <table className="table-auto w-full text-left">
                            <thead className='bg-[#2f2f2f]'>
                                <tr className='text-center'>
                                    <th className="p-2 border-b border-gray-700 text-left pl-6">Stat</th>
                                    <th className="p-2 border-b border-gray-700">GK</th>
                                    <th className="p-2 border-b border-gray-700">DEF</th>
                                    <th className="p-2 border-b border-gray-700">MID</th>
                                    <th className="p-2 border-b border-gray-700 pr-6">FWD</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Own goal</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-2</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty missed</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700">-2</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-2</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty conceeded</td>
                                    <td className="p-2 border-b border-gray-700">-1</td>
                                    <td className="p-2 border-b border-gray-700">-1</td>
                                    <td className="p-2 border-b border-gray-700">-1</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-1</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty earned</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Penalty saved</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Pass</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Accurate pass %</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-gray-700 text-left pl-6">Key pass</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700">-3</td>
                                    <td className="p-2 border-b border-gray-700 pr-6">-3</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* Actions */}
            {/* <div className="flex justify-end mt-8 gap-4">
                <button className="bg-[#FF8A00] text-black px-6 py-2 rounded-lg">Leave League</button>
                <button className="bg-[#FF8A00] text-black px-6 py-2 rounded-lg">Delete League</button>
                <button className="bg-[#FF8A00] text-black px-6 py-2 rounded-lg">Remove Team</button>
            </div> */}
        </div >
    );
};

export default DraftSettings;
