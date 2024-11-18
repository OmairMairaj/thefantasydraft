import { FantasyLeague } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const data = await FantasyLeague.find();
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
    const newFantasyLeague = await FantasyLeague.create(payload);
    return NextResponse.json({ error: false, data: newFantasyLeague });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "An unexpected error occurred, please try again."
    });
  }
};
