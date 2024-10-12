import { User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    connectToDb();
    const users = await User.find();
    return NextResponse.json({ error: false, data: users });
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
