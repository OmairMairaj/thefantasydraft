import { Standing } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    try {
        await connectToDb();
        const standings = await Standing.find().sort({ position: 'asc' });

        return NextResponse.json({
            error: false,
            data: standings,
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
