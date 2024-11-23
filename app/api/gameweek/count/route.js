import { GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    try {
        await connectToDb(); // Establish a database connection

        // Get the total count of gameweeks
        const totalGameweeks = await GameWeek.countDocuments();

        return NextResponse.json({
            error: false,
            totalGameweeks,
        });
    } catch (err) {
        console.error("Error fetching total gameweeks count: ", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
