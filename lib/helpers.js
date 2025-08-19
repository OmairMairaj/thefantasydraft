import validator from 'validator'
import isEmpty from 'is-empty'
import bcrypt from "bcryptjs/dist/bcrypt";
import { MongoClient } from 'mongodb';
import { connectToDb } from "@/lib/utils";
import { FantasyLeague, FantasyDraft, FantasyTeam, Player, GameWeek } from "@/lib/models";
import { NextResponse } from 'next/server';

export const validateRegisterInput = (data) => {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.first_name = !isEmpty(data.first_name) ? data.first_name : ""
    data.last_name = !isEmpty(data.last_name) ? data.last_name : ""
    data.email = !isEmpty(data.email) ? data.email : ""
    data.password = !isEmpty(data.password) ? data.password : ""
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : ""

    // Name checks
    if (validator.isEmpty(data.first_name)) {
        errors.name = "First Name field is required"
    } else if (!validator.isAlpha(data.first_name)) {
        errors.email = "First Name must have alphabets only."
    }
    if (validator.isEmpty(data.last_name)) {
        errors.name = "Last Name field is required"
    } else if (!validator.isAlpha(data.last_name)) {
        errors.email = "Last Name must have alphabets only."
    }

    // Email checks
    if (validator.isEmpty(data.email)) {
        errors.email = "Email field is required"
    } else if (!validator.isEmail(data.email)) {
        errors.email = "Email is invalid. Please enter a valid email"
    }

    // Password checks
    if (validator.isEmpty(data.password)) {
        errors.password = "Password field is required"
    }
    // Re-Password checks
    if (validator.isEmpty(data.confirm_password)) {
        errors.confirm_password = "Confirm Password field is required"
    }
    // Password matching checks
    if (data.confirm_password != data.password) {
        errors.match_password = "The two passwords do not match"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

export const validateLoginInput = (data) => {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.email = !isEmpty(data.email) ? data.email : ""
    data.password = !isEmpty(data.password) ? data.password : ""

    // Email checks
    if (validator.isEmpty(data.email)) {
        errors.email = "Email field is required"
    } else if (!validator.isEmail(data.email)) {
        errors.email = "Email is invalid. Please enter a valid email"
    }

    // Password checks
    if (validator.isEmpty(data.password)) {
        errors.password = "Password field is required"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

export const validateUserUpdate = (data) => {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.first_name = !isEmpty(data.first_name) ? data.first_name : ""
    data.last_name = !isEmpty(data.last_name) ? data.last_name : ""
    data.email = !isEmpty(data.email) ? data.email : ""

    // Name checks
    if (validator.isEmpty(data.first_name)) {
        errors.name = "First Name field is required"
    } else if (!validator.isAlpha(data.first_name)) {
        errors.email = "First Name must have alphabets only."
    }
    if (validator.isEmpty(data.last_name)) {
        errors.name = "Last Name field is required"
    } else if (!validator.isAlpha(data.last_name)) {
        errors.email = "Last Name must have alphabets only."
    }

    // Email checks
    if (validator.isEmpty(data.email)) {
        errors.email = "Email field is required"
    } else if (!validator.isEmail(data.email)) {
        errors.email = "Email is invalid. Please enter a valid email"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

export const getConfirmationCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token
}

export const generateInviteCode = async () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let code = '';

    function generateCode() {
        let tempCode = '';
        for (let i = 0; i < 4; i++) {
            tempCode += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        for (let i = 0; i < 4; i++) {
            tempCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return tempCode;
    }
    try {
        await connectToDb();
        let isUnique = false;
        while (!isUnique) {

            code = generateCode();
            const existingCode = await FantasyLeague.find({ invite_code: code, is_deleted: false });
            console.log(existingCode)
            if (existingCode.length == 0) {
                isUnique = true;
            }
        }
    } catch {
        console.log("invite code generation failed")
    }
    return code;
}

export const hashPassword = (password) => {
    try {
        return bcrypt.hash(password, 10).then(function (hash) {
            return hash
        })
    } catch (err) {
        throw new Error(err);
    }
}

export const comparePassword = (password, hashed) => {
    try {
        return bcrypt.compare(password, hashed)
    } catch (err) {
        throw new Error(err);
    }
}

export const filterPlayers = async (allPlayers, draftID, teamID) => {

    // Get objects from DB
    let draft = await FantasyDraft.findOne({ _id: draftID, is_deleted: false }).populate("players_selected");
    let team = await FantasyTeam.findOne({ _id: teamID, is_deleted: false }).populate("players.player");

    // Process players
    const allSelectedPlayers = draft.players_selected;
    const userSelectedPlayers = team.players.map(i => i.player);

    // Extract selected players by position
    const selectedPositions = userSelectedPlayers.reduce((acc, player) => {
        acc[player.position_name] = (acc[player.position_name] || 0) + 1;
        return acc;
    }, {});
    // Extract selected players by club
    const selectedClubs = userSelectedPlayers.reduce((acc, player) => {
        acc[player.teamID] = (acc[player.teamID] || 0) + 1;
        return acc;
    }, {});

    // Filter out selected players
    let remainingPlayers = allPlayers.filter(player =>
        !allSelectedPlayers.some(selected => selected.id === player.id)
    );

    // Apply maximum position limits
    if (!draft.squad_configurations) draft.squad_configurations = {
        goalkeepers: 2,
        defenders: 5,
        midfielders: 5,
        attackers: 3,
    }
    const positionLimits = {
        Goalkeeper: draft.squad_configurations.goalkeepers,
        Defender: draft.squad_configurations.defenders,
        Midfielder: draft.squad_configurations.midfielders,
        Attacker: draft.squad_configurations.attackers
    };
    remainingPlayers = remainingPlayers.filter(player => {
        return (selectedPositions[player.position_name] || 0) < positionLimits[player.position_name];
    });

    // Apply maximum club limits
    const clubLimit = draft.max_players_per_club || 3;
    remainingPlayers = remainingPlayers.filter(player => {
        return (selectedClubs[player.teamID] || 0) < clubLimit;
    });
    return remainingPlayers;
}

export const filterPlayersForTransfer = async (allPlayers, draftID, teamID, playerID) => {
    // console.log(allPlayers.length);
    // console.log(draftID);
    // console.log(teamID);
    // console.log(playerID);

    // Get objects from DB
    let draft = await FantasyDraft.findOne({ _id: draftID, is_deleted: false }).populate("players_selected");
    let team = await FantasyTeam.findOne({ _id: teamID, is_deleted: false }).populate("players.player");

    // Process players
    const allSelectedPlayers = draft.players_selected;
    let userSelectedPlayers = team.players.filter((i) => {
        // console.log(i.player._id)
        // console.log(playerID)
        // console.log((!(i.player._id.equals(playerID))))
        return (!(i.player._id.equals(playerID)))
    });
    userSelectedPlayers = userSelectedPlayers.map((i) => i.player)

    // Extract selected players by club
    const selectedClubs = userSelectedPlayers.reduce((acc, player) => {
        acc[player.teamID] = (acc[player.teamID] || 0) + 1;
        return acc;
    }, {});
    // console.log("selectedClubs")
    // console.log(selectedClubs)

    // Filter out selected players
    let remainingPlayers = allPlayers.filter(player =>
        !allSelectedPlayers.some(selected => selected.id === player.id)
    );

    // Apply maximum club limits
    const clubLimit = draft.max_players_per_club || 3;
    remainingPlayers = remainingPlayers.filter(player => {
        return (selectedClubs[player.teamID] || 0) < clubLimit;
    });
    return remainingPlayers;
}

export const setInTeam = async (draft) => {
    let all_gameweeks = await GameWeek.find({});
    console.log("all_gameweeks")
    console.log(all_gameweeks)
    let teamIDs = draft.teams.map(item => item.team);
    // console.log("teamIDs")
    // console.log(teamIDs)
    let teams = await FantasyTeam.find({ _id: { $in: teamIDs }, is_deleted: false }).populate("players.player");
    let out = [];
    for (let i = 0; i < teams.length; i++) {
        let position_count = {
            "Goalkeeper": 0,
            "Defender": 0,
            "Midfielder": 0,
            "Attacker": 0
        }
        let required_positions = {
            "Goalkeeper": 1,
            "Defender": 4,
            "Midfielder": 4,
            "Attacker": 2
        }
        let new_players_starting = [];
        let new_players_bench = [];

        teams[i].players.map((player) => {

            let position = player.player.position_name

            if (new_players_starting.length < draft.lineup_players &&
                position_count[position] < required_positions[position]
            ) {
                new_players_starting.push({
                    player: player.player._id,
                    in_team: true,
                    captain: false,
                    vice_captain: false,
                })
                // console.log("new_players_starting")
                // console.log(new_players_starting)
                position_count[position] = position_count[position] + 1;
            } else {
                new_players_bench.push({
                    player: player.player._id,
                    in_team: false,
                    captain: false,
                    vice_captain: false,
                })
            }
        })
        new_players_starting[0].captain = true;
        new_players_starting[1].vice_captain = true;
        let new_players = new_players_starting.concat(new_players_bench)
        // console.log("old_players")
        // console.log(teams[i].players)
        // console.log("new_players")
        // console.log(new_players)
        teams[i].players = new_players;


        // Assigning this teams[i] to all historical squad array objects
        let temp_history = [];
        all_gameweeks.forEach(one_gameweek => {
            console.log(one_gameweek._id);
            temp_history.push({
                gameweek: one_gameweek._id,
                players: new_players
            })
        })
        teams[i].history = temp_history;
        let saved = await teams[i].save();
        out.push({ saved });
    }
    return out;
}

export const calculatePlayerPoints = async (league, player, gameweek) => {
    let points = 0;
    let stats = {
        "goals": 0,
        "assists": 0,
        "clean-sheet": 0,
        "goals-conceded": 0,
        "penalty_save": 0,
        "saves": 0,
        "penalty_miss": 0,
        "yellowcards": 0,
        "redcards": 0,
        "minutes-played": 0,
        "tackles": 0,
        "interceptions": 0,
        "bonus": 0
    };
    let points_config = {
        "goals": 5,
        "assists": 3,
        "clean-sheet": 4,
        "goals-conceded": -1,
        "penalty_save": 5,
        "saves": 0.333,
        "penalty_miss": -3,
        "yellowcards": -1,
        "redcards": -3,
        "minutes-played": 1,
        "tackles": 0.2,
        "interceptions": 0.2,
        "bonus": 1
    };
    try {
        league.points_configuration.forEach((item) => {
            if (item.gameweek === gameweek.name) {
                points_config["goals"] = item["goals"];
                points_config["assists"] = item["assists"];
                points_config["clean-sheet"] = item["clean-sheet"];
                points_config["goals-conceded"] = item["goals-conceded"];
                points_config["penalty_save"] = item["penalty_save"];
                points_config["saves"] = item["saves"];
                points_config["penalty_miss"] = item["penalty_miss"];
                points_config["yellowcards"] = item["yellowcards"];
                points_config["redcards"] = item["redcards"];
                points_config["minutes-played"] = item["minutes-played"];
                points_config["tackles"] = item["tackles"];
                points_config["interceptions"] = item["interceptions"];
                points_config["bonus"] = item["bonus"];
            }
        })

        player.points.forEach((item) => {
            if (item.gameweek.equals(gameweek._id)) {
                stats["goals"] = item.fpl_stats["goals"];
                stats["assists"] = item.fpl_stats["assists"];
                stats["clean-sheet"] = item.fpl_stats["clean-sheet"];
                stats["goals-conceded"] = item.fpl_stats["goals-conceded"];
                stats["penalty_save"] = item.fpl_stats["penalty_save"];
                stats["saves"] = item.fpl_stats["saves"];
                stats["penalty_miss"] = item.fpl_stats["penalty_miss"];
                stats["yellowcards"] = item.fpl_stats["yellowcards"];
                stats["redcards"] = item.fpl_stats["redcards"];
                stats["minutes-played"] = item.fpl_stats["minutes-played"];
                stats["tackles"] = item.fpl_stats["tackles"];
                stats["interceptions"] = item.fpl_stats["interceptions"];
                stats["bonus"] = item.fpl_stats["bonus"];
            }
        })
    } catch (err) {
        console.log("error occurred")
        console.log(err)
    }
    // console.log("points_config");
    // console.log(points_config);
    // console.log("stats");
    // console.log(stats);
    if (stats["minutes-played"] > 60) points = points + (2 * points_config["minutes-played"])
    else if (stats["minutes-played"] > 30) points = points + (1 * points_config["minutes-played"])
    points = points + (stats.goals * points_config["goals"]);
    points = points + (stats.assists * points_config["assists"]);
    if (player.position_name == "Goalkeeper" || player.position_name == "Defender") points = points + (stats["clean-sheet"] * points_config["clean-sheet"]);
    if (player.position_name == "Goalkeeper" || player.position_name == "Defender") points = points + (stats["goals-conceded"] * points_config["goals-conceded"]);
    points = points + (stats.penalty_save * points_config["penalty_save"]);
    points = points + Math.floor(stats.saves * points_config["saves"]);
    points = points + (stats.penalty_miss * points_config["penalty_miss"]);
    points = points + (stats.yellowcards * points_config["yellowcards"]);
    points = points + (stats.redcards * points_config["redcards"]);
    points = points + Math.floor(stats.tackles * points_config["tackles"]);
    points = points + (stats.interceptions * points_config["interceptions"]);
    points = points + (stats.bonus * points_config["bonus"]);
    if (points > 0) points = Math.floor(points)
    else points = Math.ceil(points);

    return points;
}

export const calculateTeamPoints = async (league, team, gameweek) => {
    try {
        let points = 0;
        // console.log("team");
        // console.log(team);
        let gameweekSquad = team.history.find(item => item.gameweek == gameweek._id)
        if (!gameweekSquad) {
            gameweekSquad = { gameweek: gameweek, players: team.players }
        }
        for (let playerObj of gameweekSquad.players) {
            // console.log("entering player loop");
            if (playerObj.in_team) {
                console.log("player in team");
                // console.log(playerObj);
                let playerDetails = await Player.findOne({ _id: playerObj.player });
                // console.log("playerDetails")
                // console.log(playerDetails)
                if (playerDetails) {
                    let playerPoints = await calculatePlayerPoints(league, playerDetails, gameweek);
                    console.log("playerPoints")
                    console.log(playerDetails.name)
                    console.log(playerPoints)
                    if (!isNaN(playerPoints)) {
                        // console.log("inside nan condition")
                        // if (playerObj.captain) { playerPoints = playerPoints * 2; }
                        points += playerPoints;
                    }
                    console.log("new team points")
                    console.log(points)
                }
            }
        }
        // console.log(team.team_name);
        // console.log("points");
        // console.log(points);
        return points;
    } catch (err) {
        console.log("error occurred");
        console.log(err);
    }
}

export const calculateTeamAndPlayerPoints = async (league, team, gameweek) => {
    try {
        let team_points = 0;
        let gameweekSquad = team.history.find(item => item.gameweek == gameweek._id)
        if (!gameweekSquad) {
            gameweekSquad = { gameweek: gameweek, players: team.players }
        }
        let output = {
            players: [],
            team: {}
        }
        for (let playerObj of gameweekSquad.players) {
            let playerDetails = await Player.findOne({ _id: playerObj.player });
            if (playerDetails) {
                let playerPoints = await calculatePlayerPoints(league, playerDetails, gameweek);

                if (isNaN(playerPoints)) { playerPoints = 0; }
                if (playerObj.captain) { playerPoints = playerPoints * 2; }
                if (playerObj.in_team) { team_points += playerPoints; }

                output.players.push({
                    playerDetails: playerDetails,
                    playerPoints: playerPoints
                })
            }
        }
        output.team = {
            teamDetails: team,
            teamPoints: team_points
        }
        return output;
    } catch (err) {
        console.log("error occurred");
        console.log(err);
    }
}