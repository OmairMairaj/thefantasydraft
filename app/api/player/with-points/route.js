import { Player } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const Mongo_Players = await Player.find().sort({ rating: -1 }).populate({ path: "points.gameweek" });
    let Players = Mongo_Players.map(player => player.toObject())
    
    Players.forEach(player => {
      let total_points = 0;
      player.points.forEach(point => {
        total_points += point.points;
      })
      player.total_points = total_points; // Add total_points to player object
      if (player.points) {
        // Sort points array based on numerical value of gameweek.name
        player.points.sort((a, b) => {
          if (!a.gameweek || !b.gameweek) return 0; // Handle missing gameweek data

          // Convert gameweek.name to a number before comparison
          const gwA = parseInt(a.gameweek.name, 10) || 0;
          const gwB = parseInt(b.gameweek.name, 10) || 0;

          return gwA - gwB; // Sort in ascending order (GW1, GW2, ...)
        });
      }
    });
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
