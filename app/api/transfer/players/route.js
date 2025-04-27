import { Player, FantasyDraft, FantasyLeague, FantasyTeam, FantasyTransfer, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { filterPlayersForTransfer } from "@/lib/helpers";
import { Wellfleet } from "next/font/google";

export const GET = async (req, res) => {
    try {
        await connectToDb();
        const teamID = req.nextUrl.searchParams.get("teamID");
        const leagueID = req.nextUrl.searchParams.get("leagueID");
        let league = await FantasyLeague.findOne({ _id: leagueID }).populate("draftID")

        if (teamID && league) {
            let allPlayers = await Player.find({});
            let eligiblePlayers = await filterPlayersForTransfer(allPlayers, league.draftID, teamID);
            return NextResponse.json({ error: false, data: eligiblePlayers });
        }
        else return NextResponse.json({ error: true, message: "League/Team not found. Please reach out to admin" });

    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred please try again later"
        });
    }
};
