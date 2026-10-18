const User = require("../models/User");
const appError = require("../utils/appError");
const { signToken } = require("../utils/token");
const logger = require("../utils/logger");

const signup = async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.exists({ $or: [{ username }, { email }] });

    if (existingUser) {
        logger.warn("signup_conflict", { username, ip: req.ip });
        throw new appError(409, "Username or email already exists");
    }

    const user = await User.create({ username, email, password });

    logger.info("signup_success", { user_id: user._id.toString(), username: user.username });

    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
        }
    });
};

const login = async (req, res) => {
    const { username, email, password } = req.body;

    const query = username ? { username } : { email };
    const user = await User.findOne(query).select("+password");

    const isMatch = user ? await user.comparePassword(password) : false;

    if (!isMatch) {
        logger.warn("login_failed", {
            login_with: username ? "username" : "email",
            reason: user ? "wrong_password" : "unknown_user",
            ip: req.ip
        });
        throw new appError(401, "Invalid credentials");
    }

    logger.info("login_success", { user_id: user._id.toString(), ip: req.ip });

    res.status(200).json({
        success: true,
        message: "Login successful",
        token: signToken(user._id),
        data: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
};

module.exports = { signup, login };
