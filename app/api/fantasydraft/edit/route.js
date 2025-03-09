import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";


export const POST = async (req, res) => {
  try {
    await connectToDb();
    let payload = await req.json();
    if (payload.draftData && payload.draftData._id) {
      const res = await FantasyDraft.findOneAndUpdate({ _id: payload.draftData._id, is_deleted: false }, payload.draftData, { new: true });
      const data = await FantasyDraft.find({ _id: res._id, is_deleted: false })
        .populate("leagueID", "invite_code league_image_path league_name min_teams max_teams")
        .populate({
          path: "teams.team", // Path to the nested field
          select: "team_name team_image_path players", // Fields to retrieve
          populate: {
            path: "players.player", // Path to populate within the team object
            select: "name image_path common_name team_name position_name team_image_path", // Fields to retrieve from the player model
          },
        });
      return NextResponse.json({ error: false, data: data[0] });
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
