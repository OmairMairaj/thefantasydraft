import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { sendMultipleEmails } from "../../../../lib/mail";

export const POST = async (req) => {
  try {
    await connectToDb();
    const payload = await req.json();
    console.log(payload)
    let draft = await FantasyDraft.findOne({ _id: payload.draftID, is_deleted: false })
      .populate("leagueID", "invite_code")
      .populate({
        path: "teams.team", // Path to the nested field
        select: "team_name team_image_path", // Fields to retrieve
      });
      
    let league = await FantasyLeague.findOne({ draftID: draft._id, is_deleted: false });
    // Check for admin
    if (payload.user_email !== draft.creator)
      return NextResponse.json({ error: true, message: "You are not the admin for this League. Please ask admin to start the draft" });
    // Check for even number of teams if Head to Head 
    if ((league.league_configuration.format === "Head to Head") && (league.teams.length % 2 !== 0))
      return NextResponse.json({ error: true, message: "For a Head to Head format you need an even number of teams to start this league. Please add or remove a user" });
    // Check for minimum teams number reached
    if (league.min_teams > league.users_onboard.length)
      return NextResponse.json({ error: true, message: "Minimum number of teams not reached. Please add more users or change limit" });
    
    // If all goes well :
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
