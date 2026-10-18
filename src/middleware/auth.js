const mongoose = require("mongoose");
const User = require("../models/User");
const appError = require("../utils/appError");
const { verifyToken } = require("../utils/token");

const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        throw new appError(401, "Authentication token is missing");
    }

    const token = header.slice("Bearer ".length).trim();

    if (!token) {
        throw new appError(401, "Authentication token is missing");
    }

    const payload = verifyToken(token);

    if (!payload.userId || !mongoose.isValidObjectId(payload.userId)) {
        throw new appError(401, "Invalid authentication token");
    }

    const userExists = await User.exists({ _id: payload.userId });

    if (!userExists) {
        throw new appError(401, "Invalid authentication token");
    }

    req.user = { id: payload.userId };
    next();
};

module.exports = authenticate;
