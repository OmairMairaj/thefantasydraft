import { FantasyTeam, Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const data = await FantasyTeam.find({ is_deleted: false });
    // .populate("userID").populate("leagueID").populate("pick_list");
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
    payload.userID = new mongoose.Types.ObjectId(payload.userID);
    payload.leagueID = new mongoose.Types.ObjectId(payload.leagueID);
    // const PickList = (await Player.find().sort({ rating: -1 })).map(i => i._id);
    // payload.pick_list = PickList
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
