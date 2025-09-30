import { FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectToDb();

        // Extract the teamId from the request parameters
        const { teamId } = params;

        // Find the fantasy team by ID
        let team = await FantasyTeam.find({ _id: teamId, is_deleted: false }).populate({
            path: "players.player", // Path to the nested field
            select: "name image_path common_name team_name position_name team_image_path points teamID", // Fields to retrieve
            populate: {
                path: "points.gameweek",
                select: "id name seasonID", // Add any additional fields you need
            },
        });

        if (!team || team.length === 0) {
            return NextResponse.json({
                error: true,
                message: `Team with ID ${teamId} not found.`,
            });
        } else {
            team = team[0];
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
        // console.log("body");
        // console.log(body);
        // Basic sense check for squad
        let Goalkeeper_count = 0;
        let Defender_count = 0;
        let Midfielder_count = 0;
        let Attacker_count = 0;
        body.players.map((item) => {
            if (item.in_team) {
                if (item.player.position_name === "Goalkeeper") Goalkeeper_count = Goalkeeper_count + 1;
                else if (item.player.position_name === "Defender") Defender_count = Defender_count + 1;
                else if (item.player.position_name === "Midfielder") Midfielder_count = Midfielder_count + 1;
                else if (item.player.position_name === "Attacker") Attacker_count = Attacker_count + 1;
            }
        })
        if (Goalkeeper_count > 1) {
            return NextResponse.json({
                error: true,
                message: "You can not have more than 1 Goalkeeper in your team"
            });
        } else if (Goalkeeper_count < 1) {
            return NextResponse.json({
                error: true,
                message: "You need to have at least 1 Goalkeeper in your team"
            });
        } else if (Defender_count < 3) {
            return NextResponse.json({
                error: true,
                message: "You need to have at least 3 Defenders in your team"
            });
        } else if (Midfielder_count < 3) {
            return NextResponse.json({
                error: true,
                message: "You need to have at least 3 Midfielders in your team"
            });
        } else if (Attacker_count < 1) {
            return NextResponse.json({
                error: true,
                message: "You need to have at least 1 Attacker in your team"
            });
        } else {

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
        }
    } catch (err) {
        console.error("Error updating team:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again later.",
        });
    }
};
