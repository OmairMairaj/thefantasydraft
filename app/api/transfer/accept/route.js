import { Player, FantasyDraft, FantasyLeague, FantasyTeam, FantasyTransfer, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const POST = async (req, res) => {
    try {
        const payload = await req.json();
        await connectToDb();
        if (!payload.transferID) {
            return NextResponse.json({
                error: true,
                message: "Please send all variables. Contact support"
            })
        }
        // console.log(payload);

        let transfer = await FantasyTransfer.findOne({ _id: payload.transferID, status:"Pending" }).populate("leagueID")
        if(!transfer){
            return NextResponse.json({
                error: true,
                message: "Transfer request already may have been accepted / withdrawn"
            });
        }

        let draft = await FantasyDraft.findById(transfer.leagueID.draftID);
        let teamIn = await FantasyTeam.findById(transfer.teamInID);
        let teamOut = await FantasyTeam.findById(transfer.teamOutID);

        //Make changes in team In
        let index = teamOut.players.findIndex(x => x.player.equals(transfer.playerOutID));
        teamOut.players[index].player = transfer.playerInID;

        //Make changes in team Out
        index = teamIn.players.findIndex(x => x.player.equals(transfer.playerInID));
        teamIn.players[index].player = transfer.playerOutID;

        //Make changes in team Out Wallet
        teamIn.waiver_wallet = teamIn.waiver_wallet + transfer.amount;

        //Make changes in team In Wallet
        // teamIn.waiver_wallet = teamIn.waiver_wallet - transfer.amount;

        // update transfer object
        transfer.status = "Approved";

        // Cancel all ongoing transfer offers for these players
        let player_array = [transfer.playerInID, transfer.playerOutID]

        let now_void = await FantasyTransfer.find({
            $or: [
                { playerInID: { $in: player_array } },
                { playerOutID: { $in: player_array } }
            ]
        }).populate("teamOutID")
        // console.log("now_void");
        // console.log(now_void);

        if (now_void.length > 0) {
            now_void.map((item) => {
                if (item.status === "Pending") {
                    item.status = "Expired - Void";
                    item.teamOutID.waiver_wallet = item.teamOutID.waiver_wallet + item.amount;
                    item.teamOutID.save();
                    item.save();
                    return true;
                }
            })
        }

        // save everything
        await teamIn.save();
        await teamOut.save();
        await draft.save();
        await transfer.save();

        let updatedTransfer = await FantasyTransfer.findOne({ _id: payload.transferID })
        return NextResponse.json({
            error: false,
            data: updatedTransfer 
            // teamIn: teamIn
            // , teamOut: teamOut
            // , draft: draft
            // , transfer: transfer
            // , now_void: now_void
        });

    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again."
        });
    }
};
