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

        let transfer = await FantasyTransfer.findOne({ _id: payload.transferID }).populate("leagueID")

        let draft = await FantasyDraft.findById(transfer.leagueID.draftID);
        let teamIn = await FantasyTeam.findById(transfer.teamInID);
        let teamOut = await FantasyTeam.findById(transfer.teamOutID);

        //Make changes in team In
        let index = teamIn.players.findIndex(x => x.player.equals(transfer.playerOutID));
        teamIn.players[index].player = transfer.playerInID;

        //Make changes in team Out
        index = teamOut.players.findIndex(x => x.player.equals(transfer.playerInID));
        teamOut.players[index].player = transfer.playerOutID;

        //Make changes in team Out Wallet
        teamOut.waiver_wallet = teamOut.waiver_wallet + transfer.amount;

        //Make changes in team In Wallet
        // teamIn.waiver_wallet = teamIn.waiver_wallet - transfer.amount;

        // update transfer object
        transfer.status = "Approved";

        // Cancel all ongoing transfer offers for these players
        let player_array = [transfer.playerInID, transfer.playerOutID]

        let now_void = FantasyTransfer.find({
            $or: [
                { playerInID: { $in: player_array } },
                { playerOutID: { $in: player_array } }
            ]
        }).populate("teamInID")

        now_void.map((item)=>{
            if(item.status==="Pending"){
                item.status="Expired - Void";
                item.teamInID.waiver_wallet = item.teamInID.waiver_wallet + item.amount;
                item.teamInID.save();
                item.save();
                return true;
            }
        })

        // save everything
        await teamIn.save();
        await teamOut.save();
        await draft.save();
        await transfer.save();

        let updatedTransfer = await FantasyTransfer.findOne({ _id: payload.transferID })
        return NextResponse.json({ error: false, data: updatedTransfer });

    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again."
        });
    }
};
