const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/token");

const signup = async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.exists({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new AppError(409, "Username or email already exists");
    }

    const user = await User.create({ username, email, password });

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
        throw new AppError(401, "Invalid credentials");
    }

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
