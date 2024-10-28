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
      min: 3
    },
    image_path: {
      type: String,
      required: true,
      unique: true,
    }
  },
  { timestamps: true }
);


const gameweekSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    seasonID: {
      type: String,
      required: true,
      unique: false
    },
    name: {
      type: String,
      required: true,
      unique: false
    },
    finished: {
      type: Boolean,
      default: false,
      required: true,
    },
    is_current: {
      type: Boolean,
      default: false,
      required: true,
    },
    starting_at: {
      type: Date,
      required: true,
    },
    ending_at: {
      type: Date,
      required: true,
    },
    games_in_current_week: {
      type: Boolean,
      default: false,
      required: true,
    }
  },
  { timestamps: true }
);


const matchSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    seasonID: {
      type: String,
      required: true,
    },
    gameweekID: {
      type: String,
      required: true,
    },
    gameweekName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    starting_at: {
      type: Date,
      required: true,
    },
    result_info: {
      type: String,
      default: null,
      required: true,
    },
    state: {
      type: String
    },
    lineups: {
      type: [{
        player_id: String,
        player_name: String,
        team_id: String,
        team_name: String,
        position_id: String,
        position_name: String,
        formation_position: String,
        jersey_number: String
      }]
    },
    events: {
      type: [{
        team_id: String,
        team_name: String,
        event_id: String,
        event_name: String,
        player_id: String,
        player_name: String,
        related_player_id: String,
        related_player_name: String,
        result: String,
        info: String,
        addition: String,
        minute: String,
        sort_order: String
      }]
    },
    teams: {
      type: [{
        team_id: String,
        team_name: String,
        short_code: String,
        image_path: String,
        location: String,
        winner: Boolean
      }]
    },
    scores: {
      type: [{
        score_type_id: String,
        score_type_name: String,
        team_id: String,
        team_name: String,
        team_type: String,
        goals: Number
      }]
    }
  },
  { timestamps: true }
);


const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  confirmation_code: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['Suspended', 'Active', 'Pending Email Verification'],
    required: false,
    default: "Pending Email Verification"
  },
  forgotPassword: {
    type: Boolean,
    required: false,
    default: false
  },
})


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
export const GameWeek = mongoose.models?.GameWeek || mongoose.model("GameWeek", gameweekSchema);
export const User = mongoose.models?.User || mongoose.model("User", userSchema);
export const Match = mongoose.models?.Match || mongoose.model("Match", matchSchema);
// export const User = mongoose.models?.User || mongoose.model("User", userSchema);
// export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);