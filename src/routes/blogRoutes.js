const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth.js');
const redisClient = require('../integration/redis.js');

router.post('/', auth.verifyToken, blogController.createBlog);
router.get('/', blogController.getBlogs);
router.get('/:blogId', blogController.getBlogById);
router.patch('/:blogId', auth.verifyToken, blogController.updateBlog);
router.delete('/:blogId', auth.verifyToken, blogController.deleteBlog);

module.exports = router;
