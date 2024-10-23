import { User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse, userAgent } from "next/server";
import { validateUserUpdate, getConfirmationCode, hashPassword } from "@/lib/helpers"
import { sendEmail } from "@/lib/mail";

export const POST = async (req, res) => {
  try {
    connectToDb();
    const payload = await req.json();
    const { errors, isValid } = validateUserUpdate(payload)

    if (!isValid) {
      return NextResponse.json({
        error: true,
        message: Object.values(errors)[0]
      })
    } else {
      const userUpdate = await User.findOneAndUpdate({ email: payload.email },{first_name:payload.first_name,last_name:payload.last_name});
      if (userUpdate) {
        const userUpdate = await User.findOne({ email: payload.email });
        return NextResponse.json({
          error: false,
          data:userUpdate,
          message: "Details Updated Successfully"
        })
      } else {
        return NextResponse.json({
          error: true,
          message: "Cannot find a user with the details. Please re-login and try again."
        })
      }
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