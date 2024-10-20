import { User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { validateLoginInput, comparePassword } from "@/lib/helpers"
import jwt from "jsonwebtoken"

export const POST = async (req, res) => {
  try {
    connectToDb();
    const payload = await req.json();
    const { errors, isValid } = validateLoginInput(payload)

    if (!isValid) {
      return NextResponse.json({
        error: true,
        message: Object.values(errors)[0]
      })
    } else {
      const loginUser = await User.findOne({ email: payload.email });
      if (loginUser) {
        if (loginUser.status === 'Suspended') {
          return NextResponse.json({
            error: true,
            message: 'Your account has been suspended. Please contact support for resolution.'
          })
        } else if (loginUser.status === 'Pending Email Verification') {
          return NextResponse.json({
            error: true,
            message: 'The email registered with your account has not yet been verified. Please check your inbox to verify your email.'
          })
        } else {
          console.log(payload);
          console.log(loginUser);
          const isMatch = await comparePassword(payload.password, loginUser.password);
          if (!isMatch) {
            return NextResponse.json({
              error: true,
              message: "The password entered is invalid for this email. Please try again."
            })
          } else {
            const token = await jwt.sign({str:JSON.stringify(loginUser)}, process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_USER, { expiresIn: "1 year" });
            return NextResponse.json({
              error: false,
              message: 'Login successful.',
              token: token,
              user: loginUser
            })
          }
        }
      } else {
        return NextResponse.json({
          error: true,
          message: "We could not find a user with this email. Please try again."
        })
      }
    }
  }
  catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err,
      message: "An unexpected error occurred. Please try again later"
    });
  }
};