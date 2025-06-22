import { Player, FantasyDraft, FantasyLeague, FantasyTeam, FantasyTransfer, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { filterPlayersForTransfer } from "@/lib/helpers";
import { Wellfleet } from "next/font/google";

export const GET = async (req, res) => {
    try {
        await connectToDb();
        const teamID = req.nextUrl.searchParams.get("teamID");
        const team = await FantasyTeam.findOne({ _id: teamID });
        // const leagueID = req.nextUrl.searchParams.get("leagueID");

        if (team) {
            let league = await FantasyLeague.findOne({ _id: team.leagueID }).populate("draftID");
            let draft = league.draftID;
            let allPlayers = await Player.find({});
            let eligiblePlayers = allPlayers.filter(player =>
                !team.players.some(teamPlayer => teamPlayer.player.equals(player._id))
            );
            let finalList = eligiblePlayers.map((player) => {
                let owned = false
                if (draft.players_selected.indexOf(player._id) !== -1) {
                    owned = true;
                }
                if (owned) console.log(player.name);
                return {
                    "_id": player._id,
                    "id": player.id,
                    "name": player.name,
                    "common_name": player.common_name,
                    "image_path": player.image_path,
                    "nationality": player.nationality,
                    "nationality_image_path": player.nationality_image_path,
                    "positionID": player.positionID,
                    "position_name": player.position_name,
                    "detailed_position": player.detailed_position,
                    "teamID": player.teamID,
                    "team_name": player.team_name,
                    "team_image_path": player.team_image_path,
                    "rating": player.rating,
                    "points": player.points,
                    "owned": owned,
                }
            })
            return NextResponse.json({ error: false, data: finalList });
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
