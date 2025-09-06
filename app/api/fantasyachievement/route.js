import { FantasyAchievement } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const ach_array = [
  // {
  //   name: "THE SNAKE",
  //   desc: "Have a player from each position score 10+ points in a single week",
  //   image_path: "/images/achievements/snake.png"
  // }
]

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


// export const POST = async (req, res) => {
//   try {
//     await connectToDb();    
//     for (const ach of ach_array) {
//       // console.log(ach.name);
//       const newFantasyAchievement = await FantasyAchievement.create(ach);
//       console.log(newFantasyAchievement);
//     }
//     return NextResponse.json({ error: false });
//   } catch (err) {
//     console.log(err);
//     return NextResponse.json({
//       error: true,
//       err: err,
//       message: "An unexpected error occurred, please try again."
//     });
//   }
// };
