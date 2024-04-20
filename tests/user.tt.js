const { signUp, signIn } = require('../src/middleware/auth.js');
const User = require('../src/models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../src/services/logger.js');

jest.mock('../src/models/user.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/services/logger.js');

describe('signUp', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should create a new user and return a success message', async () => {
    req.body = { email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'password' };
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.mockReturnValue({ save: jest.fn().mockResolvedValue() });

    await signUp(req, res);

    expect(User).toHaveBeenCalledWith({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'hashedPassword' });
    expect(User().save).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', data: User() });
  });

  it('should return an error message if user creation fails', async () => {
    req.body = { email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'password' };
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.mockReturnValue({ save: jest.fn().mockRejectedValue(new Error('Failed to save user')) });

    await signUp(req, res);

    expect(User).toHaveBeenCalledWith({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'hashedPassword' });
    expect(User().save).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registration failed', error: 'Failed to save user' });
  });
});

describe('signIn', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should sign in the user and return a token', async () => {
    const user = { _id: '123', email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'hashedPassword' }; 
    req.body = { email: 'test@example.com', password: 'password' };
    User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword', _id: '123', firstName: 'John', lastName: 'Doe' });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');

    await signIn(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith({ email: 'test@example.com', userId: '123', firstName: 'John', lastName: 'Doe' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Login Successful', token: 'token', data: user });
  });

  it('should return an error message if user is not found', async () => {
    req.body = { email: 'test@example.com', password: 'password' };
    User.findOne.mockResolvedValue(null);

    await signIn(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User Not Found' });
  });

  it('should return an error message if password is invalid', async () => {
    req.body = { email: 'test@example.com', password: 'password' };
    User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword' });
    bcrypt.compare.mockResolvedValue(false);

    await signIn(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Password' });
  });

  it('should return an error message if sign-in fails', async () => {
    req.body = { email: 'test@example.com', password: 'password' };
    User.findOne.mockRejectedValue(new Error('Failed to find user'));

    await signIn(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication Failed', error: 'Failed to find user' });
  });
});
