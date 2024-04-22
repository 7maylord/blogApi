const express = require("express");
const userRoutes = require("./routes/userRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const blogRoutes = require("./routes/blogRoutes.js");
const logger = require("./services/logger.js");
const winston = require("winston");
const dotenv = require("dotenv");
//const path = require('path');

dotenv.config();
require('./exceptions/loggerErrorHandler.js')

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Views
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));



// Routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);

//Later for views
// renders the home page
app.get('/', (req, res) => {
  res.status(200);
  res.json({
    message: "Welcome to Olumide Blogging API",
  });
});

// // renders the register page
// app.get('/register', (req, res) => {
//   res.render('register');
// });

// // renders the login page
// app.get('/login', (req, res) => {
//   res.render('login');
// });

// app.get("/logout", (req, res) => {
//   res.clearCookie("jwt");
//   res.redirect("/login");
// });


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

//catch all route
app.all("*", (req, res) => {
  res.status(404);
  res.json({
    message: "Not found here",
  });
});

//Later for views
// app.all('*', (req, res) => {
//   res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
// });

module.exports = app;
