import React from 'react'

const SuperLeagueDetail = ({ superLeague, onBack }) => {
    return (
        <div>
            <button onClick={onBack} className="mb-4 text-blue-500 underline">← Back</button>
            <h2 className="text-2xl font-bold mb-3">{superLeague.name} Leaderboards</h2>
            {/* Render leaderboard tables for each league here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {superLeague.leagues?.map(lg => (
                    <div key={lg._id} className="rounded-xl bg-white/10 p-5">
                        <div className="font-bold mb-1">{lg.league_name}</div>
                        {/* Placeholder for leaderboard */}
                        <div className="text-gray-200 italic">[Leaderboard Table Here]</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SuperLeagueDetail