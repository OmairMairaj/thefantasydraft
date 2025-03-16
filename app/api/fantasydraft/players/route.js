import { Player, FantasyDraft, FantasyLeague, FantasyTeam, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { filterPlayers, setInTeam } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { sendMultipleEmails } from "../../../../lib/mail";
import { TfiControlShuffle } from "react-icons/tfi";
import { ConnectionStates } from "mongoose";
import mongoose from "mongoose";

export const GET = async (req) => {
  try {
    // Get parameters from URL
    await connectToDb();
    const draftID = req.nextUrl.searchParams.get("draftID");
    const teamID = req.nextUrl.searchParams.get("teamID");
    const allPlayers = await Player.find({});
    // Function Call for filtering players
    const remainingPlayers = await filterPlayers(allPlayers, draftID, teamID);
    // Return
    return NextResponse.json({ error: false, data: remainingPlayers, });

  } catch (err) {
    console.error("Error fetching drafts: ", err.message);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again later.",
    });
  }
};


export const POST = async (req, res) => {
  try {
    let draftEnd = false;
    await connectToDb();
    //contains DraftID, PlayerID, TeamID, PlayerObj
    let payload = await req.json();
    let draft = await FantasyDraft.findOne({ _id: payload.draftID, is_deleted: false });
    let league = await FantasyLeague.findOne({ draftID: payload.draftID, is_deleted: false });
    if (draft.state !== "In Process") {
      return NextResponse.json({
        error: true,
        message: "The draft is not in progress currently."
      });
    }
    if (draft.turn !== payload.user_email) {
      return NextResponse.json({
        error: true,
        message: "It is not your turn right now to pick a player."
      });
    }
    if (draft.players_selected.indexOf(payload.playerObj._id) !== -1) {
      return NextResponse.json({
        error: true,
        message: "This player is already selected by another user."
      });
    }
    let teamID = draft.teams.find(item => item.user_email === payload.user_email).team
    // console.log(teamID);
    let team = await FantasyTeam.findOne({ _id: teamID , is_deleted: false});

    // let playerObj = getPlayerObjForPick(draft, payload.playerObj._id, team.players)
    // return NextResponse.json({
    //   error: false,
    //   message: "we testing."
    // });
    if (team.players.find(playerObj => playerObj.player.toString() == payload.playerObj._id)) {
      return NextResponse.json({
        error: true,
        message: "Player already picked."
      });
    }

    let players_length = team.players.length;
    let playerObj = {
      player: new mongoose.Types.ObjectId(payload.playerObj._id),
      in_team: players_length < 11 ? true : false,
      captain: players_length === 0 ? true : false,
      vice_captain: players_length === 1 ? true : false,
    }

    // Updating Team
    team.players.push(playerObj);
    // Updating Draft
    draft.players_selected.push(payload.playerObj._id)
    let index = draft.order.indexOf(draft.turn)
    if (index == -1) { throw err; }
    else if (index == (draft.order.length - 1)) {
      draft.order = draft.order.reverse();
      draft.draft_round = draft.draft_round + 1;
      draft.turn = draft.order[0];
    } else {
      draft.turn = draft.order[index + 1]
    }

    // Checking for draft end
    if ((draft.draft_round - 1) === draft.squad_players) {
      draftEnd = true;
      draft.state = "Ended";
      draft.start_date = null;
      draft.turn = null;
      draft.draft_round = 0

      //If league type is head to head then initiating match scheduling
      if (league.league_configuration.format === "Head to Head") {
        let gameweeks = await GameWeek.find().sort({ starting_at: 1 });
        let fixtures = [];
        let all_teams = league.teams.map(i => i.team);
        let total_teams = all_teams.length;

        // Ensure the number of teams is even
        if (total_teams % 2 !== 0) {
          throw new Error("Total number of teams must be even.");
        }

        for (let week = 0; week < gameweeks.length; week++) {
          let week_fixtures = [];
          for (let i = 0; i < total_teams / 2; i++) {
            let home = (week + i) % (total_teams - 1);
            let away = (total_teams - 1 - i + week) % (total_teams - 1);

            // Last team stays fixed, others rotate around it
            if (i === 0) {
              away = total_teams - 1;
            }

            week_fixtures.push({
              gameweek: gameweeks[week].name,
              teams: [
                new mongoose.Types.ObjectId(all_teams[home]),
                new mongoose.Types.ObjectId(all_teams[away])
              ]
            });
          }
          fixtures.push(...week_fixtures);
        }
        league.league_fixtures = fixtures
      } else {
        league.league_fixtures = null
      }
      league.save();
    }

    team.save();
    draft.save();
    if (draftEnd) {
      // Setting bench, in-team players, captain and v.captain for all teams
     let response = await setInTeam(draft);
    }
    return NextResponse.json({
      error: false,
      league: league,
      draft: draft,
      team: team
    });

  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error picking a player, please try again or contact support."
    });
  }
};

// export const POST = async (req, res) => {
//   try {
//     await connectToDb();
//     let payload = await req.json();
//     let draft = await FantasyDraft.findOne({ _id: payload.draftID , is_deleted: false});
//     await setInTeam(draft);
//     return NextResponse.json({
//       error: false,
//       draft: draft,
//     });

//   } catch (err) {
//     return NextResponse.json({
//       error: true,
//       err: err.message,
//       message: "Error picking a player, please try again or contact support."
//     });
//   }
// };

