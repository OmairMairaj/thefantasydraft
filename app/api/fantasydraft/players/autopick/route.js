import { Player, FantasyDraft, FantasyLeague, FantasyTeam, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { filterPlayers, setInTeam } from "@/lib/helpers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async (req) => {
  try {
    let draftEnd = false;
    // Get parameters from URL
    await connectToDb();
    const draftID = req.nextUrl.searchParams.get("draftID");
    const user_email = req.nextUrl.searchParams.get("email");

    // Get data for DB
    let draft = await FantasyDraft.findOne({ _id: draftID, is_deleted: false });
    let league = await FantasyLeague.findOne({ draftID: draft._id, is_deleted: false });

    // Basic Validations
    if (draft.state !== "In Process") {
      return NextResponse.json({
        error: true,
        message: "The draft is not in progress currently."
      });
    }
    if (draft.turn !== user_email) {
      return NextResponse.json({
        error: true,
        message: "It is not your turn right now to pick a player."
      });
    }

    // Finding team and inserting player in it
    let teamID = draft.teams.find(item => item.user_email === user_email).team
    let team = await FantasyTeam.findOne({ _id: teamID, is_deleted: false }).populate("pick_list");
    let players_length = team.players.length;
    const allPlayers = await Player.find({});
    let canSelectPlayers = []

    if (team.pick_list && team.pick_list.length > 0) {
      canSelectPlayers = await filterPlayers(team.pick_list, draftID, teamID);
      if (canSelectPlayers.length < 1) {
        canSelectPlayers = await filterPlayers(allPlayers, draftID, teamID);
        canSelectPlayers = canSelectPlayers.sort((a, b) => b.rating - a.rating)
      }
    } else {
      canSelectPlayers = await filterPlayers(allPlayers, draftID, teamID);
      canSelectPlayers = canSelectPlayers.sort((a, b) => b.rating - a.rating);
    }
    if (team.players.find(playerObj => playerObj.player.toString() == canSelectPlayers[0]._id)) {
      return NextResponse.json({
        error: true,
        message: "Player already picked."
      });
    }
    let playerObj = {
      player: new mongoose.Types.ObjectId(canSelectPlayers[0]._id),
      in_team: players_length < 11 ? true : false,
      captain: players_length === 0 ? true : false,
      vice_captain: players_length === 1 ? true : false,
    }
    // Updating Team
    team.players.push(playerObj);
    // Updating Draft
    draft.players_selected.push(canSelectPlayers[0]._id)
    let index = draft.order.indexOf(draft.turn)
    if (index == (draft.order.length - 1)) {
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
    console.error("Error fetching drafts: ", err.message);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again later.",
    });
  }
};