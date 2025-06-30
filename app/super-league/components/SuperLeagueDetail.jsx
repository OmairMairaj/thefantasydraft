import React from 'react'

const getRankwithSuffix = (rank) => {
    if (!rank) return '';
    let suffix = 'th';
    if (rank % 100 >= 11 && rank % 100 <= 13) suffix = 'th';
    else {
        switch (rank % 10) {
            case 1: suffix = 'st'; break;
            case 2: suffix = 'nd'; break;
            case 3: suffix = 'rd'; break;
            default: suffix = 'th';
        }
    }
    return (
        <span>
            {rank}
            <span className="text-xs">{suffix}</span>
        </span>
    );
};

const LeagueLeaderboard = ({ league, userTeamId }) => {
    if (!league) return null;

    // Sort tables
    const isH2H = league.league_configuration?.format === "Head to Head";
    const headToHeadTable = isH2H
        ? [...league.head_to_head_points].sort((a, b) => b.points - a.points)
        : [];
    const classicTable = !isH2H
        ? [...league.classic_points].sort((a, b) => b.points_total - a.points_total)
        : [];

    return (
        <div className="rounded-xl bg-[#1C1C1C] p-6 overflow-hidden">
            <div className="flex items-center mb-3">
                <img
                    src={league.league_image_path || "/images/default_team_logo.png"}
                    alt={league.league_name}
                    className="w-10 h-10 rounded-full mr-3"
                />
                <h3 className="text-xl font-bold">{league.league_name}</h3>
                <span className="ml-3 px-3 py-1 bg-[#2d2d2d] text-xs rounded-full font-semibold">
                    {league.league_configuration?.format}
                </span>
            </div>
            <div className="overflow-y-auto h-80 scrollbar">
                <table className="w-full text-gray-300">
                    <thead className="bg-[#1C1C1C] border-b border-gray-700 sticky top-0 z-10">
                        {isH2H ? (
                            <tr>
                                <th className="py-2 px-2 text-center">#</th>
                                <th className="py-2 px-2 text-left">Team</th>
                                <th className="py-2 px-2 text-center">Pts</th>
                                <th className="py-2 px-2 text-center">Won</th>
                                <th className="py-2 px-2 text-center">Lost</th>
                                <th className="py-2 px-2 text-center">Draw</th>
                                <th className="py-2 px-2 text-center">Form</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="py-2 px-2 text-center">#</th>
                                <th className="py-2 px-2 text-left">Team</th>
                                <th className="py-2 px-2 text-center">PTS</th>
                                <th className="py-2 px-2 text-center">GW</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {isH2H
                            ? headToHeadTable.map((teamData, idx) => (
                                <tr
                                    key={teamData.team?._id || idx}
                                    className={`${userTeamId === teamData.team?._id ? "bg-[#8e6b4017]" : ""}`}
                                >
                                    <td className="py-2 px-2 text-center">{getRankwithSuffix(idx + 1)}</td>
                                    <td className="py-2 px-2 text-left flex items-center space-x-2">
                                        <img
                                            src={teamData.team?.team_image_path || "/images/default_team_logo.png"}
                                            alt={teamData.team?.team_name}
                                            className="w-8 h-8 rounded-md"
                                        />
                                        <span className='truncate'>{teamData.team?.team_name}</span>
                                    </td>
                                    <td className="py-2 px-2 text-center">{teamData.points || 0}</td>
                                    <td className="py-2 px-2 text-center">{teamData.wins || 0}</td>
                                    <td className="py-2 px-2 text-center">{teamData.loses || 0}</td>
                                    <td className="py-2 px-2 text-center">{teamData.draws || 0}</td>
                                    <td>
                                        <div className="py-2 px-2 text-center hidden sm:flex items-center justify-center gap-1">
                                            {(teamData?.form?.replace(/\s/g, '') || '').split('').slice(-5).map((result, idx) => (
                                                <span key={idx} className={`rounded-sm sm:rounded-md lg:rounded-sm w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-sm sm:text-base lg:text-sm flex justify-center items-center text-white ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : result === 'D' ? 'bg-yellow-400' : 'bg-gray-500'}`}>{result}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))
                            : classicTable.map((teamData, idx) => (
                                <tr
                                    key={teamData.team?._id || idx}
                                    className={`${userTeamId === teamData.team?._id ? "bg-[#8e6b4017]" : ""}`}
                                >
                                    <td className="py-2 px-2 text-center">{getRankwithSuffix(idx + 1)}</td>
                                    <td className="py-2 px-2 text-left flex items-center space-x-2">
                                        <img
                                            src={teamData.team?.team_image_path || "/images/default_team_logo.png"}
                                            alt={teamData.team?.team_name}
                                            className="w-8 h-8 rounded-md"
                                        />
                                        <span className='truncate'>{teamData.team?.team_name}</span>
                                    </td>
                                    <td className="py-2 px-2 text-center">{teamData.points_total || 0}</td>
                                    <td className="py-2 px-2 text-center">{teamData.points_current || 0}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SuperLeagueDetail = ({ superLeague, onBack, user }) => {

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">{superLeague.name} Leaderboards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {superLeague.leagues?.map(lg => (
                    <LeagueLeaderboard
                        key={lg._id}
                        league={lg}
                        // Optionally, pass user teamId if you want to highlight their team:
                        userTeamId={user?.teamId}
                    />
                ))}
            </div>
        </div>
    );
};

export default SuperLeagueDetail