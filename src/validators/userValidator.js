const { body } = require("express-validator");
const { isPlainObject, requireObjectBody, allowOnlyFields } = require("./requestBodyValidator");

const USER_FIELDS = ["username", "email", "password"];

const requireUsernameOrEmail = body().custom((value) => {
    if (!isPlainObject(value)) return true;

    const hasUsername = typeof value.username === "string" && value.username.trim() !== "";
    const hasEmail = typeof value.email === "string" && value.email.trim() !== "";

    if (hasUsername === hasEmail) {
        throw new Error("Provide either username or email, not both");
    }
    return true;
});

const signupValidation = [
    requireObjectBody,

    body("username")
        .isString().withMessage("Username must be a string")
        .bail()
        .trim()
        .toLowerCase()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-z0-9]+$/).withMessage("Username may only contain letters and numbers"),

    body("email")
        .isString().withMessage("Email must be a string")
        .bail()
        .trim()
        .isEmail().withMessage("Please provide a valid email")
        .bail()
        .toLowerCase(),

    body("password")
        .isString().withMessage("Password must be a string")
        .bail()
        .isLength({ min: 8, max: 50 }).withMessage("Password must be 8-50 characters")
        .bail()
        .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain a number")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain a special character"),

    allowOnlyFields(USER_FIELDS)
];

const loginValidation = [
    requireObjectBody,

    body("username")
        .optional()
        .isString().withMessage("Username must be a string")
        .bail()
        .trim()
        .toLowerCase(),

    body("email")
        .optional()
        .isString().withMessage("Email must be a string")
        .bail()
        .trim()
        .toLowerCase(),

    body("password")
        .isString().withMessage("Password is required")
        .bail()
        .notEmpty().withMessage("Password cannot be empty"),

    requireUsernameOrEmail,
    allowOnlyFields(USER_FIELDS)
];

module.exports = { signupValidation, loginValidation };
