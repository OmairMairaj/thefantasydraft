import { FantasyLeague } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = async (req, res) => {
  const url = new URL(req.url)
  const reqCode = url.searchParams.get("code");
  const reqEmail = url.searchParams.get("email");
  try {
    await connectToDb();
    const data = await FantasyLeague.find({ invite_code: reqCode, is_deleted: false });
    if (data.length > 0) {
      if (data[0].users_onboard.indexOf(reqEmail) !== -1) return NextResponse.json({ error: true, message: "You are already a member of this league" });
      else return NextResponse.json({ error: false, data: data[0] });
      // if (data[0].users_invited.indexOf(reqEmail) !== -1)
      // else return NextResponse.json({ error: true, message: "You do not have a valid invite to this league. Please ask admin to invite you again" });
    }
    else return NextResponse.json({ error: true, message: "No league found with this invite code" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err,
      message: "An unexpected error occurred please try again later"
    });
  }
};