import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { generateInviteCode } from "../../../lib/helpers";

export const GET = async (req) => {
  try {
    await connectToDb();
    // Extract leagueID and draftID from query parameters
    const leagueID = req.nextUrl.searchParams.get("leagueID");
    const draftID = req.nextUrl.searchParams.get("draftID");
    let drafts;
    if (draftID) {
      drafts = await FantasyDraft.find({ _id: draftID, is_deleted: false })
        .populate("leagueID", "invite_code league_image_path league_name min_teams max_teams points_configuration")
        .populate({
          path: "teams.team", // Path to the nested field
          select: "team_name team_image_path players", // Fields to retrieve
          populate: {
            path: "players.player", // Path to populate within the team object
            select: "name image_path common_name team_name position_name team_image_path", // Fields to retrieve from the player model
          },
        });
      drafts = drafts[0];
      if (!drafts) {
        return NextResponse.json({ error: true, message: "Draft not found." });
      }
    }
    // Fetch by leagueID if provided
    else if (leagueID) {
      // Find all drafts where the user's leagueID is included in the users_onboard array
      drafts = await FantasyDraft.find({ leagueID: leagueID, is_deleted: false })
        .populate("leagueID", "invite_code")
        .populate({
          path: "teams.team", // Path to the nested field
          select: "team_name team_image_path", // Fields to retrieve
        });
    }
    // else {
    //   // Return all fantasy drafts if no leagueID is provided
    // }
    return NextResponse.json({ error: false, data: drafts });
  } catch (err) {
    console.error("Error fetching drafts: ", err.message);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again later.",
    });
  }
};