import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const POST = async (req, res) => {
  try {
    await connectToDb();
    let payload = await req.json();
    if (payload.leagueData && payload.leagueData._id) {
      const res = await FantasyLeague.findOneAndUpdate({ _id: payload.leagueData._id, is_deleted: false }, payload.leagueData, { new: true });
      return NextResponse.json({ error: false, data: res });
    } else {
      return NextResponse.json({ error: true, message: "Please send a complete league Object" });
    }
  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error editing league, please try again."
    });
  }
};
