const { body } = require("express-validator");

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);


const requireObjectBody = body().custom((value) => {
    if (!isPlainObject(value)) {
        throw new Error("Request body must be a JSON object");
    }
    return true;
});

const allowOnlyFields = (allowedFields) =>
    body().custom((value) => {
        if (!isPlainObject(value)) return true;

        const unexpected = Object.keys(value).filter((key) => !allowedFields.includes(key));

        if (unexpected.length > 0) {
            throw new Error(`Unexpected fields: ${unexpected.join(", ")}`);
        }
        return true;
    });

module.exports = { isPlainObject, requireObjectBody, allowOnlyFields };
