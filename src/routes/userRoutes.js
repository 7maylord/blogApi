const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');

//For user signup and login
router.post('/signup', auth.signUp);
router.post('/signin', auth.signIn);

//For author routes
router.get('/user', auth.verifyToken, userController.getUserBlogs);
router.put('/user/:blogId', auth.verifyToken, userController.updateBlogState);

module.exports = router;
