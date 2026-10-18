const { validationResult } = require("express-validator");
const logger = require("../utils/logger");

const requestValidator = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorList = errors.array().map((error) => ({
            field: error.path || "body",
            message: error.msg
        }));

        logger.warn("validation_failed", {
            method: req.method,
            path: req.originalUrl.split("?")[0],
            fields: [...new Set(errorList.map((e) => e.field))]
        });

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errorList
        });
    }

    next();
};

module.exports = requestValidator;
