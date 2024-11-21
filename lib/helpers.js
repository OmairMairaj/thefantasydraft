import validator from 'validator'
import isEmpty from 'is-empty'
import bcrypt from "bcryptjs/dist/bcrypt";
import { MongoClient } from 'mongodb';
import { connectToDb } from "@/lib/utils";
import { FantasyLeague } from "@/lib/models";

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
        errors.confirm_password = "Re-Enter Password field is required"
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
            if (existingCode.length==0) {
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