import { FantasyAchievement } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const data = await FantasyAchievement.find({});
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
    const newFantasyAchievement = await FantasyAchievement.create(payload);
    return NextResponse.json({ error: false, data: newFantasyAchievement });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err.message,
      message: "An unexpected error occurred, please try again."
    });
  }
};
