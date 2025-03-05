import { Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectToDb();
        const { id } = params;
        const player = await Player.findById(id).populate({ path: "points.gameweek" });

        if (!player) {
            return NextResponse.json({
                error: true,
                message: `Player with ID ${id} not found.`,
            });
        }
        let total_points = 0;
        player.points.forEach(point => {
            total_points += point.points;
        })

        if (player.points) {
            // Sort points array based on numerical value of gameweek.name
            player.points.sort((a, b) => {
                if (!a.gameweek || !b.gameweek) return 0; // Handle missing gameweek data

                // Convert gameweek.name to a number before comparison
                const gwA = parseInt(a.gameweek.name, 10) || 0;
                const gwB = parseInt(b.gameweek.name, 10) || 0;

                return gwA - gwB; // Sort in ascending order (GW1, GW2, ...)
            });
        }


        return NextResponse.json({ error: false, data: player });
    } catch (err) {
        console.error("Error fetching player:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred, please try again later.",
        });
    }
}