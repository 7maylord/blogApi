const express = require("express");
const userRoutes = require("./routes/userRoutes.js");
const blogRoutes = require("./routes/blogRoutes.js");
const logger = require("./services/logger.js");
const winston = require("winston");
const dotenv = require("dotenv");

dotenv.config();
require('./exceptions/loggerErrorHandler.js')

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", userRoutes);
app.use("/blogs", blogRoutes);

// catch all route
// app.all("*", (req, res) => {
//   res.status(404);
//   res.json({
//     message: "Not found",
//   });
// });

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});


// Log request information for all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} ${req.ip}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
// Handle errors and send a response
  res.status(err.status || 500).send(err.message || "Internal Server Error");
});

module.exports = app;
