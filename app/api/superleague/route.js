import { SuperLeague, FantasyLeague } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Helper: fetch league ids from invite codes
async function getLeagueIdsFromInviteCodes(inviteCodes) {
    const leagues = await FantasyLeague.find({ invite_code: { $in: inviteCodes }, is_deleted: false });
    return leagues;
}

// GET Super Leagues (GET) by User
export const GET = async (req) => {
    try {
        await connectToDb();
        const url = new URL(req.url)
        const user = url.searchParams.get("user");
        if (!user) {
            return NextResponse.json(
                { error: true, message: "User not authenticated." },
                { status: 401 }
            );
        }

        const userId = new mongoose.Types.ObjectId(user);
        const superLeagues = await SuperLeague.find({ owner: userId })
            .populate({
                path: "leagues",
                populate: [
                    { path: "classic_points.team" },
                    { path: "head_to_head_points.team" }
                ]
            });


        return NextResponse.json({ error: false, data: superLeagues }); // [] if none found
    } catch (err) {
        console.error("Error fetching super leagues:", err);
        return NextResponse.json(
            { error: true, message: "Failed to fetch super leagues." },
            { status: 500 }
        );
    }
};

// CREATE Super League (POST)
export const POST = async (req) => {
    try {
        await connectToDb();

        const body = await req.json();
        const { user, name, image, leagues } = body;
        // leagues: array of league ObjectIds (from frontend, after resolving codes)

        // If your frontend sends invite codes instead, swap to inviteCodes here
        // const { name, image, inviteCodes } = body;

        // Get the user ID from session/JWT/middleware
        // (Adapt this to your actual auth, for demo use a placeholder)
        // fallback for testing

        if (user && user._id) {
            return NextResponse.json({ error: true, message: "User not authenticated." });
        }

        if (!name || !leagues || !Array.isArray(leagues) || leagues.length === 0) {
            return NextResponse.json({ error: true, message: "Name and at least 1 league required." });
        }
        if (leagues.length > 6) {
            return NextResponse.json({ error: true, message: "Maximum 6 leagues allowed." });
        }

        // Optionally: validate each league ObjectId exists and isn't deleted
        const foundLeagues = await FantasyLeague.find({ _id: { $in: leagues }, is_deleted: false });
        if (foundLeagues.length !== leagues.length) {
            return NextResponse.json({ error: true, message: "Some leagues not found or are invalid." });
        }

        // Create new super league
        const superLeague = await SuperLeague.create({
            owner: user,
            name,
            image: image || null,
            leagues,
        });

        return NextResponse.json({ error: false, data: superLeague });
    } catch (err) {
        console.error("Error creating super league:", err);
        return NextResponse.json({ error: true, message: "Failed to create super league." });
    }
};

// PATCH (Update) Super League by ID
export const PATCH = async (req) => {
    try {
        await connectToDb();
        const url = new URL(req.url);
        const Id = url.searchParams.get("Id");

        if (!Id) {
            return NextResponse.json(
                { error: true, message: "Super League ID is required." },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { name, image, leagues } = body;

        // Validate leagues if present
        if (leagues) {
            if (!Array.isArray(leagues) || leagues.length < 1)
                return NextResponse.json({ error: true, message: "At least 1 league required." });
            if (leagues.length > 6)
                return NextResponse.json({ error: true, message: "Maximum 6 leagues allowed." });

            // Check all league IDs exist and are not deleted
            const foundLeagues = await FantasyLeague.find({ _id: { $in: leagues }, is_deleted: false });
            if (foundLeagues.length !== leagues.length)
                return NextResponse.json({ error: true, message: "Some leagues not found or invalid." });
        }

        // Build update object
        const update = {};
        if (name) update.name = name;
        if (typeof image === "string") update.image = image;
        if (leagues) update.leagues = leagues;

        const updated = await SuperLeague.findByIdAndUpdate(
            Id,
            { $set: update },
            { new: true }
        );

        if (!updated)
            return NextResponse.json({ error: true, message: "Super League not found." }, { status: 404 });

        return NextResponse.json({ error: false, data: updated, message: "Super League updated." });
    } catch (err) {
        console.error("Error updating super league:", err);
        return NextResponse.json({ error: true, message: "Failed to update super league." }, { status: 500 });
    }
};


// GET Super Leagues (GET) by User
export const DELETE = async (req) => {
    try {
        await connectToDb();
        const url = new URL(req.url)
        const Id = url.searchParams.get("Id");
        if (!Id) {
            return NextResponse.json(
                { error: true, message: "League ID not found. Please contact support." },
                { status: 401 }
            );
        }

        const superLeaguesDeleted = await SuperLeague.findByIdAndDelete(Id);
        return NextResponse.json({ data: superLeaguesDeleted, error: false, message: "Super League deleted successfully." }); // [] if none found

    } catch (err) {
        console.error("Error deleting super leagues:", err);
        return NextResponse.json(
            { error: true, message: "Failed to delete super leagues." },
            { status: 500 }
        );
    }
};