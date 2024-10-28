import { Match } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    try {

        let va = Date.now().toString()
        await connectToDb();
        const matches = await Match.findOneAndUpdate(
            { id: 19146698 },
            { $set: { name: va } },
            { returnDocument: "after" }
        );
        return NextResponse.json({
            error: false,
            data: matches,
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
