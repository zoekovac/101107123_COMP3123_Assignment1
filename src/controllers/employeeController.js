const Employee = require("../models/Employee");
const appError = require("../utils/appError");
const { getCache, setCache, deleteCache } = require("../services/cacheService");

const CACHE_SECONDS = 60;
const listCacheKey = (userId) => `employees:${userId}`;

const pickEmployeeFields = (body) => ({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    position: body.position,
    salary: body.salary,
    date_of_joining: body.date_of_joining,
    department: body.department
});

const findOwnedEmployee = async (employeeId, userId) => {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
        throw new appError(404, "Employee not found");
    }

    if (employee.user.toString() !== userId) {
        throw new appError(403, "You do not have access to this employee");
    }

    return employee;
};

const getEmployees = async (req, res) => {
    const cacheKey = listCacheKey(req.user.id);
    let employees = await getCache(cacheKey);

    if (employees === null) {
        employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 });
        await setCache(cacheKey, employees, CACHE_SECONDS);
    }

    res.status(200).json({
        success: true,
        message: "Employees retrieved successfully",
        data: employees
    });
};

const createEmployee = async (req, res) => {
    const employee = await Employee.create({
        ...pickEmployeeFields(req.body),
        user: req.user.id
    });

    await deleteCache(listCacheKey(req.user.id));

    res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: employee
    });
};

const getEmployeeById = async (req, res) => {
    const employee = await findOwnedEmployee(req.params.eid, req.user.id);

    res.status(200).json({
        success: true,
        message: "Employee retrieved successfully",
        data: employee
    });
};

const updateEmployee = async (req, res) => {
    const employee = await findOwnedEmployee(req.params.eid, req.user.id);

    employee.set(pickEmployeeFields(req.body));
    await employee.save(); // runs schema validation

    await deleteCache(listCacheKey(req.user.id));

    res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        data: employee
    });
};

const deleteEmployee = async (req, res) => {
    const employee = await findOwnedEmployee(req.query.eid, req.user.id);

    await employee.deleteOne();
    await deleteCache(listCacheKey(req.user.id));

    res.status(204).send();
};

module.exports = {
    getEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
