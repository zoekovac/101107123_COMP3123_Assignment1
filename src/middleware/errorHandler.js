const appError = require("../utils/appError");

const send = (res, status, message, errors) => {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(status).json(body);
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof appError) {
        return send(res, err.statusCode, err.message);
    }

    if (err.type === "entity.parse.failed") {
        return send(res, 400, "Malformed JSON in request body");
    }

    if (err.type === "entity.too.large") {
        return send(res, 400, "Request body is too large");
    }

    if (err.name === "TokenExpiredError") {
        return send(res, 401, "Authentication token has expired");
    }
    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
        return send(res, 401, "Invalid authentication token");
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "resource";
        return send(res, 409, `A user with that ${field} already exists`);
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message
        }));
        return send(res, 400, "Validation failed", errors);
    }

    if (err.name === "CastError") {
        return send(res, 400, `Invalid value for ${err.path}`);
    }

    console.error("Server error:", err);
    return send(res, 500, "Internal server error");
};

module.exports = errorHandler;
