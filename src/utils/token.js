const jwt = require("jsonwebtoken");

const ALGORITHM = "HS256";

const signToken = (userId) =>
    jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
        algorithm: ALGORITHM,
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    });

const verifyToken = (token) =>
    jwt.verify(token, process.env.JWT_SECRET, { algorithms: [ALGORITHM] });

module.exports = { signToken, verifyToken };