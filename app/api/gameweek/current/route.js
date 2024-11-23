import { GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connectToDb();
        const currentGameweek = await GameWeek.findOne({ is_current: true });

        if (!currentGameweek) {
            return NextResponse.json({
                error: true,
                message: "Current gameweek not found.",
            });
        }

        return NextResponse.json({
            error: false,
            data: currentGameweek,
        });
    } catch (err) {
        console.error("Error fetching current gameweek: ", err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
