import { filterPlayers } from "@/lib/helpers";
import { FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectToDb();
        // Extract the teamId from the request parameters
        const { teamId } = params;
        // Find the fantasy team by ID
        let team = await FantasyTeam.find({ _id: teamId, is_deleted: false }).populate("pick_list").populate("leagueID");
        team = team[0];
        const players = await filterPlayers(team.pick_list, team.leagueID.draftID, team._id);
        return NextResponse.json({ error: false, data: players });
    } catch (err) {
        console.error("Error fetching team:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again later.",
        });
    }
};


export const POST = async (req, { params }) => {
    try {
        await connectToDb();
        let payload = await req.json();
        let id_array = payload.id_array;
        const { teamId } = params;
        // console.log(teamId);
        let team = await FantasyTeam.find({ _id: teamId, is_deleted: false });
        team = team[0];
        if (!team) {
            return NextResponse.json({
                error: true,
                message: `Team with ID ${teamId} not found.`,
            });
        }
        team.pick_list = id_array;
        // console.log("team");
        // console.log(team);
        team.save();
        return NextResponse.json({ error: false, data: team });

    } catch (err) {
        console.error("Error fetching team:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again later.",
        });
    }
};
