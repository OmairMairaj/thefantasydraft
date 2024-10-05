import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    short_code: {
        type: String,
        required: true,
        unique: true,
        max: 3,
        min:3
      },
      image_path: {
        type: String,
        required: true,
        unique: true,
      }
  },
  { timestamps: true }
);

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       min: 3,
//       max: 20,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       max: 50,
//     },
//     password: {
//       type: String,
//     },
//     img: {
//       type: String,
//     },
//     isAdmin: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// const postSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     desc: {
//       type: String,
//       required: true,
//     },
//     img: {
//       type: String,
//     },
//     userId: {
//       type: String,
//       required: true,
//     },
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//   },
//   { timestamps: true }
// );

export const Team = mongoose.models?.Team || mongoose.model("Team", teamSchema);
// export const User = mongoose.models?.User || mongoose.model("User", userSchema);
// export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);