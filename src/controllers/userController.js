const Blog = require('../models/blog.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const logger = require('../services/logger.js')

dotenv.config();

exports.getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, state } = req.query;
    const decodedToken = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const query = { authorId: userId };
    if (state) {
      query.state = state;
    }

    const blogs = await Blog.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    logger.info('All authors blogs requested successfully');
    res.status(200).json({ message: 'All authors blogs requested successfully', data: blogs });
  } catch (error) {
    logger.error(`Error requesting all authors blogs: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBlogState = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { state } = req.body;
    const decodedToken = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if the user is the owner of the blog
    if (blog.authorId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this blog state' });
    }

    blog.state = state;
    await blog.save();
    logger.info('Blog published successfully');
    res.status(200).json({ message: 'Blog published successfully', data: blog });
  } catch (error) {
    logger.error(`Error publishing blog: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
