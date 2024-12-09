import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { sendMultipleEmails } from "../../../../lib/mail";

export const GET = async (req) => {
  try {
    await connectToDb();
    const draftID = req.nextUrl.searchParams.get("draftID");
    let draft = await FantasyDraft.findOne({ _id: draftID });
    draft.state = "In Process";
    draft.start_date = Date.now();
    draft.turn = draft.order[0];
    draft.save();
    //Notify users that draft has started
    return NextResponse.json({ error: false, data: draft });
  } catch (err) {
    console.error("Error fetching drafts: ", err.message);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again later.",
    });
  }
};
