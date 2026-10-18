const appError = require("../utils/appError");
const logger = require("../utils/logger");

const describeError = (err) => {
    if (err instanceof appError) {
        return { status: err.statusCode, message: err.message };
    }

    if (err.type === "entity.parse.failed") {
        return { status: 400, message: "Malformed JSON in request body" };
    }

    if (err.type === "entity.too.large") {
        return { status: 400, message: "Request body is too large" };
    }

    if (err.name === "TokenExpiredError") {
        return { status: 401, message: "Authentication token has expired" };
    }

    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
        return { status: 401, message: "Invalid authentication token" };
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "resource";
        return { status: 409, message: `A user with that ${field} already exists` };
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message
        }));
        return { status: 400, message: "Validation failed", errors };
    }

    if (err.name === "CastError") {
        return { status: 400, message: `Invalid value for ${err.path}` };
    }

    return { status: 500, message: "Internal server error" };
};

const logEventFor = (status) => {
    if (status === 400) return "validation_failed";
    if (status === 401) return "authentication_failed";
    if (status === 403) return "authorization_failed";
    if (status === 404) return "not_found";
    if (status === 409) return "conflict";
    return "application_error";
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const { status, message, errors } = describeError(err);

    const details = {
        method: req.method,
        path: req.originalUrl.split("?")[0],
        status,
        reason: message,
        user_id: req.user ? req.user.id : null,
        ip: req.ip
    };

    if (status >= 500) {
        logger.error("application_error", { ...details, error: err.message, stack: err.stack });
    } else {
        if (errors) details.fields = errors.map((e) => e.field);
        logger.warn(logEventFor(status), details);
    }

    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(status).json(body);
};

module.exports = errorHandler;
