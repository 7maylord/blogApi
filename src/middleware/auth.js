const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const logger = require('../services/logger.js')

dotenv.config();

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.userData = decoded;
    next();
  });
};

exports.register = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword
    });
    await user.save();
    logger.info({ message: 'User created successfully', data: user });
    res.status(201).json({ message: 'User created successfully', data: user });
  } catch (error) {
    logger.error({ message: 'Registration failed', error: error.message })
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User Not Found' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid Password' });
    }
    const token = jwt.sign({ email: user.email, userId: user._id, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logger.info({ message: "Login Successful", data: user });
    res.status(201).json({ message: "Login Successful", token , data: user });
  } catch (error) {
    logger.error({ message: "Authentication Failed", error: error.message })
    res.status(500).json({ message: "Authentication Failed", error: error.message });
  }
};
