import { calculateTeamPoints } from "@/lib/helpers";
import { FantasyLeague, FantasyTeam, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
    try {
        await connectToDb();
        // sample below
        //     "teamID": "67f18a01afdc76fa71434123",
        //     "leagueID": "67f18a01afdc76fa71434126",
        //     "gameweekID": "6759510fd37e507ed264f226"

        const { searchParams } = new URL(req.url);
        const leagueID = searchParams.get("leagueID");
        const teamID = searchParams.get("teamID");
        const gameweekID = searchParams.get("gameweekID");
        console.log(teamID);

        let league = await FantasyLeague.findOne({ _id: leagueID });
        let team = await FantasyTeam.findOne({ _id: teamID });
        let gameweek = await GameWeek.findOne({ _id: gameweekID });

        const output = await calculateTeamPoints(league, team, gameweek);

        return NextResponse.json({
            error: false,
            data: {
                team: team,
                points: output
            }
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
