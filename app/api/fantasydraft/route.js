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
      drafts = await FantasyDraft.find({ leagueID: leagueID });
    } else {
      // Return all fantasy drafts if no leagueID is provided
      drafts = await FantasyDraft.find();
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
