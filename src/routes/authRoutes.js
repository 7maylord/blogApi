const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');

//For user registration and login
router.post('/register', auth.register);
router.post('/login', auth.login);


module.exports = router;