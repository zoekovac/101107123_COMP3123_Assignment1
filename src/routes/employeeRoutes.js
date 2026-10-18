const express = require("express");

const authenticate = require("../middleware/auth");
const validateRequest = require("../validators/requestValidator");
const {
    employeeValidation,
    employeeIdParam,
    employeeIdQuery
} = require("../validators/employeeValidator");
const {
    getEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

router.use(authenticate);

router.get("/employees", getEmployees);
router.post("/employees", employeeValidation, validateRequest, createEmployee);
router.get("/employees/:eid", employeeIdParam, validateRequest, getEmployeeById);
router.put("/employees/:eid", employeeIdParam, employeeValidation, validateRequest, updateEmployee);
router.delete("/employees", employeeIdQuery, validateRequest, deleteEmployee);

module.exports = router;