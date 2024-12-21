import { Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const Players = await Player.find().sort({ rating: -1 });
    return NextResponse.json({ error: false, data: Players });
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
      err: err,
      message: "An unexpected error occurred, please try again."
    });
  }
};
