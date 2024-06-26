const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');


//For author/user routes
router.get('/', auth.verifyToken, userController.getUserBlogs);
router.patch('/:blogId', auth.verifyToken, userController.updateBlogState);

module.exports = router;
