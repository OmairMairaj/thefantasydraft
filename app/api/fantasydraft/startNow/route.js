import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { sendMultipleEmails } from "../../../../lib/mail";

export const POST = async (req) => {
  try {
    await connectToDb();
    const payload = await req.json();
    console.log(payload)
    let draft = await FantasyDraft.findOne({ _id: payload.draftID })
      .populate("leagueID", "invite_code")
      .populate({
        path: "teams.team", // Path to the nested field
        select: "team_name team_image_path", // Fields to retrieve
      });
    if (payload.user_email !== draft.creator) return NextResponse.json({ error: true, message: "You are not the admin for this League. Please ask admin to start the draft" });
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
