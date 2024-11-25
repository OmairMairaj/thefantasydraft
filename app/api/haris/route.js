import { FantasyTeam, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  await connectToDb()
  const res = await GameWeek.deleteMany({});
  return NextResponse.json({
    res: res
  });
};