import { calculatePlayerPoints } from "@/lib/helpers";
import { FantasyLeague, Player, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
    try {
        await connectToDb();
        // sample below
        //     "playerID": "67b109c15abe4809107f0dbd",
        //     "leagueID": "67f18a01afdc76fa71434126",
        //     "gameweekID": "6759510fd37e507ed264f226"
        
        const { searchParams } = new URL(req.url);
        const leagueID = searchParams.get("leagueID");
        const playerID = searchParams.get("playerID");
        const gameweekID = searchParams.get("gameweekID");
        console.log(playerID);

        let league = await FantasyLeague.findOne({ _id: leagueID });
        let player = await Player.findOne({ _id: playerID });
        let gameweek = await GameWeek.findOne({ _id: gameweekID });

        const output = await calculatePlayerPoints(league, player, gameweek);

        return NextResponse.json({
            error: false,
            data: {
                player : player,
                points : output
            },
        });

    } catch (err) {
        console.error("Error fetching points : ", err);
        return NextResponse.json({
            error: true,
            err: err,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
