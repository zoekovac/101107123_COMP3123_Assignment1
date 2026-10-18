const express = require("express");

const { signup, login } = require("../controllers/userController");
const { signupValidation, loginValidation } = require("../validators/userValidator");
const validateRequest = require("../validators/validateRequest");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", authLimiter, signupValidation, validateRequest, signup);
router.post("/login", authLimiter, loginValidation, validateRequest, login);

module.exports = router;
