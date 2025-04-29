import { FantasyLeague } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";


export const POST = async (req, res) => {
  try {
    await connectToDb();
    let payload = await req.json();
    let data = await FantasyLeague.findOneAndUpdate({ _id: payload.league._id, is_deleted: false }, { paid: true }, { new: true })
      .populate("draftID")
      .populate({
        path: "teams.team",
        select: "ground_name ground_image_path team_name team_image_path"
      })
      .populate({
        path: "league_fixtures.teams"
      })
      .populate({
        path: "head_to_head_points.team"
      })
      .populate({
        path: "classic_points.team"
      });
    return NextResponse.json({
      error: false,
      data: data,
      message: "Payment made successfully!"
    });
  } catch (err) {
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred please try again later"
    });
  }
};