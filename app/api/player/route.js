import { Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const Player = await Player.find();
    return NextResponse.json({ error: false, data: Player });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred please try again later"
    });
  }
};

export const POST = async (req, res) => {
  try {
    await connectToDb();
    const payload = await req.json();
    const newPlayer = await Player.create(payload);
    return NextResponse.json({ error: false, data: newPlayer });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      message: "An unexpected error occurred, please try again."
    });
  }
};
