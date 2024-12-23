import { Player, FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { sendMultipleEmails } from "../../../../lib/mail";
import { TfiControlShuffle } from "react-icons/tfi";
import { ConnectionStates } from "mongoose";
import mongoose from "mongoose";

export const GET = async (req) => {
  try {
    await connectToDb();
    // Get parameters from URL
    const draftID = req.nextUrl.searchParams.get("draftID");
    const teamID = req.nextUrl.searchParams.get("teamID");

    // Get objects from DB
    let draft = await FantasyDraft.findOne({ _id: draftID });
    console.log("draft")
    console.log(draft)
    let team = await FantasyTeam.findOne({ _id: teamID }).populate("pick_list");
    // console.log("team")
    // console.log(team)
    const selectedPlayers = team.players;
    // Get all Players from DB
    let allPlayers = team.pick_list;

    // Extract selected players by position
    const selectedPositions = selectedPlayers.reduce((acc, player) => {
      acc[player.position_name] = (acc[player.position_name] || 0) + 1;
      return acc;
    }, {});
    //  // Extract selected players by club
    //  const selectedClubs = selectedPlayers.reduce((acc, player) => {
    //   acc[player.club] = (acc[player.club] || 0) + 1;
    //   return acc;
    // }, {});

    // Filter out selected players of this team
    let remainingPlayers = allPlayers.filter(player => !selectedPlayers.some(selected => selected.playerID === player._id));
    // Filter out selected players of other teams
    remainingPlayers = remainingPlayers.filter(player => !draft.players_selected.some(selected => selected === player._id));

    // console.log(draft.squad_configurations)
    // Apply maximum position limits
    if (!draft.squad_configurations) draft.squad_configurations = {
      goalkeepers: 2,
      defenders: 5,
      midfielders: 5,
      attackers: 3,
    }
    const positionLimits = {
      Goalkeeper: draft.squad_configurations.goalkeepers,
      Defender: draft.squad_configurations.defenders,
      Midfielder: draft.squad_configurations.midfielders,
      Attacker: draft.squad_configurations.attackers
    };
    remainingPlayers = remainingPlayers.filter(player => {
      return (selectedPositions[player.position_name] || 0) < positionLimits[player.position_name];
    });

    // // Apply maximum club limits
    // const clubLimit = 3;
    // remainingPlayers = remainingPlayers.filter(player => {
    //   return (selectedClubs[player.club] || 0) < clubLimit;
    // });

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
    await connectToDb();
    //contains DraftID, PlayerID, TeamID, PlayerObj
    let payload = await req.json();
    let draft = await FantasyDraft.findOne({ _id: payload.draftID });
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
    let team = await FantasyTeam.findOne({ _id: teamID });
    // console.log(team);
    let playerObj = {
      player: new mongoose.Types.ObjectId(payload.playerObj._id),
      in_team: payload.playerObj.in_team,
      captain: payload.playerObj.captain,
      vice_captain: payload.playerObj.vice_captain
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
      draft.state = "Ended";
      draft.start_date = null;
      draft.turn = null;
      draft.draft_round = 0
    }

    team.save();
    draft.save();
    // console.log(team);
    // console.log(draft);
    return NextResponse.json({
      error: false,
      draft: draft,
      team: team,
    });

  } catch (err) {
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "Error creating league, please try again."
    });
  }
};

