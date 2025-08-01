import React from 'react';

export default function TeamDetailsModal({ show, onClose, leagueData, headToHeadTable, classicTable, team, pitchViewList, handlePlayerClick, view, setView, exo2 }) {
    const getRankwithSuffix = (rank) => {
        if (!rank) return '';

        let suffix = 'th';
        if (rank % 100 >= 11 && rank % 100 <= 13) {
            suffix = 'th'; // Handle exceptions like 11th, 12th, 13th
        } else {
            switch (rank % 10) {
                case 1:
                    suffix = 'st';
                    break;
                case 2:
                    suffix = 'nd';
                    break;
                case 3:
                    suffix = 'rd';
                    break;
                default:
                    suffix = 'th';
            }
        }
        return (
            <div className="flex items-end">
                <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#FF8A00]">
                    {rank}
                </span>
                <span className="text-base text-[#FF8A00]">
                    {suffix}
                </span>
            </div>
        );
    };


    const renderSkeletons = (required, chosenCount) => {
        if (chosenCount >= required) return null;
        return Array.from({ length: Math.max(0, required - chosenCount) }).map((_, index) => (
            <div
                key={`skeleton-${index}`}
                className="relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]"
            >
                <div className="w-10 h-10 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-lg bg-gray-600 animate-pulse mt-2" />
                <p className="text-sm mt-4 sm:mt-5 xl:mt-6 w-full bg-gray-700 h-4 animate-pulse" />
            </div>
        ));
    };

    const positionIcon = (position) => {
        const positionStyles = {
            Attacker: { bg: 'bg-[#D3E4FE]', text: 'A' },
            Midfielder: { bg: 'bg-[#D5FDE1]', text: 'M' },
            Defender: { bg: 'bg-[#F8E1FF]', text: 'D' },
            Goalkeeper: { bg: 'bg-[#FEF9B6]', text: 'G' },
        };

        const { bg, text } = positionStyles[position] || { bg: 'bg-gray-500', text: '?' };

        return (
            <div
                className={`${bg} w-4 h-4 md:w-5 md:h-5 text-black font-bold flex items-center justify-center text-xs md:text-sm my-4 rounded-full `}
            >
                {text}
            </div>
        );
    };
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-70">
            <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-md rounded-xl shadow-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Close button - fixed in corner */}
                <button className="absolute top-2 right-2 px-2 text-2xl text-gray-300 hover:text-white z-30" onClick={onClose}>
                    &times;
                </button>

                {/* STICKY HEADER */}
                <div className="sticky top-0 z-20 px-4 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        {/* ...team logo, name, owner, points JSX goes here (your code)... */}
                        <div className='flex space-x-2'>
                            <div className="font-bold text-center flex items-center overflow-hidden">
                                <img src={team.team_image_path ? team.team_image_path : "/images/default_team_logo.png"} alt="Team Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-md " />
                            </div>
                            <div className='flex flex-col justify-center'>
                                <div className={`text-xl sm:text-2xl md:text-3xl font-semibold text-[#FF8A00] ${exo2.className}`}>
                                    {team?.team_name || 'Team Name'}
                                </div>
                                <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                                    {team?.user_email ? 'Owner: ' + team.user_email : 'Owner: Unknown'}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center mx-0 sm:mx-4 md:mx-6">
                            <div className="text-base sm:text-xl md:text-2xl font-semibold text-[#FF8A00]">
                                {leagueData?.draftID?.state === "Ended"
                                    ? getRankwithSuffix(
                                        leagueData.league_configuration.format === "Head to Head"
                                            ? headToHeadTable?.findIndex((t) => t.team._id === team?._id) + 1
                                            : classicTable?.findIndex((t) => t.team._id === team?._id) + 1
                                    )
                                    : "--"}
                            </div>
                            <div className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                                {leagueData?.league_configuration.format === "Head to Head" ? "League Points: " : "Total Points: "}
                                {leagueData?.draftID?.state === "Ended"
                                    ? leagueData.league_configuration.format === "Head to Head"
                                        ? headToHeadTable?.find((t) => t.team._id === team?._id)?.points ?? 0
                                        : classicTable?.find((t) => t.team._id === team?._id)?.points_total ?? 0
                                    : "--"}
                            </div>
                        </div>
                    </div>
                    {leagueData?.draftID?.state === "Ended" &&
                        <div className="flex justify-end mb-4" >
                            {/* <h3 className={`text-3xl font-bold text-[#FF8A00] ${exo2.className}`}>Team</h3> */}
                            <div className="flex items-center rounded-lg overflow-hidden text-xs sm:text-sm xl:text-base">
                                <button
                                    className={`${view === 'List' ? 'bg-[#ff8800b7]' : 'bg-[#1d374a]'} text-white px-5 py-1`}
                                    onClick={() => setView('List')}
                                >
                                    List View
                                </button>
                                <button
                                    className={`${view === 'Pitch' ? 'bg-[#ff8800b7]' : 'bg-[#1d374a]'} text-white px-5 py-1`}
                                    onClick={() => setView('Pitch')}
                                >
                                    Pitch View
                                </button>
                            </div>
                        </div>
                    }
                </div>



                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-4 pb-4 scrollbar">
                    {/* ...rest of your modal content (pitch/list view etc.)... */}
                    <div className="rounded-xl">
                        <div className="rounded-xl">
                            {view === 'Pitch' ? (
                                <div className="relative">
                                    <div className={`flex flex-col gap-2 ${leagueData?.draftID?.state !== "Ended" ? 'blur-sm' : ''}`}>
                                        {/* Pitch layout */}
                                        <div className="py-6 px-0 sm:px-4 text-white rounded-lg border border-[#1d374a] bg-[#0c1922] pitch-view">
                                            <div className="flex flex-col gap-4">
                                                {/* Goalkeeper */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Goalkeeper.map((player) => (
                                                        <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        C
                                                                                                    </span>
                                                                                                )}
                                                                                                {player.vice_captain && !player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        VC
                                                                                                    </span>
                                                                                                )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>

                                                        </div>
                                                    ))}
                                                    {renderSkeletons(1, pitchViewList.lineup.Goalkeeper.length)}
                                                </div>

                                                {/* Defenders */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Defender.map((player) => (
                                                        <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        C
                                                                                                    </span>
                                                                                                )}
                                                                                                {player.vice_captain && !player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        VC
                                                                                                    </span>
                                                                                                )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>

                                                        </div>
                                                    ))}
                                                    {renderSkeletons(3, pitchViewList.lineup.Defender.length)}
                                                </div>

                                                {/* Midfielders */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Midfielder.map((player) => (
                                                        <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        C
                                                                                                    </span>
                                                                                                )}
                                                                                                {player.vice_captain && !player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        VC
                                                                                                    </span>
                                                                                                )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>

                                                        </div>
                                                    ))}
                                                    {renderSkeletons(3, pitchViewList.lineup.Midfielder.length)}
                                                </div>

                                                {/* Attackers */}
                                                <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                    {pitchViewList.lineup.Attacker.map((player) => (
                                                        <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                            <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                            <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                            {/* {player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        C
                                                                                                    </span>
                                                                                                )}
                                                                                                {player.vice_captain && !player.captain && (
                                                                                                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                        VC
                                                                                                    </span>
                                                                                                )} */}
                                                            <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                                {player.player.common_name}
                                                            </p>
                                                            <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                                {player.player.position_name}
                                                            </p>

                                                        </div>
                                                    ))}
                                                    {renderSkeletons(2, pitchViewList.lineup.Attacker.length)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Substitute Players */}
                                        <div className='w-full flex flex-col py-3 px-4 bg-[#071117] rounded-lg'>
                                            <div className="flex justify-center items-center gap-1 sm:gap-4">
                                                {pitchViewList.bench.map((player) => (
                                                    <div key={player.player._id} className={` relative w-1/5 flex flex-col py-4 items-center text-center overflow-hidden rounded-lg border border-[#1d374a] shadow-sm shadow-black bg-[#0c192280]`} onClick={() => handlePlayerClick(player)} >
                                                        <img src={player.player.image_path} alt={player.player.name} className="w-10 sm:w-16 xl:w-20 rounded-lg" />
                                                        <img src={player.player.team_image_path} alt="Team Logo" className="absolute top-1 left-1 w-4 h-4 sm:w-8 sm:h-8 rounded-full shadow-md" />
                                                        {/* {player.captain && (
                                                                                                <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                    C
                                                                                                </span>
                                                                                            )}
                                                                                            {player.vice_captain && !player.captain && (
                                                                                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                                                                                    VC
                                                                                                </span>
                                                                                            )} */}
                                                        <p className="mt-2 px-2 truncate max-w-full whitespace-nowrap text-xs sm:text-sm xl:text-base">
                                                            {player.player.common_name}
                                                        </p>
                                                        <p className="px-2 truncate max-w-full whitespace-nowrap text-[10px] sm:text-xs">
                                                            {player.player.position_name}
                                                        </p>

                                                    </div>
                                                ))}
                                                {renderSkeletons(4, pitchViewList.bench.length)}
                                            </div>
                                        </div>
                                    </div>
                                    {leagueData?.draftID?.state !== "Ended" && (
                                        <div className='ribbon-2 text-base xl:text-xl text-[#ff7A00] text-center'>
                                            Drafting not completed yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // List View
                                <div className="relative w-full overflow-hidden rounded-lg border border-[#1d374a]">
                                    <div className="overflow-x-auto overflow-y-auto scrollbar">
                                        <table className="w-full text-left text-white text-xs sm:text-sm xl:text-base">
                                            <thead className="bg-[#1d374a] sticky top-0 z-10">
                                                <tr className="text-center">
                                                    <th className="p-2 text-left pl-4">Player</th>
                                                    <th className="p-2">Team</th>
                                                    {/* <th className="p-2">Actions</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Main positions */}
                                                {["Goalkeeper", "Defender", "Midfielder", "Attacker"].map((pos) => (
                                                    pitchViewList.lineup[pos].length > 0 && (
                                                        <React.Fragment key={pos}>
                                                            {/* Section Heading */}
                                                            <tr>
                                                                <td colSpan="3" className="py-2 px-4 text-left font-bold bg-[#192a37] text-[#FF8A00] uppercase text-xs sm:text-sm">
                                                                    {pos}
                                                                </td>
                                                            </tr>
                                                            {pitchViewList.lineup[pos].map((player) => (
                                                                <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
                                                                    {/* Player Name + Image */}
                                                                    <td className="px-2 text-left truncate min-w-36 max-w-40">
                                                                        <div className="flex items-center space-x-2">
                                                                            {player.player.image_path && (
                                                                                <img
                                                                                    src={player.player.image_path}
                                                                                    alt={player.player.team_name || 'Team Logo'}
                                                                                    className="w-8 h-8 sm:w-10 sm:h-10 my-2 rounded-lg"
                                                                                />
                                                                            )}
                                                                            <div className="overflow-hidden">
                                                                                <p className="font-bold truncate">{player.player.common_name}</p>
                                                                            </div>
                                                                            <div className='flex items-center justify-center'>{positionIcon(player.player.position_name)}</div>
                                                                        </div>
                                                                    </td>
                                                                    {/* Team Logo */}
                                                                    <td className="p-2 text-center min-w-20 sm:min-w-40">
                                                                        <img src={player.player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto shadow-md" />
                                                                    </td>
                                                                    {/* Controls */}
                                                                    {/* <td className="p-2 text-center truncate">
                                                                                    <div className="flex justify-center items-center gap-2">
                                                                                        <button
                                                                                            className="bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white"
                                                                                            onClick={() => handleViewClick(player)}
                                                                                            type="button"
                                                                                        >
                                                                                            View
                                                                                        </button>
                                                                                        <button
                                                                                            className={`${selectedPlayer === player ? "bg-[#0b151c] opacity-50 cursor-default hover:bg-[#0b151c] hover:text-white" : "bg-[#1d374a]"} border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white`}
                                                                                            onClick={() => { setSelectedPlayer(player); handleSwitchClick(player) }}
                                                                                            type="button"
                                                                                            disabled={selectedPlayer && selectedPlayer.player._id === player.player._id}
                                                                                        >
                                                                                            {selectedPlayer ? "Switch with" : "Switch"}
                                                                                        </button>
                                                                                    </div>
                                                                                </td> */}
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    )
                                                ))}

                                                {/* Substitutes */}
                                                {pitchViewList.bench.length > 0 && (
                                                    <React.Fragment>
                                                        <tr>
                                                            <td colSpan="3" className="py-2 px-4 text-left font-bold bg-[#192a37] text-[#FF8A00] uppercase text-xs sm:text-sm">
                                                                Substitutes
                                                            </td>
                                                        </tr>
                                                        {pitchViewList.bench.map((player) => (
                                                            <tr key={player.player._id} className={`bg-transparent border-b border-[#1d374a] text-center items-center justify-center`} onClick={() => handlePlayerClick(player)}>
                                                                {/* Player Name + Image */}
                                                                {/* Player Name + Image */}
                                                                <td className="px-2 text-left truncate max-w-28 sm:max-w-none">
                                                                    <div className="flex items-center space-x-2">
                                                                        {player.player.image_path && (
                                                                            <img
                                                                                src={player.player.image_path}
                                                                                alt={player.player.common_name || 'Player Logo'}
                                                                                className="w-8 h-8 sm:w-10 sm:h-10 my-2 rounded-lg"
                                                                            />
                                                                        )}
                                                                        <div className="overflow-hidden">
                                                                            <p className="font-bold truncate">{player.player.common_name}</p>
                                                                        </div>
                                                                        <div className='flex items-center justify-center'>{positionIcon(player.player.position_name)}</div>
                                                                    </div>
                                                                </td>
                                                                {/* Team Logo */}
                                                                <td className="p-2 text-center min-w-20 sm:min-w-40">
                                                                    <img src={player.player.team_image_path} alt="Team Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto shadow-md" />
                                                                </td>
                                                                {/* Controls */}
                                                                {/* <td className="p-2 text-center truncate">
                                                                                <div className="flex justify-center items-center gap-2">
                                                                                    <button
                                                                                        className="bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white"
                                                                                        onClick={() => handleViewClick(player)}
                                                                                        type="button"
                                                                                    >
                                                                                        View
                                                                                    </button>
                                                                                    <button
                                                                                        className={`bg-[#1d374a] border border-[#1d374a] text-white px-2 sm:px-6 py-1 text-xs sm:text-sm rounded-md hover:bg-[#FF8A00] hover:text-white`}
                                                                                        onClick={() => { setSelectedPlayer(player); handleSwitchClick(player) }}
                                                                                        type="button"
                                                                                        disabled={selectedPlayer && selectedPlayer.player._id === player.player._id}
                                                                                    >
                                                                                        {selectedPlayer ? "Switch with" : "Switch"}
                                                                                    </button>
                                                                                </div>
                                                                            </td> */}
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
