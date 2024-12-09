import { Player, FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { sendMultipleEmails } from "../../../../lib/mail";
import { TfiControlShuffle } from "react-icons/tfi";

export const GET = async (req) => {
  try {
    await connectToDb();
    const draftID = req.nextUrl.searchParams.get("draftID");
    let draft = await FantasyDraft.findOne({ _id: draftID });
    let players = await Player.find({ _id: { $nin: draft.selected_players } })
    return NextResponse.json({ error: false, data: players });
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
    if (draft.turn !== payload.email) {
      return NextResponse.json({
        error: true,
        message: "It is not your turn right now to pick a player."
      });
    }
    if (draft.players_selected.indexOf(payload.playerObj.playerID) !== -1) {
      return NextResponse.json({
        error: true,
        message: "This player is already selected by another user."
      });
    }
    let teamID = draft.teams.find(item => item.user_email === payload.email).team
    console.log(teamID);
    let team = await FantasyTeam.findOne({ _id: teamID });
    console.log(team);
    let playerObj = {
      playerID: payload.playerObj.playerID,
      player_name: payload.playerObj.player_name,
      in_team: payload.playerObj.in_team,
      captain: payload.playerObj.captain,
      vice_captain: payload.playerObj.vice_captain,
      position_name: payload.playerObj.position_name
    }
    // Updating Team
    team.players.push(playerObj);
    // Updating Draft
    draft.players_selected.push(payload.playerObj.playerID)
    let index = draft.order.indexOf(draft.turn)
    if (index == -1) { throw err; }
    else if (index == (draft.order.length - 1)) {
      draft.order = draft.order.reverse();
      draft.turn = draft.order[0];
    } else {
      draft.turn = draft.order[index + 1]
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

