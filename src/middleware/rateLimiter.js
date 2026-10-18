const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn("rate_limit_exceeded", { path: req.originalUrl.split("?")[0], ip: req.ip });
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later"
        });
    }
});

module.exports = { authLimiter };
