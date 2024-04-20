// blog.test.js
const request = require("supertest");
const app = require("../src/app.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Blog = require("../src/models/blog.js");
const User = require("../src/models/user.js");
const dotenv = require("dotenv");

dotenv.config();

// Define a test user
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  password: "password",
};

// Generate a JWT token for the test user
const token = jwt.sign(
  {
    userId: testUser._id,
    firstName: testUser.firstName,
    lastName: testUser.lastName,
    email: testUser.email,
  },
  process.env.JWT_SECRET
);

describe("Blog Endpoints", () => {
  let testBlogId;

  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    // Create a test user in the database
    await User.create(testUser);
  });

  afterAll(async () => {
    // Clear the test database after each test
    await Blog.deleteMany();
    await User.deleteMany();
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  
  it("should create a new blog", async () => {
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Blog",
        description: "This is a test blog",
        tags: ["test", "example"],
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.json).toHaveProperty("blog");
    testBlogId = res.body.blog._id;
  });

  it("should get a blog by ID", async () => {
    const res = await request(app)
      .get(`/blogs/${testBlogId}`)
      .set("Authorization", `Bearer ${token}`);
    console.log(res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.json).toHaveProperty("blog");
    expect(res.body.blog.title).toEqual("Test Blog");
  });

  it("should update a blog", async () => {
    const res = await request(app)
      .put(`/blogs/${testBlogId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Test Blog",
        description: "This is a update test blog",
        tags: ["test", "example"],
        body: "eLorem ipsum dolor sit amet, consectetur adipiscing elit."
      });
    console.log(res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.json).toHaveProperty("blog");
    expect(res.body.blog.title).toEqual("Updated Test Blog");
  });

  it("should delete a blog", async () => {
    const res = await request(app)
      .delete(`/blogs/${testBlogId}`)
      .set("Authorization", `Bearer ${token}`);
    console.log(res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.json).toHaveProperty("message", "Blog deleted successfully");
  });
});
