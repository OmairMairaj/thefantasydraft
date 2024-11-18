import { FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const data = await FantasyLeague.find();
    return NextResponse.json({ error: false, data: data });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err,
      message: "An unexpected error occurred please try again later"
    });
  }
};

export const POST = async (req, res) => {
  try {
    await connectToDb();
    let payload = await req.json();
    let userTeam = {};
    if (payload.teamData) {
      const teamObj = {
        team_name: payload.teamData.teamName,
        team_image_path: payload.teamData.teamLogo,
        ground_name: payload.teamData.groundName,
        ground_image_path: payload.teamData.selectedGround,
        userID: payload.teams[0].userID,
        user_email: payload.teams[0].user_email,
      }
      console.log("teamObj")
      console.log(teamObj)
      userTeam = await FantasyTeam.create(teamObj);
      console.log(userTeam)
    }
    payload.teams[0].team = userTeam._id;
    const newFantasyLeague = await FantasyLeague.create(payload);
    return NextResponse.json({ error: false, leagueData: newFantasyLeague, teamData: userTeam });
  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error creating league, please try again."
    });
  }
};
