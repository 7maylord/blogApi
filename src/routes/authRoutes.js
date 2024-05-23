const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');
const validator = require('../validators/authValidator.js')

//For user registration and login
router.post('/register', validator.signupValidation, auth.register);
router.post('/login', validator.loginValidation, auth.login);


module.exports = router;