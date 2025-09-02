import { GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
    // try {
    //     await connectToDb();
    //     const currentGameweek = await GameWeek.findOne({ is_current: true });

    //     if (!currentGameweek) {
    //         return NextResponse.json({
    //             error: true,
    //             message: "Current gameweek not found.",
    //         });
    //     }

    //     return NextResponse.json({
    //         error: false,
    //         data: currentGameweek,
    //     });
    // } 
    try {
        await connectToDb();
        
        // Step 1: Attempt to find the gameweek with 'is_current: true'
        let currentGameweek = await GameWeek.findOne({ is_current: true });

        // Step 2: If no current gameweek is found, fall back to finding the next upcoming one
        if (!currentGameweek) {
            // Find a gameweek where the 'ending_at' date is greater than the current date
            // This retrieves the next scheduled gameweek
            const now = new Date();
            currentGameweek = await GameWeek.findOne({ ending_at: { $gt: now } }).sort({ ending_at: 1 });
        }
        
        // Handle the case where no gameweek can be found at all
        if (!currentGameweek) {
            return NextResponse.json({
                error: true,
                message: "No current or upcoming gameweek found.",
            });
        }
        
        return NextResponse.json({
            error: false,
            data: currentGameweek,
        });
    }
    catch (err) {
        console.error("Error fetching current gameweek: ", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
