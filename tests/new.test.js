const request = require("supertest");
const app = require("../src/app.js");
const connectionToMongodb = require("../src/models/dbconnection.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Define a test user
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  firstName: "john",
  lastName: "smith",
  email: "johnsmith@gmail.com",
  password: "testUser1234",
  post: {},
};

const testUser2 = {
  _id: new mongoose.Types.ObjectId(),
  firstName: "jane",
  lastName: "smith",
  email: "janesmith@gmail.com",
  password: "testUser5678",
  post: {},
};
const testUser3 = {
  _id: new mongoose.Types.ObjectId(),
  firstName: "joan",
  lastName: "smith",
  email: "joansmith@gmail.com",
  password: "testUser9101",
  post: {},
};

// Generate a JWT token for the test user
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET
  );
};

const tokenUser = generateToken(testUser);
const tokenUser2 = generateToken(testUser2);
const tokenUser3 = generateToken(testUser3);

const false_id = "66248b5979e99d605c3004a5";
describe("Auth Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  let blog1_id;
  let blog2_id;
  let blog3_id;

  describe("Register tests", () => {
    it("should successfully register user", () => {
      return request(app)
        .post("/auth/register")
        .send(testUser)
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("data");
          expect(res.body.message).toBe("User created successfully");
        });
    });

    it("should successfully register user", () => {
      return request(app)
        .post("/auth/register")
        .send(testUser2)
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("data");
          expect(res.body.message).toBe("User created successfully");
        });
    });
    it("should successfully register user", () => {
      return request(app)
        .post("/auth/register")
        .send(testUser3)
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("data");
          expect(res.body.message).toBe("User created successfully");
        });
    });
  });

  describe("Login tests", () => {
    it("should return error - User Not Found", () => {
      return request(app)
        .post("/auth/login")
        .send({ email: "jhnsmith@gmail.com", password: testUser.password })
        .then((res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe("User Not Found");
        });
    });

    it("should return error - invalid password", () => {
      return request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: "wtf4" })

        .then((res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe("Invalid Password");
        });
    });

    it("should login user", () => {
      return request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })

        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("token");
          expect(res.body).toHaveProperty("data");
          expect(res.body.data).toHaveProperty("_id");
          expect(res.body.data.email).toBe(testUser.email);
          testUser["token"] = res.body.token;
        });
    });

    it("should login user", () => {
      return request(app)
        .post("/auth/login")
        .send({
          email: testUser2.email,
          password: testUser2.password,
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("token");
          expect(res.body).toHaveProperty("data");
          expect(res.body.data).toHaveProperty("_id");
          expect(res.body.data.email).toBe(testUser2.email);
          testUser2["token"] = res.body.token;
        });
    });
    it("should login user", () => {
      return request(app)
        .post("/auth/login")
        .send({
          email: testUser3.email,
          password: testUser3.password,
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("token");
          expect(res.body).toHaveProperty("data");
          expect(res.body.data).toHaveProperty("_id");
          expect(res.body.data.email).toBe(testUser3.email);
          testUser3["token"] = res.body.token;
        });
    });
  });

  describe("POST blogs", () => {
    it("should throw error - unauthenticated", () => {
      return request(app)
        .post("/blogs/")
        .send({})
        .then((res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe("Unauthorized: Missing token");
        });
    });

    it("should throw error - missing fields", () => {
      return request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${testUser.TOKEN}`)
        .send({})
        .then((res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe("Unauthorized: Invalid token");
        });
    });

    it("should successfully create blog", () => {
      return request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({
          title: "test",
          description: "test",
          body: "test",
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("data");
          expect(res.body.message).toBe("Blog draft created successfully");
          expect(res.body.data).toHaveProperty("_id");
          expect(res.body.data).toHaveProperty("state");
          expect(res.body.data.state).toBe("draft");
          blog1_id = res.body.data._id;
        });
    });

    it("should successfully create blog", () => {
      return request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${testUser2.token}`)
        .send({
          title: "test123",
          description: "test2",
          body: "test2",
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("data");
          expect(res.body.message).toBe("Blog draft created successfully");
          expect(res.body.data).toHaveProperty("_id");
          expect(res.body.data).toHaveProperty("state");
          expect(res.body.data.state).toBe("draft");
          blog2_id = res.body.data._id;
        });
    });

    it("should successfully create blog", () => {
      return request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${testUser3.token}`)
        .send({
          title: "test456",
          description: "test3",
          body: "test3",
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("message");
          expect(res.body).toHaveProperty("data");
          expect(res.body.message).toBe("Blog draft created successfully");
          expect(res.body.data).toHaveProperty("_id");
          expect(res.body.data).toHaveProperty("state");
          expect(res.body.data.state).toBe("draft");
          blog3_id = res.body.data._id;
        });
    });
  });

  describe("UPDATE blog", () => {
    it("should throw an error - unauthenticated", async () => {
      return await request(app)
        .patch(`/blogs/${blog1_id}`)
        .set("Content-Type", "application/json")
        .send({})
        .then((res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe("Unauthorized: Missing token");
        });
    });

    it("should throw an error - user updating another user's blog", async () => {
      return await request(app)
        .patch(`/blogs/${blog1_id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${testUser2.token}`)
        .send({})
        .then((res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe(
            "You are not authorized to edit this blog"
          );
        });
    });

    it("should successfully update blog", async () => {
      return await request(app)
        .patch(`/blogs/${blog2_id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${testUser2.token}`)
        .send({
          title: "Updated Test Blog",
          description: "This is a update test blog",
          body: "eLorem ipsum dolor sit.",
        })
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toBe("Blog updated successfully");
          expect(res.body.data.title).toBe("Updated Test Blog");
        });
    });
  });

  describe("UPDATE blog state", () => {
    it("should throw an error - user updating another user's blog state", async () => {
      return await request(app)
        .patch(`/user/${blog2_id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ state: "published" })
        .then((res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe(
            "You are not authorized to update this blog state"
          );
        });
    });
    it("should successfully update blog state", async () => {
      return await request(app)
        .patch(`/user/${blog3_id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${testUser3.token}`)
        .send({ state: "published" })
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toBe("Blog published successfully");
          expect(res.body.data).toHaveProperty("state");
          expect(res.body.data.state).toBe("published");
        });
    });
  });

  describe("GET All blogs", () => {
    it("should return all blogs", async () => {
      return await request(app)
        .get(`/blogs`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toBe(
            "All Published Blogs requested successfully"
          );
        });
    });
  });

  describe("GET A blog", () => {
    it("should return an error - invalid id", async () => {
      return await request(app)
        .get(`/blogs/${false_id}`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe("Blog not found");
        });
    });
  });

  describe("GET All author blogs", () => {
    it("should return all author blogs with default limit and page", async () => {
      return await request(app)
        .get("/user")
        .set("Authorization", `Bearer ${testUser2.token}`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toBe(
            "All authors blogs requested successfully"
          );
        });
    });
  });

  describe("DELETE blogs", () => {
    it("should throw error for unauthorized user", async () => {
      return await request(app)
        .delete(`/blogs/${blog1_id}`)
        .set("Authorization", `Bearer ${testUser2.token}`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body).toHaveProperty("error");
          expect(res.body.error).toBe(
            "You are not authorized to delete this blog"
          );
        });
    });
    it("should delete a blog", async () => {
      return await request(app)
        .delete(`/blogs/${blog3_id}`)
        .set("Authorization", `Bearer ${testUser3.token}`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toBe("Blog deleted successfully");
        });
    });
  });
});

module.exports = {
  testUser,
  testUser2,
  testUser3,
};
