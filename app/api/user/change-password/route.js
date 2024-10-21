import { User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import { validateRegisterInput, getConfirmationCode, hashPassword } from "@/lib/helpers"
import { sendEmail } from "@/lib/mail";

export const GET = async (req, res) => {
  try {
    connectToDb();
    const url = new URL(req.url)
    const reqEmail = url.searchParams.get("email");
    const userFound = await User.findOneAndUpdate({ email: reqEmail }, { forgotPassword: true });
    if (!userFound) return NextResponse.json({
      error: true,
      message: "User not found with this email. Please try again."
    })
    else {
      const email_body = `<body><h3>Hello ${userFound.first_name}</h3><br /><p> You have requested a change of password. Please follow the link below to change your password.</p><br /><p> Lets get you logged in! Please reset your password by following this link :</p><br /><br /><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}change-password?code=${userFound.confirmation_code}&email=${userFound.email} ">RESET PASSWORD</a><br /><br /><p>If you have questions or you did not initiate this request, we are here to help. Email us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</p><br /><br /><p>Regards,</p><p>Team Fantasy Draft</p></body>`
      const email = await sendEmail(userFound.email, "Password Reset Request", email_body);
      return NextResponse.json({
        error: false,
        message: "Email sent for password change request. Please check your inbox."
      })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      error: true,
      err: err,
      message: "An unexpected error occurred please try again"
    });
  }
};

export const POST = async (req, res) => {
  try {
    connectToDb();
    const payload = await req.json();

    if (payload.password1 !== payload.password2) {
      return NextResponse.json({
        error: true,
        message: "The two passwords do not match. Please try again."
      })
    } else {
      const userFound = await User.findOne({ email: payload.email, confirmation_code: payload.code, forgotPassword: true });
      if (!userFound) {
        return NextResponse.json({
          error: true,
          message: "No user found with these details. Please try resetting yor password again."
        })
      } else {
        const hash = await hashPassword(payload.password1)
        if (hash) {
          const newUser = await User.findOneAndUpdate({ email: payload.email, confirmation_code: payload.code, forgotPassword: true }, { forgotPassword: false, password: hash });
          return NextResponse.json({
            error: false,
            message: "Password Reset Successful! Please login now.",
            data: newUser
          });
        }
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