import { Match } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    try {
        await connectToDb();

        // Extract seasonID and teamID from query params
        const seasonID = parseInt(req.nextUrl.searchParams.get("seasonID"));
        const teamID = parseInt(req.nextUrl.searchParams.get("teamID"));

        if (!seasonID || !teamID) { 
            return NextResponse.json({ error: true, message: "Missing seasonID or teamID" });
        }

        // Find all matches for the given season and team
        const matches = await Match.find({
            seasonID: seasonID,
            "teams.team_id": teamID,
        }).sort({ gameweekID: 1 });

        return NextResponse.json({ error: false, data: matches });
    } catch (err) {
        console.error("Error fetching team-season matches:", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
