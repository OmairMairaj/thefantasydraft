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
        const team = await FantasyTeam.findById(teamId).populate("pick_list");
        if (!team) {
            return NextResponse.json({
                error: true,
                message: `Team with ID ${teamId} not found.`,
            });
        }
        return NextResponse.json({ error: false, data: team.pick_list });

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
        const team = await FantasyTeam.findById(teamId);
        if (!team) {
            return NextResponse.json({
                error: true,
                message: `Team with ID ${teamId} not found.`,
            });
        }
        team.pick_list = id_array
        team.save()
        return NextResponse.json({ error: false, data: team });

    } catch (err) {
        console.error("Error fetching team:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again later.",
        });
    }
};
