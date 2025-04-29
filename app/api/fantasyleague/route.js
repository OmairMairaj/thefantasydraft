import { FantasyDraft, FantasyLeague, FantasyTeam, Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { generateInviteCode } from "../../../lib/helpers";
import { sendMultipleEmails } from "../../../lib/mail";
import mongoose from "mongoose"

export const GET = async (req) => {
  try {
    await connectToDb();

    // Extract email and leagueId from query parameters
    const email = req.nextUrl.searchParams.get("email");
    const leagueId = req.nextUrl.searchParams.get("leagueId");

    let leagues;

    if (leagueId) {
      // Find a specific league by ID and populate teams
      leagues = await FantasyLeague.find({ _id: leagueId, is_deleted: false })
        .populate([
          {
            path: "teams.team", // Populate teams inside the league
            populate: {
              path: "players.player", // Populate players inside each team
            },
          },
          {
            path: "draftID", // Populate draftID separately
          },
          {
            path: "head_to_head_points.team"
          },
          {
            path: "classic_points.team"
          },
          {
            path: "league_fixtures.teams",
          }
        ]);
      if (!leagues || leagues.length === 0) {
        return NextResponse.json({
          error: true,
          message: "League not found",
        });
      } else {
        leagues = leagues[0];
      }
    } else if (email) {
      // Find all leagues where the user's email is in users_onboard array
      leagues = await FantasyLeague.find({ users_onboard: email, is_deleted: false })
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
        })
    } else {
      // Return all fantasy leagues if no filters are provided
      leagues = await FantasyLeague.find({ is_deleted: false });
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

    // Connect to DB 
    await connectToDb();
    let payload = await req.json();
    let userTeam = {};

    //create first team
    if (payload.teamData) {
      const teamObj = {
        team_name: payload.teamData.teamName,
        team_image_path: payload.teamData.teamLogo,
        ground_name: payload.teamData.groundName,
        ground_image_path: payload.teamData.selectedGround,
        userID: new mongoose.Types.ObjectId(payload.teams[0].userID),
        user_email: payload.teams[0].user_email,
        // pick_list: PickList
      }
      userTeam = await FantasyTeam.create(teamObj);
    }

    //add team ID to league
    payload.teams[0].team = new mongoose.Types.ObjectId(userTeam._id);
    payload.teams[0].userID = new mongoose.Types.ObjectId(payload.teams[0].userID);

    // Add points OBJ to league for team
    payload.classic_points = [];
    payload.head_to_head_points = [];
    if (payload.league_configuration.format && (payload.league_configuration.format === "Classic")) {
      payload.classic_points.push({
        team: payload.teams[0].team,
        points_total: 0,
        points_current: 0
      })
    } else {
      payload.head_to_head_points.push({
        team: payload.teams[0].team,
        points: 0,
        wins: 0,
        loses: 0,
        draws: 0,
        form: "- - - - -",
      })
    }

    //Generate invite 
    payload.invite_code = await generateInviteCode();

    // add points config array 
    payload.points_configuration = [];
    for (var x = 1; x <= 38; x++) {
      payload.points_configuration.push({
        gameweek: x + "",
        goals: 5,
        assists: 3,
        "clean-sheet": 4,
        "goals-conceded": -1,
        penalty_save: 5,
        saves: 0.333,
        penalty_miss: -3,
        yellowcards: -1,
        redcards: -3,
        "minutes-played": 1,
        tackles: 0.2,
        interceptions: 0.2,
        bonus: 1,
      });
    }

    //Create league object
    let newFantasyLeague = await FantasyLeague.create(payload);

    // Send email invites
    if (newFantasyLeague) {
      let emails;
      if (newFantasyLeague.invite_code) {
        const email_body = `<body><h3>Hello there!</h3><br /><p> You have been invited to Play Draft Fantasy! Please follow the link below to join ${newFantasyLeague.league_name}.</p><br /><p> Please accept your invite by following this link :</p><br /><br /><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}join-league-process?code=${newFantasyLeague.invite_code}">VIEW INVITE</a><br /><br /><p>If you have questions or you did not initiate this request, we are here to help. Email us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</p><br /><br /><p>Regards,</p><p>Team Fantasy Draft</p></body>`
        emails = await sendMultipleEmails(newFantasyLeague.users_invited, "Fantasy League Invitation", email_body);
      }

      // Create draft OBJ
      const newDraftObj = await FantasyDraft.create({
        leagueID: new mongoose.Types.ObjectId(newFantasyLeague._id),
        creator: newFantasyLeague.creator,
        order: newFantasyLeague.users_onboard,
        time_per_pick: payload.draft_configuration.time_per_pick,
        state: payload.draft_configuration.state,
        start_date: payload.draft_configuration.start_date,
        teams: newFantasyLeague.teams
      });

      // Add league ID to draft
      userTeam.leagueID = new mongoose.Types.ObjectId(newFantasyLeague._id);
      userTeam.save()

      // Add draft ID to league
      newFantasyLeague.draftID = new mongoose.Types.ObjectId(newDraftObj._id);
      newFantasyLeague.save()

      // Return response
      return NextResponse.json({ error: false, leagueData: newFantasyLeague, draftData: newDraftObj, teamData: userTeam, emailData: emails });

    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error creating league, please try again."
    });
  }
};

export async function DELETE(req) {
  try {
    await connectToDb();

    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get("leagueId");

    if (!leagueId) {
      return NextResponse.json({
        error: true,
        message: "League ID is required.",
      });
    }

    // Check if the league exists
    const league = await FantasyLeague.find({ _id: leagueId, is_deleted: false });
    if (!league) {
      return NextResponse.json({
        error: true,
        message: "League not found.",
      });
    }

    // Remove associated teams and draft data
    await FantasyTeam.findOneAndUpdate({ leagueID: leagueId }, { is_deleted: true });
    await FantasyDraft.findOneAndUpdate({ leagueID: leagueId }, { is_deleted: true });

    // Delete the league itself
    await FantasyLeague.findOneAndUpdate({ _id: leagueId }, { is_deleted: true });

    return NextResponse.json({
      error: false,
      message: "League deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting league: ", err);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred while deleting the league.",
    });
  }
}