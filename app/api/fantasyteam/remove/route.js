import { FantasyDraft, FantasyLeague, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const POST = async (req, res) => {
  try {
    await connectToDb();
    const payload = await req.json();
    const { teamID, leagueID } = payload;
    if (!teamID || !leagueID) {
      return NextResponse.json({
        error: true,
        message: "Please provide all required fields."
      });
    } else {
      // get database objects
      let draft = await FantasyDraft.findOne({ leagueID: leagueID })
      let league = await FantasyLeague.findOne({ _id: leagueID })
      let team = await FantasyTeam.findOne({ _id: teamID })
      if (!draft || !league || !team) {
        return NextResponse.json({
          error: true,
          message: "Invalid league or team ID provided."
        });
      } else {
        let teamIDs = league.teams.map(e => e.team + "")
        if (teamIDs.indexOf(team._id + "") === -1) {
          return NextResponse.json({
            error: true,
            message: "This team is not part of the league."
          });
        }
        else if (team.user_email === league.creator) {
          return NextResponse.json({
            error: true,
            message: "Admin cannot be removed from the league."
          });
        } else if (team.user_email === league.creator) {
          return NextResponse.json({
            error: true,
            message: "Admin cannot be removed from the league."
          });
        }
        else if (!(draft.state === "Manual" || draft.state === "Scheduled")) {
          return NextResponse.json({
            error: true,
            message: "The draft has already started, you cannot remove a team now."
          });
        }
        else {
          team.is_deleted = true;

          // removing from draft order
          let index = draft.order.indexOf(team.user_email);
          if (index !== -1) draft.order.splice(index, 1);

          // removing from draft teams
          index = draft.teams.findIndex(x => x.team.equals(team._id));
          if (index !== -1) draft.teams.splice(index, 1);

          // removing from league users onboard
          index = league.users_onboard.indexOf(team.user_email);
          if (index !== -1) league.users_onboard.splice(index, 1);

          // removing from league teams
          index = league.teams.findIndex(x => x.team.equals(team._id));
          if (index !== -1) league.teams.splice(index, 1);

          // remove from league team points
          if (league.league_configuration.format === "Classic") {
            index = league.classic_points.findIndex(x => x.team.equals(team._id));
            if (index !== -1) league.classic_points.splice(index, 1);
          } else {
            index = league.head_to_head_points.findIndex(x => x.team.equals(team._id));
            if (index !== -1) league.head_to_head_points.splice(index, 1);
          }

          // save data
          await league.save();
          await draft.save();
          await team.save();

          return NextResponse.json({
            team: team,
            league: league,
            draft: draft
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again."
    });
  }
};
