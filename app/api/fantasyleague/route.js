import { FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { generateInviteCode } from "../../../lib/helpers";
import { sendMultipleEmails } from "../../../lib/mail";

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
    if (payload.teamData) {
      const teamObj = {
        team_name: payload.teamData.teamName,
        team_image_path: payload.teamData.teamLogo,
        ground_name: payload.teamData.groundName,
        ground_image_path: payload.teamData.selectedGround,
        userID: payload.teams[0].userID,
        user_email: payload.teams[0].user_email,
      }
      userTeam = await FantasyTeam.create(teamObj);
    }
    payload.teams[0].team = userTeam._id;
    payload.invite_code = await generateInviteCode();
    const newFantasyLeague = await FantasyLeague.create(payload);
    if (newFantasyLeague.invite_code) {
      const email_body = `<body><h3>Hello there!</h3><br /><p> You have been invited to Play Draft Fantasy! Please follow the link below to join ${newFantasyLeague.league_name}.</p><br /><p> Please accept your invite by following this link :</p><br /><br /><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}join-league-process?code=${newFantasyLeague.invite_code}">VIEW INVITE</a><br /><br /><p>If you have questions or you did not initiate this request, we are here to help. Email us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</p><br /><br /><p>Regards,</p><p>Team Fantasy Draft</p></body>`
      const emails = await sendMultipleEmails(newFantasyLeague.users_invited, "Fantasy League Invitation", email_body);
      return NextResponse.json({ error: false, leagueData: newFantasyLeague, teamData: userTeam, emailData: emails });
    }
  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error creating league, please try again."
    });
  }
};
