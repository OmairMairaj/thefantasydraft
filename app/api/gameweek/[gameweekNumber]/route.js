import { GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectToDb();
        const { gameweekNumber } = params; // Extract the dynamic route parameter
        const gameweek = await GameWeek.findOne({ name: parseInt(gameweekNumber) });

        if (!gameweek) {
            return NextResponse.json({
                error: true,
                message: `Gameweek ${gameweekNumber} not found.`,
            });
        }

        return NextResponse.json({
            error: false,
            data: gameweek,
        });
    } catch (err) {
        console.error("Error fetching gameweek: ", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
