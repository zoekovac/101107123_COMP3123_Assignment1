const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

        logger[level]("http_request", {
            method: req.method,
            path: req.originalUrl.split("?")[0],
            status: res.statusCode,
            duration_ms: Math.round(durationMs),
            user_id: req.user ? req.user.id : null,
            ip: req.ip
        });
    });

    next();
};

module.exports = requestLogger;
