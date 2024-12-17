import { FantasyLeague, FantasyTeam, FantasyDraft } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

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
    if (payload.teamData) {
      const teamObj = {
        team_name: payload.teamData.teamName,
        team_image_path: payload.teamData.teamLogo,
        ground_name: payload.teamData.groundName,
        ground_image_path: payload.teamData.selectedGround,
        userID: payload.userData._id,
        user_email: payload.userData.email,
      }
      userTeam = await FantasyTeam.create(teamObj);
    }
    let leagueData = await FantasyLeague.findOne({ invite_code: payload.leagueData.inviteCode });
    let draftData = await FantasyDraft.findOne({ _id: leagueData.draftID });

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

    const savedDataLeague = await leagueData.save()
    const savedDataDraft = await draftData.save()

    return NextResponse.json({
      error: false,
      message:"Successfully joined League!",
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
