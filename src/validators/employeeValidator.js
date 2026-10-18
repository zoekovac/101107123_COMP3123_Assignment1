const { body, param, query } = require("express-validator");
const { requireObjectBody, allowOnlyFields } = require("./requestBodyValidator");

const EMPLOYEE_FIELDS = [
    "first_name",
    "last_name",
    "email",
    "position",
    "salary",
    "date_of_joining",
    "department"
];

const requiredText = (field, label, max) => {
    let chain = body(field)
        .isString().withMessage(`${label} must be a string`)
        .bail()
        .trim()
        .notEmpty().withMessage(`${label} is required`);

    if (max) {
        chain = chain.isLength({ max }).withMessage(`${label} cannot exceed ${max} characters`);
    }
    return chain;
};

const employeeValidation = [
    requireObjectBody,

    requiredText("first_name", "First name", 50),
    requiredText("last_name", "Last name", 50),

    body("email")
        .isString().withMessage("Email must be a string")
        .bail()
        .trim()
        .isEmail().withMessage("Valid email is required")
        .bail()
        .toLowerCase(),

    requiredText("position", "Position"),

    body("salary")
        .isFloat({ min: 0 }).withMessage("Salary must be a non-negative number")
        .bail()
        .toFloat(),

    body("date_of_joining")
        .isISO8601({ strict: true }).withMessage("Date of joining must be a valid ISO date (YYYY-MM-DD)")
        .bail()
        .toDate(),

    requiredText("department", "Department"),

    allowOnlyFields(EMPLOYEE_FIELDS)
];

const employeeIdParam = [
    param("eid").isMongoId().withMessage("Invalid employee ID")
];

const employeeIdQuery = [
    query("eid")
        .isString().withMessage("Employee ID is required")
        .bail()
        .isMongoId().withMessage("Invalid employee ID")
];

module.exports = { employeeValidation, employeeIdParam, employeeIdQuery };
