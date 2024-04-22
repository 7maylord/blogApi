const { verifyToken } = require("../src/middleware/auth.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

describe("verifyToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next() if token is valid", () => {
    const token = jwt.sign({ userId: "123" }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userData.userId).toBe("123");
  });

  it("should return 401 and error message if token is missing", () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Missing token",
    });
  });

  it("should return 401 and error message if token is invalid", () => {
    req.headers.authorization = "Bearer invalidtoken";

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Invalid token",
    });
  });
});
