// /api/league-by-invite/route.js
import { FantasyLeague } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    const url = new URL(req.url)
    const inviteCode = url.searchParams.get("inviteCode");

    try {
        await connectToDb();
        if (!inviteCode)
            return NextResponse.json({ error: true, message: "Invite code required" });

        const league = await FantasyLeague.findOne({ invite_code: inviteCode, is_deleted: false });
        if (!league)
            return NextResponse.json({ error: true, message: "No league found with this invite code" });

        return NextResponse.json({ error: false, data: league });
    } catch (err) {
        return NextResponse.json({ error: true, message: "Unexpected error", err: err.message });
    }
};