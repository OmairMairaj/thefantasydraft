import validator from 'validator'
import isEmpty from 'is-empty'
import bcrypt from "bcryptjs/dist/bcrypt";
import { MongoClient } from 'mongodb';
import { connectToDb } from "@/lib/utils";
import { FantasyLeague, FantasyDraft, FantasyTeam, Player } from "@/lib/models";

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
            const existingCode = await FantasyLeague.find({ invite_code: code });
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
    let draft = await FantasyDraft.findOne({ _id: draftID }).populate("players_selected");
    let team = await FantasyTeam.findOne({ _id: teamID }).populate("players.player");

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

export const setInTeam = async (draft) => {
    let teamIDs = draft.teams.map(item => item.team);
    let teams = await FantasyTeam.find({ _id: { $in: teamIDs } }).populate("players.player");
    teams.map((team) => {
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

        team.players.map((player) => {

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

        team.players = new_players;
        let saved = team.save();        
        console.log(saved)
        console.log(new_players)
    })

    return null;
}