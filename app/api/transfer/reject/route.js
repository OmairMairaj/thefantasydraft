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
        } else {
            console.log("payload.transferID")
            console.log(payload.transferID)
            let updatedTransfer = await FantasyTransfer.findOneAndUpdate({ _id: payload.transferID, status: "Pending" }, { status: "Rejected" }, { new: true })
            console.log("updatedTransfer")
            console.log(updatedTransfer)
            // return NextResponse.json({
            //     error: updatedTransfer,
            // });
            if (!updatedTransfer) {
                return NextResponse.json({
                    error: true,
                    message: "This transfer was already marked. Please refresh and try again"
                });
            }

            // Give back money in wallet
            let team = await FantasyTeam.findOne({ _id: updatedTransfer.teamOutID })
            team.waiver_wallet = team.waiver_wallet + updatedTransfer.amount;
            await team.save();

            team = await FantasyTeam.findOne({ _id: updatedTransfer.teamOutID })

            return NextResponse.json({ error: false, data: updatedTransfer, team: team });
        }
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again."
        });
    }
};
