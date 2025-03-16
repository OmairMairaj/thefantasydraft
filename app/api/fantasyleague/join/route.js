import { FantasyLeague, FantasyTeam, FantasyDraft, Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import mongoose from "mongoose";


export const GET = async (req) => {
  try {
    await connectToDb();
    // Extract League ID from query parameters
    const leagueID = req.nextUrl.searchParams.get("leagueID");
    let leagues;
    // Check if email parameter is provided
    if (leagueID) {
      // Find all leagues where the user's email is included in the users_onboard array
      leagues = await FantasyLeague.find({ _id: leagueID, is_deleted: false });
      let teams_to_find = leagues[0].teams.map(item => item.team)
      let teams = await FantasyTeam.find({ _id: { $in: [teams_to_find] }, is_deleted: false });
      let stadiums = teams.map(item => item.ground_image_path)
      return NextResponse.json({ error: false, data: stadiums });
    }
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again later.",
    });
  } catch (err) {
    console.error("Error fetching leagues: ", err);
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
    let userTeam = {};
    if (payload.leagueData.leagueDetails.data.users_onboard.indexOf(payload.userData.email) !== -1) {
      return NextResponse.json({
        error: true,
        message: "You are already a member of this league."
      });
    }
    if (payload.leagueData.leagueDetails.data.max_teams && (payload.leagueData.leagueDetails.data.users_onboard.length > payload.leagueData.leagueDetails.data.max_teams)) {
      return NextResponse.json({
        error: true,
        message: "The limit set for maximum teams has been reached. Please ask admin to increase maximum teams limit."
      });
    }
    let leagueData = await FantasyLeague.findOne({ invite_code: payload.leagueData.inviteCode, is_deleted: false });
    let draftData = await FantasyDraft.findOne({ _id: leagueData.draftID, is_deleted: false });
    if (payload.teamData) {
      // const PickList = (await Player.find().sort({ rating: -1 })).map(i => i._id);
      const teamObj = {
        team_name: payload.teamData.teamName,
        team_image_path: payload.teamData.teamLogo,
        ground_name: payload.teamData.groundName,
        ground_image_path: payload.teamData.selectedGround,
        userID: new mongoose.Types.ObjectId(payload.userData._id),
        leagueID: new mongoose.Types.ObjectId(leagueData._id),
        user_email: payload.userData.email,
        // pick_list: PickList
      }
      userTeam = await FantasyTeam.create(teamObj);
    }


    draftData.order.push(payload.userData.email);
    draftData.teams.push({
      "team": userTeam._id,
      "userID": payload.userData._id,
      "user_email": payload.userData.email
    });
    leagueData.users_onboard.push(payload.userData.email);
    leagueData.teams.push({
      "team": userTeam._id,
      "userID": payload.userData._id,
      "user_email": payload.userData.email
    });
    if (leagueData.league_configuration.format && (leagueData.league_configuration.format === "Classic")) {
      leagueData.classic_points.push({
        team: userTeam._id,
        points_total: 0,
        points_current: 0
      })
    } else {
      leagueData.head_to_head_points.push({
        team: userTeam._id,
        points: 0,
        wins: 0,
        loses: 0,
        draws: 0,
        form: "- - - - -",
      })
    }

    const savedDataLeague = await leagueData.save()
    const savedDataDraft = await draftData.save()

    return NextResponse.json({
      error: false,
      message: "Successfully joined League!",
      dataLeague: savedDataLeague,
      dataDraft: savedDataDraft
    });
    // payload.teams[0].team = userTeam._id;

  } catch (err) {
    console.log(err.message)
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error joining league, please try again."
    });
  }
};
