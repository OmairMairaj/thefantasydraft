import { GameWeek, Match, Player, Team, User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse, userAgent } from "next/server";
import { validateRegisterInput, getConfirmationCode, hashPassword } from "@/lib/helpers"
import { sendEmail } from "@/lib/mail";

// export const GET = async (req, res) => {
//   connectToDb();
//   const x = await Player.deleteMany({})
//   return NextResponse.json({
//     x: x,
//   })
// };

export const POST = async (req, res) => {
  try {
    connectToDb();
    const payload = await req.json();
    const { errors, isValid } = validateRegisterInput(payload)

    if (!isValid) {
      return NextResponse.json({
        error: true,
        message: Object.values(errors)[0]
      })
    } else {
      const userDuplicate = await User.findOne({ email: payload.email });
      if (userDuplicate) {
        return NextResponse.json({
          error: true,
          message: "A user with this email already exists. Please login or use another email"
        })
      } else {
        const hash = await hashPassword(payload.password)
        if (hash) {
          const confCode = getConfirmationCode();
          const newUser = await User.create({
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password: hash,
            confirmation_code: confCode,
            status: 'Pending Email Verification'
          })
          const email_body = `<body><h3>Hello ${newUser.first_name}</h3><br /><p> Thank you for signing up for Fantasy Draft.</p><br /><p> Lets get started. Please verify your account by following this link :</p><br /><br /><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}verify?code=${confCode} ">Verify Account</a><br /><br /><p>If you have questions, we are here to help. Email us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</p><br /><br /><p>Regards,</p><p>Team Fantasy Draft</p></body>`
          const email = await sendEmail(payload.email, "Fantasy Registration : Verification Email", email_body)
          return NextResponse.json({
            error: false,
            message: "Sign-Up Successful. Please check inbox for verification email",
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