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

const standingsSchema = new mongoose.Schema({
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
  points: {
    type: Number,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  form: {
    type: [{
      form: String,
      sort_order: Number
    }]
  },
  rating: {
    type: Number
  },
  scoring_frequency: {
    type: Number
  },
  lost: {
    type: Number
  },
  games_played: {
    type: Number
  },
  draws: {
    type: Number
  },
  goals_conceded: {
    type: Number
  },
  goals_scored: {
    type: Number
  },
  wins: {
    type: Number
  },
  cleansheets: {
    type: Number
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
      jersey_number: String,
      statistics: {
        type: [{
          value: Number,
          name: String,
          code: String
        }]
      }
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
  rating: {
    type: Number,
    required: true,
    default: 8.0
  },
  // fpl
  points: {
    type: [
      {
        status: {
          type: String,
          enum: ['Finished', 'In Process', 'Not Started'],
          default: "Not Started"
        },
        seasonID: Number,
        gameweek: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'GameWeek',
          required: false
        },
        points: Number,
        fpl_stats: {
          "goals": Number,
          "assists": Number,
          "clean-sheet": Number,
          "goals-conceded": Number,
          "penalty_save": Number,
          "saves": Number,
          "penalty_miss": Number,
          "yellowcards": Number,
          "redcards": Number,
          "minutes-played": Number,
          "tackles": Number,
          "interceptions": Number,
          "bonus": Number
        }
      }],
    required: false
  },
}, { timestamps: true })

const fantasyLeagueSchema = new mongoose.Schema({
  draftID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FantasyDraft',
    required: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  league_name: {
    type: String,
    required: true
  },
  league_image_path: {
    type: String
  },
  paid: {
    type: Boolean,
    default: false
  },
  invite_code: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: String,
    required: true
  },
  min_teams: {
    type: Number,
    default: 2
  },
  max_teams: {
    type: Number,
    default: 20,
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
  head_to_head_points: {
    type: [{
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      },
      points: Number,
      wins: Number,
      loses: Number,
      draws: Number,
      form: String,
    }]
  },
  classic_points: {
    type: [{
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      },
      points_total: Number,
      points_current: Number,
    }]
  },
  points_configuration: {
    type: [{
      gameweek: String,
      goals: Number,
      assists: Number,
      "clean-sheet": Number,
      "goals-conceded": Number,
      penalty_save: Number,
      saves: Number,
      penalty_miss: Number,
      yellowcards: Number,
      redcards: Number,
      "minutes-played": Number,
      tackles: Number,
      interceptions: Number,
      bonus: Number,
    }]
  },
  league_fixtures: {
    type: [{
      gameweek: String,
      teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      }],
      win: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      },
      lose: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      },
      draw: Boolean,
    }]
  },
  teams: {
    type: [{
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
      },
      user_email: {
        type: String,
        required: true
      },
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      },
    }]
  }
}, { timestamps: true })

const fantasyTeamSchema = new mongoose.Schema({
  leagueID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FantasyLeague',
    required: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  team_name: {
    type: String,
    required: true
  },
  team_image_path: {
    type: String
  },
  ground_name: {
    type: String,
    required: true
  },
  ground_image_path: {
    type: String
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  user_email: {
    type: String,
    required: true
  },
  pick_list: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: false
    }],
    required: false
  },
  players: {
    type: [{
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: false
      },
      in_team: { type: Boolean, default: false },
      captain: { type: Boolean, default: false },
      vice_captain: { type: Boolean, default: false }
    }]
  },
  history: {
    type: [{
      gameweek: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gameweek',
        required: false
      },
      players: [{
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
          required: false
        },
        in_team: { type: Boolean, default: false },
        captain: { type: Boolean, default: false },
        vice_captain: { type: Boolean, default: false },
        fpl: {
          points: Number,
          captain_multiplier: Number,
          goals: Number,
          assists: Number,
          clean_sheet: Number,
          penalty_save: Number,
          saves: Number,
          penalty_miss: Number,
          yellow_card: Number,
          red_card: Number,
          mins_played: Number,
          tackles: Number,
          interceptions: Number,
          bonus: Number
        }
      }]
    }],
    default: []
  },
}, { timestamps: true })

const fantasyDraftSchema = new mongoose.Schema({
  leagueID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FantasyLeague',
    required: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  creator: {
    type: String,
    required: true
  },
  order: {
    type: [String],
    required: false,
    default: []
  },
  turn: {
    type: String,
    required: false,
    default: null
  },
  max_players_per_club: {
    type: Number,
    required: false,
    default: 3
  },
  squad_players: {
    type: Number,
    required: false,
    default: 15
  },
  lineup_players: {
    type: Number,
    required: false,
    default: 11
  },
  bench_players: {
    type: Number,
    required: false,
    default: 4
  },
  squad_configurations: {
    type: {
      goalkeepers: Number,
      defenders: Number,
      midfielders: Number,
      attackers: Number
    },
    default: {
      goalkeepers: 2,
      defenders: 5,
      midfielders: 5,
      attackers: 3
    },
  },
  lineup_configurations: {
    type: {
      goalkeepers: Number,
      defenders: Number,
      midfielders: Number,
      attackers: Number
    },
    default: {
      goalkeepers: 1,
      defenders: 3,
      midfielders: 2,
      attackers: 1
    },
  },
  time_per_pick: {
    type: Number,
    default: 60
  },
  draft_round: {
    type: Number,
    default: 1
  },
  state: {
    type: String,
    enum: ['Manual', 'Scheduled', 'In Process', 'Ended'],
    default: "Manual"
  },
  type: {
    type: String,
    enum: ['Snake', 'Auction'],
    default: "Snake"
  },
  start_date: {
    type: Date,
    default: Date.now()
  },
  players_selected: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: false
    }],
    required: false,
    default: []
  },
  teams: {
    type: [{
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
      },
      user_email: {
        type: String,
        required: true
      },
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FantasyTeam',
        required: false
      },
    }]
  }
}, { timestamps: true })

export const Team = mongoose.models?.Team || mongoose.model("Team", teamSchema);
export const GameWeek = mongoose.models?.GameWeek || mongoose.model("GameWeek", gameweekSchema);
export const User = mongoose.models?.User || mongoose.model("User", userSchema);
export const Match = mongoose.models?.Match || mongoose.model("Match", matchSchema);
export const Player = mongoose.models?.Player || mongoose.model("Player", playerSchema);
export const FantasyLeague = mongoose.models?.FantasyLeague || mongoose.model("FantasyLeague", fantasyLeagueSchema);
export const FantasyTeam = mongoose.models?.FantasyTeam || mongoose.model("FantasyTeam", fantasyTeamSchema);
export const Standing = mongoose.models?.Standing || mongoose.model("Standing", standingsSchema);
export const FantasyDraft = mongoose.models?.FantasyDraft || mongoose.model("FantasyDraft", fantasyDraftSchema);
