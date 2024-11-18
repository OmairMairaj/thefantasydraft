import { FantasyTeam, FantasyTeam } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const data = await FantasyTeam.find();
    return NextResponse.json({ error: false, data: data });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err,
      message: "An unexpected error occurred please try again later"
    });
  }
};

export const POST = async (req, res) => {
  try {
    await connectToDb();
    const payload = await req.json();
    const newFantasyTeam = await FantasyTeam.create(payload);
    return NextResponse.json({ error: false, data: newFantasyTeam });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "An unexpected error occurred, please try again."
    });
  }
};
