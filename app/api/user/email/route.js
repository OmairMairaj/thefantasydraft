import { User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    // Extract email and leagueId from query parameters
    const email = req.nextUrl.searchParams.get("email");
    connectToDb();
    const user = await User.findOne({ email: email });
    let name = user.first_name + " " + user.last_name;
    return NextResponse.json({ error: false, name: name });
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
