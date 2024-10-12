import { Team } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    connectToDb();
    const teams = await Team.find();
    return NextResponse.json({ error: false, data: teams });
  }
  catch (err) {
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
    connectToDb();
    const payload = await req.json();
    console.log(payload);
    if (payload && payload.input && payload.input.length > 0) {
      const newTeam = await Team.insertMany(payload.input)
      return NextResponse.json({ error: false, data: newTeam });
    } else {
      return NextResponse.json({
        error: true,
        err: "Problem with body",
        message: "Please fill in all the fields"
      });
    }
  }
  catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err,
      message: "An unexpected error occurred please try again"
    });
  }
};