import { Match } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const gameweek = parseInt(req.nextUrl.searchParams.get("gameweek")) || 1;

    await connectToDb();
    const totalGameweeks = await Match.distinct("gameweekName");
    const totalPages = totalGameweeks.length;

    const matches = await Match.find({ gameweekName: `${gameweek}` });

    return NextResponse.json({
      error: false,
      data: matches,
      totalPages,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

export const POST = async (req, res) => {
  try {
    await connectToDb();
    const payload = await req.json();
    const newMatch = await Match.create(payload);
    return NextResponse.json({ error: false, data: newMatch });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again.",
    });
  }
};
