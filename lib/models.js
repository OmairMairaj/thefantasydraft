import mongoose, { mongo } from "mongoose";

const teamSchema = new mongoose.Schema({
  id: {
    type: Number,
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
  },
  players: {
    type: [Number],
    required: true,
    unique: false,
  }
}, { timestamps: true });

const gameweekSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  seasonID: {
    type: Number,
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
}, { timestamps: true });

const matchSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  seasonID: {
    type: Number,
    required: true,
  },
  gameweekID: {
    type: Number,
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
      player_id: Number,
      player_name: String,
      team_id: Number,
      team_name: String,
      position_id: Number,
      position_name: String,
      formation_position: String,
      jersey_number: String
    }]
  },
  events: {
    type: [{
      team_id: Number,
      team_name: String,
      event_id: Number,
      event_name: String,
      player_id: Number,
      player_name: String,
      related_player_id: Number,
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
      team_id: Number,
      team_name: String,
      short_code: String,
      image_path: String,
      location: String,
      winner: Boolean
    }]
  },
  scores: {
    type: [{
      score_type_id: Number,
      score_type_name: String,
      team_id: Number,
      team_name: String,
      team_type: String,
      goals: Number
    }]
  }
}, { timestamps: true });

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
}, { timestamps: true })

const playerSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  common_name: {
    type: String,
    required: true
  },
  image_path: {
    type: String,
  },
  nationality: {
    type: String,
  },
  nationality_image_path: {
    type: String,
  },
  positionID: {
    type: Number,
  },
  position_name: {
    type: String,
  },
  detailed_position: {
    type: String,
  },
  teamID: {
    type: Number,
    required: true
  },
  team_name: {
    type: String,
  },
  team_image_path: {
    type: String,
  },
  fpl: {
    type: {
      price: Number,
    },
    required: false
  },
  points: {
    type: [{
      status: {
        type: String,
        enum: ['Finished', 'In Process', 'Not Started'],
        default: "Not Started"
      },
      seasonID: Number,
      gameweekID: Number,
      gameweek_name: String,
      points: Number,
      goals: Number,
      assists: Number,
      clean_sheet: Number,
      yellow_card: Number,
      red_card: Number,
      bonus: Number,
      deduction: Number,
      addition: Number,
    }],
    required: false
  },
}, { timestamps: true })

const fantasyLeagueSchema = new mongoose.Schema({
  league_name: {
    type: String,
    required: true
  },
  league_image_path: {
    type: String
  },
  creator: {
    type: String,
    required: true
  },
  users_invited: {
    type: [String],
    required: false,
    default: []
  },
  users_onboard: {
    type: [String],
    required: false,
    default: []
  },
  draft_order: {
    type: [String],
    required: false,
    default: []
  },
  draft_configuration: {
    type: {
      time_per_pick: {
        type: Number,
        default: 60
      },
      state: {
        type: String,
        enum: ['Manual', 'Scheduled', 'In Process', 'Ended'],
        default: "Manual"
      },
      start_date: {
        type: Date,
        default: Date.now()
      }
    }
  },
  league_configuration: {
    type: {
      auto_subs: {
        type: Boolean,
        default: true
      },
      waiver_format: {
        type: String,
        enum: ["FAAB", "Rolling", "Weekly", "None"],
        default: "None"
      },
      starting_waiver: {
        type: Number,
        default: 250
      },
      format: {
        type: String,
        enum: ["Head to Head", "Classic"],
        default: "Classic"
      }
    }
  },
  league_fixtures: {
    type: [{
      gameweek: String,
      teams: [String]
    }]
  },
  teams: {
    type: [{
      user: String,
      team: String
    }]
  }
}, { timestamps: true })

const fantasyTeamSchema = new mongoose.Schema({
  team_name: {
    type: String
  },
  user: {
    type: String
  },
  players: {
    type: [{
      playerID: Number,
      in_team: Boolean,
      captain: Boolean,
      vice_captain: Boolean,
      position_name: String
    }]
  },
}, { timestamps: true })

export const Team = mongoose.models?.Team || mongoose.model("Team", teamSchema);
export const GameWeek = mongoose.models?.GameWeek || mongoose.model("GameWeek", gameweekSchema);
export const User = mongoose.models?.User || mongoose.model("User", userSchema);
export const Match = mongoose.models?.Match || mongoose.model("Match", matchSchema);
export const Player = mongoose.models?.Player || mongoose.model("Player", playerSchema);
export const FantasyLeague = mongoose.models?.FantasyLeague || mongoose.model("FantasyLeague", fantasyLeagueSchema);
export const FantasyTeam = mongoose.models?.FantasyTeam || mongoose.model("FantasyTeam", fantasyTeamSchema);
