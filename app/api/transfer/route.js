import { Player, FantasyDraft, FantasyLeague, FantasyTeam, FantasyTransfer, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { filterPlayersForTransfer } from "@/lib/helpers";

export const GET = async (req, res) => {
    try {
        await connectToDb();
        const teamID = req.nextUrl.searchParams.get("teamID");
        const leagueID = req.nextUrl.searchParams.get("leagueID");
        let data = [];

        if (teamID) {
            data = await FantasyTransfer.find({ $or: [{ teamInID: teamID }, { teamOutID: teamID }] }).populate("teamInID").populate("teamOutID").populate("leagueID").populate("playerInID").populate("playerOutID")
        } else if (leagueID) {
            data = await FantasyTransfer.find({ leagueID: leagueID }).populate("teamInID").populate("teamOutID").populate("leagueID").populate("playerInID").populate("playerOutID")
        } else {
            data = await FantasyTransfer.find({}).populate("teamInID").populate("teamOutID").populate("leagueID").populate("playerInID").populate("playerOutID")
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
        const payload = await req.json();
        // return NextResponse.json({
        //     error: false,
        //     message: "All good.",
        //     payload: payload
        // })
        // payload : {
        //     "teamID": userTeam._id,
        //     "leagueID": leagueId,
        //     "playerInID": playersIn._id,
        //     "playerOutID": playersOut._id,
        //     "owned": playersIn.owned,
        //     "amount": transferOfferAmount
        // }

        await connectToDb();
        if (!payload.teamID || !payload.leagueID || !payload.playerInID || !payload.playerOutID || payload.amount === null || payload.owned === null) {
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
        // return NextResponse.json({
        //     team:team,
        //     league:league,
        //     playerIn:playerIn,
        //     playerOut:playerOut,
        // })

        let draft = await FantasyDraft.findById(league.draftID._id);

        // Get team from where transfer is being made
        let teamIn = null
        if (payload.owned) {
            let allTeams = await FantasyTeam.find({ leagueID: league._id })
            let found = false;
            allTeams.map((one_team) => {
                console.log("one_team")
                if (found === false) {
                    one_team.players.map((one_player) => {
                        if (one_player.player.equals(playerIn._id)) found = true;
                    })
                    if (found) { teamIn = one_team }
                }
            })
            if (teamIn === null) {
                return NextResponse.json({
                    error: true,
                    message: "No team found for the owned player. Contact support"
                })
            }
        }

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
        console.log(team._id)
        let eligiblePlayers = await filterPlayersForTransfer(allPlayers, draft._id, team._id, playerOut._id);
        eligiblePlayers.map((x) => {
            if (x._id.equals(playerIn._id)) playerEligible = true;
        })
        console.log("playerEligible : " + playerEligible)
        if (!playerEligible) {
            return NextResponse.json({
                error: true,
                message: "Player is not eligible for selection. Please select a player from another team/position."
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

        if (payload.owned) {
            // Make changes in draft
            // draft.players_selected.push(playerIn._id);
            // draft.players_selected.pop(playerOut._id);

            //Make changes in team
            // let index = team.players.findIndex(x => x.player.equals(playerOut._id));
            // team.players[index].player = playerIn._id;

            // save team and draft
            // draft.save();

            //Make changes in team In Wallet
            team.waiver_wallet = team.waiver_wallet - payload.amount;
            team.save();

            // create transfer object
            let newTransfer = await FantasyTransfer.create({
                "teamInID": teamIn._id,
                "teamOutID": team._id,
                "leagueID": league._id,
                "playerInID": playerIn._id,
                "playerOutID": playerOut._id,
                "is_offer": true,
                "amount": payload.amount,
                "status": "Pending"
            })

            team = await FantasyTeam.findOne({ _id: payload.teamID })

            return NextResponse.json({ error: false, data: newTransfer, team: team });
        }
        else {
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
                "teamInID": team._id,
                "teamOutID": null,
                "leagueID": league._id,
                "playerInID": playerIn._id,
                "playerOutID": playerOut._id,
                "is_offer": false,
                "amount": 0,
                "status": "Approved"
            })
            return NextResponse.json({ error: false, data: newTransfer });
        }

    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again."
        });
    }
};
