import { FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectToDb();

        // Extract the teamId from the request parameters
        const { teamId } = params;

        // Find the fantasy team by ID
        const team = await FantasyTeam.find({ _id: teamId, is_deleted: false }).populate({
            path: "players.player", // Path to the nested field
            select: "name image_path common_name team_name position_name team_image_path points", // Fields to retrieve
        });

        if (!team) {
            return NextResponse.json({
                error: true,
                message: `Team with ID ${teamId} not found.`,
            });
        }

        return NextResponse.json({ error: false, data: team });
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

        // Extract teamId from the request parameters
        const { teamId } = params;

        // Parse the request body to get the update data
        const body = await req.json();

        // Check if request body contains data to update
        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({
                error: true,
                message: "No update data provided.",
            });
        }

        // Find the fantasy team and update with the provided fields
        const updatedTeam = await FantasyTeam.findOneAndUpdate(
            { _id: teamId, is_deleted: false },  // Find team by ID
            { $set: body },  // Update only provided fields
            { new: true, runValidators: true }  // Return updated document & validate
        );

        if (!updatedTeam) {
            return NextResponse.json({
                error: true,
                message: `Team with ID ${teamId} not found.`,
            });
        }

        return NextResponse.json({
            error: false,
            message: "Team updated successfully.",
            data: updatedTeam,
        });

    } catch (err) {
        console.error("Error updating team:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again later.",
        });
    }
};
