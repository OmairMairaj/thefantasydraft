import { FantasyDraft, FantasyLeague, FantasyTeam, Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { generateInviteCode } from "../../../lib/helpers";
import { sendMultipleEmails } from "../../../lib/mail";
import mongoose from "mongoose"

export const GET = async (req) => {
  try {
    await connectToDb();

    // Extract email from query parameters
    const email = req.nextUrl.searchParams.get("email");

    let leagues;

    // Check if email parameter is provided
    if (email) {
      // Find all leagues where the user's email is included in the users_onboard array
      leagues = await FantasyLeague.find({ users_onboard: { $in: [email] } });
    } else {
      // Return all fantasy leagues if no email is provided
      leagues = await FantasyLeague.find();
    }

    return NextResponse.json({ error: false, data: leagues });
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

    //create first team
    if (payload.teamData) {
      const PickList = (await Player.find().sort({ rating: -1 })).map(i => i._id);
      const teamObj = {
        team_name: payload.teamData.teamName,
        team_image_path: payload.teamData.teamLogo,
        ground_name: payload.teamData.groundName,
        ground_image_path: payload.teamData.selectedGround,
        userID: new mongoose.Types.ObjectId(payload.teams[0].userID),
        user_email: payload.teams[0].user_email,
        pick_list: PickList
      }
      userTeam = await FantasyTeam.create(teamObj);
    }

    //create league object
    payload.teams[0].team = new mongoose.Types.ObjectId(userTeam._id);
    payload.teams[0].userID = new mongoose.Types.ObjectId(payload.teams[0].userID);
    payload.invite_code = await generateInviteCode();
    let newFantasyLeague = await FantasyLeague.create(payload);
    if (newFantasyLeague) {
      let emails;
      if (newFantasyLeague.invite_code) {
        const email_body = `<body><h3>Hello there!</h3><br /><p> You have been invited to Play Draft Fantasy! Please follow the link below to join ${newFantasyLeague.league_name}.</p><br /><p> Please accept your invite by following this link :</p><br /><br /><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}join-league-process?code=${newFantasyLeague.invite_code}">VIEW INVITE</a><br /><br /><p>If you have questions or you did not initiate this request, we are here to help. Email us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</p><br /><br /><p>Regards,</p><p>Team Fantasy Draft</p></body>`
        emails = await sendMultipleEmails(newFantasyLeague.users_invited, "Fantasy League Invitation", email_body);
      }
      const newDraftObj = await FantasyDraft.create({
        leagueID: new mongoose.Types.ObjectId(newFantasyLeague._id),
        creator: newFantasyLeague.creator,
        order: newFantasyLeague.users_onboard,
        time_per_pick: payload.draft_configuration.time_per_pick,
        state: payload.draft_configuration.state,
        start_date: payload.draft_configuration.start_date,
        teams: newFantasyLeague.teams
      });

      userTeam.leagueID = new mongoose.Types.ObjectId(newFantasyLeague._id);
      userTeam.save()

      newFantasyLeague.draftID = new mongoose.Types.ObjectId(newDraftObj._id);
      console.log(newFantasyLeague)
      newFantasyLeague.save()
      console.log("After save")
      console.log(newFantasyLeague)

      return NextResponse.json({ error: false, leagueData: newFantasyLeague, draftData: newDraftObj, teamData: userTeam, emailData: emails });

    }
  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error creating league, please try again."
    });
  }
};
