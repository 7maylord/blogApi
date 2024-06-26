const Blog = require("../models/blog.js");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const calculateReadingTime = require("../services/readingTime.js");
const dotenv = require("dotenv");
const logger = require("../services/logger.js");
const redisClientPromise = require("../integration/redis.js");

dotenv.config();

exports.createBlog = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;
    const decodedToken = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decodedToken.userId;
    let { firstName, lastName } = decodedToken;
    let author = `${firstName} ${lastName}`;
    const readingTime = calculateReadingTime(body);
    const blog = new Blog({
      title,
      description,
      tags,
      body,
      author,
      authorId: userId,
      state: "draft",
      readingTime,
    });
    await blog.save();
    logger.info("Blog draft created successfully");
    res
      .status(201)
      .json({ message: "Blog draft created successfully", data: blog });
  } catch (error) {
    logger.error(`Error creating blog draft: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId)
      .where("state")
      .eq("published")
      .populate("author", "firstName lastName");
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    // Increment for readCount
    blog.readCount += 1;
    await blog.save();
    logger.info("Blog requested successfully by Id");
    res
      .status(200)
      .json({ message: "Blog requested successfully by Id", data: blog });
  } catch (error) {
    logger.error(`Error requesting blog by Id: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error requesting blog by Id", error: error.message });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, author, title, tags, sortBy } = req.query;
    let query = { state: "published" };

    // Filter by author, title, and tags
    if (author) {
      query.author = author;
    }
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    if (tags) {
      query.tags = { $in: tags.split(",") };
    }

    // Sort by readCount, readingTime, or timestamp
    let sortCriteria = "-timestamp";
    if (
      sortBy === "readCount" ||
      sortBy === "readingTime" ||
      sortBy === "timestamp"
    ) {
      sortCriteria = `-${sortBy}`;
    }
    // Create a unique cache key based on the query parameters
    const cacheKey = `blogs:${page}:${limit}:${author || ""}:${title || ""}:${
      tags || ""
    }:${sortBy || ""}`;

    // Get Redis client
    const redisClient = await redisClientPromise;

    // Check if data is in cache
    const cachedBlogs = await redisClient.get(cacheKey);
    if (cachedBlogs) {
      logger.info("Retrieved blogs from cache");
      return res
        .status(200)
        .json({
          message: "All Published Blogs requested successfully",
          data: JSON.parse(cachedBlogs),
        });
    }

    // If not cached, query the database

    const blogs = await Blog.find(query)
      .populate("author", "firstName lastName")
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    // Cache the result
    redisClient.setEx(cacheKey, 600, JSON.stringify(blogs)); // Cache for 10 minutes (600 seconds)

    logger.info("All Published Blogs requested successfully");
    res
      .status(200)
      .json({
        message: "All Published Blogs requested successfully",
        data: blogs,
      });
  } catch (error) {
    logger.error(`Error requesting all blogs: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, description, tags, body } = req.body;
    const decodedToken = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decodedToken.userId;

    const blog = await Blog.findById(blogId);

    // Check if the user is the owner of the blog
    if (blog.authorId.toString() !== userId) {
      return res
        .status(404)
        .json({ error: "You are not authorized to edit this blog" });
    }

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update blog fields
    blog.title = title;
    blog.description = description;
    blog.tags = tags;
    blog.body = body;
    await blog.save();
    logger.info("Blog updated successfully");
    res.status(200).json({ message: "Blog updated successfully", data: blog });
  } catch (error) {
    logger.error(`Error updating blog: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const decodedToken = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decodedToken.userId;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check if the user is the owner of the blog
    if (blog.authorId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this blog" });
    }
    await Blog.findByIdAndDelete(blogId);
    logger.info("Blog deleted successfully");
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting blog: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
