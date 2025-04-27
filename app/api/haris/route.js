import { FantasyDraft, FantasyTeam, GameWeek } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { filterPlayers, setInTeam } from "@/lib/helpers";
import { NextResponse } from "next/server";

// export const GET = async (req) => {
//   await connectToDb()
//   let draft = await FantasyDraft.findOne({ _id: "6803cf557d91d175b67ff86b" });
//   const res = await setInTeam(draft);
//   return NextResponse.json({
//     res: res
//   });
// };