import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { generateInviteCode } from "../../../lib/helpers";

export const GET = async (req) => {
  try {
    await connectToDb();
    // Extract leagueID from query parameters
    const leagueID = req.nextUrl.searchParams.get("leagueID");
    let drafts;
    // Check if leagueID parameter is provided
    if (leagueID) {
      // Find all drafts where the user's leagueID is included in the users_onboard array
      drafts = await FantasyDraft.find({ leagueID: leagueID })
        .populate("leagueID", "invite_code")
        .populate({
          path: "teams.team", // Path to the nested field
          select: "team_name team_image_path", // Fields to retrieve
        });
    } else {
      // Return all fantasy drafts if no leagueID is provided
      drafts = await FantasyDraft.find({ leagueID });
    }
    return NextResponse.json({ error: false, data: drafts });
  } catch (err) {
    console.error("Error fetching drafts: ", err.message);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again later.",
    });
  }
};


export const POST = async (req, res) => {
  try {
    await connectToDb();
    let payload = await req.json();
    if (payload.draftData && payload.draftData._id) {
      const res = await FantasyDraft.findByIdAndUpdate(payload.draftData._id, payload.draftData, { new: true });
      return NextResponse.json({ error: false, data: res });
    } else {
      return NextResponse.json({ error: true, message: "Please send a complete draft Object" });
    }
  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error creating league, please try again."
    });
  }
};
