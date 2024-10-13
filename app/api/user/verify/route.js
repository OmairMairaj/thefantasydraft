import { User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const POST = async (req, res) => {
  try {
    connectToDb();
    const payload = await req.json();
    if (!payload || !payload.code || payload.code.length <= 0) {
      return NextResponse.json({
        error: true,
        message: 'Error: Confirmation code is required.'
      })
    }
    const confUser = await User.findOneAndUpdate({ confirmation_code: payload.code }, { status: "Active" })
    if (confUser) {
      return NextResponse.json({
        error: false,
        message: 'User Verification successful! Please login',
        user: confUser
      })
    } else {
      return NextResponse.json({
        error: true,
        message: 'User not found with this code. Please reach out to support',
      })
    }
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
