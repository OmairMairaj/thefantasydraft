import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";


export const POST = async (req, res) => {
  try {
    await connectToDb();
    let payload = await req.json();
    if (payload.draftData && payload.draftData._id) {
      const res = await FantasyDraft.findOneAndUpdate({ _id: payload.draftData._id, is_deleted: false }, payload.draftData, { new: true });
      return NextResponse.json({ error: false, data: res });
    } else {
      return NextResponse.json({ error: true, message: "Please send a complete draft Object" });
    }
  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error editing draft settings, please try again."
    });
  }
};
