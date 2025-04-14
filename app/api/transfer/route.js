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
        let data = [];

        if (teamID) {
            data = await FantasyTransfer.find({ teamID: teamID }).populate("teamID").populate("leagueID").populate("playerInID").populate("playerOutID")
        } else if (leagueID) {
            data = await FantasyTransfer.find({ leagueID: leagueID }).populate("teamID").populate("leagueID").populate("playerInID").populate("playerOutID")
        } else {
            data = await FantasyTransfer.find({}).populate("teamID").populate("leagueID").populate("playerInID").populate("playerOutID")
        }
        return NextResponse.json({ error: false, data: data });
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred please try again later"
        });
    }
};

export const POST = async (req, res) => {
    try {
        await connectToDb();
        const payload = await req.json();
        if (!payload.teamID || !payload.leagueID || !payload.playerInID || !payload.playerOutID) {
            return NextResponse.json({
                error: true,
                message: "Please send all variables. Contact support"
            })
        }

        let team = await FantasyTeam.findOne({ _id: payload.teamID })
        let league = await FantasyLeague.findOne({ _id: payload.leagueID }).populate("draftID")
        let playerIn = await Player.findOne({ _id: payload.playerInID })
        let playerOut = await Player.findOne({ _id: payload.playerOutID })

        // Check if all Objects found
        if (!team || !league || !playerIn || !playerOut) {
            return NextResponse.json({
                error: true,
                message: "Object is not present in database. Please contact support"
            })
        }

        // Get draft Object
        let draft = await FantasyDraft.findById(league.draftID._id);

        // Check if team in league
        let teamInLeague = false
        league.teams.map((my_team) => {
            if (my_team.team.equals(team._id)) teamInLeague = true;
        })
        if (!teamInLeague) {
            return NextResponse.json({
                error: true,
                message: "This team is not part of the league. Please contact support"
            })
        }

        // Check for position being same
        if (playerIn.position_name !== playerOut.position_name) {
            return NextResponse.json({
                error: true,
                message: "Please select a player with the same position to transfer"
            })
        }

        // Check if in-player is available for selection
        let playerEligible = false;
        let allPlayers = await Player.find({});
        let eligiblePlayers = await filterPlayersForTransfer(allPlayers, draft._id, team._id);
        eligiblePlayers.map((x) => {
            if (x._id.equals(playerIn._id)) playerEligible = true;
        })
        if (!playerEligible) {
            return NextResponse.json({
                error: true,
                message: "Player is not eligible for selection. Please select another player."
            })
        }

        // Check if out-player is in team
        let playerFoundInTeam = false;
        team.players.map((item) => {
            if (playerOut._id.equals(item.player)) {
                playerFoundInTeam = true;
            }
        })
        if (!playerFoundInTeam) {
            return NextResponse.json({
                error: true,
                message: "Player is not present in your team to transfer out"
            })
        }

        // Make changes in draft
        draft.players_selected.push(playerIn._id);
        draft.players_selected.pop(playerOut._id);

        //Make changes in team
        let index = team.players.findIndex(x => x.player.equals(playerOut._id));
        team.players[index].player = playerIn._id;

        // save team and draft
        team.save();
        draft.save();

        // create transfer object
        let newTransfer = await FantasyTransfer.create({
            "teamID": team._id,
            "leagueID": league._id,
            "playerInID": playerIn._id,
            "playerOutID": playerOut._id
        })
        return NextResponse.json({ error: false, data: newTransfer });

    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again."
        });
    }
};
