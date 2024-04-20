const {
  createBlog,
  getBlogById,
  getBlogs,
  updateBlog,
  deleteBlog,
} = require("../src/controllers/blogController.js");
const Blog = require("../src/models/blog.js");
const jwt = require("jsonwebtoken");
const logger = require("../src/services/logger.js");

jest.mock("../src/models/blog.js");
jest.mock("jsonwebtoken");
jest.mock("../src/services/logger.js");

describe("Blog Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("createBlog", () => {
    it("should create a new blog draft", async () => {
      const userId = 'user123';
      const token = 'token123';
      req.body = { title: 'Test Blog', description: 'Test Description', tags: ['test'], body: 'Test Body' };
      req.headers = { authorization: `Bearer ${token}` };
      jwt.verify.mockReturnValue({ userId });
      
      await createBlog(req, res);

      expect(Blog).toHaveBeenCalledTimes(1);
      expect(Blog).toHaveBeenCalledWith({
        title: "Test Blog",
        description: "Test Description",
        tags: ["test"],
        body: "Test Body",
        authorId: userId,
        state: "draft",
        readingTime: expect.any(Number),
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Blog draft created successfully"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Blog draft created successfully",
        blog: expect.any(Object),
      });
    });
  });

  // describe('getBlogById', () => {
  //   it('should return a blog by id', async () => {
  //     const blogId = 'blog123';
  //     req.params = { blogId };
  //     const blog = { _id: blogId, title: 'Test Blog', description: 'Test Description', tags: ['test'], body: 'Test Body', author: { firstName: 'John', lastName: 'Doe' } };
  //     Blog.findById.mockResolvedValue(blog);

  //     await getBlogById(req, res);

  //     expect(Blog.findById).toHaveBeenCalledWith(blogId);
  //     expect(logger.info).toHaveBeenCalledWith('Blog requested successfully by Id');
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({ message: 'Blog requested successfully by Id', blog });
  //   });
  // });

  // describe('getBlogs', () => {
  //   it('should return all published blogs', async () => {
  //     const blogs = [{ _id: 'blog123', title: 'Test Blog', description: 'Test Description', tags: ['test'], body: 'Test Body', author: { firstName: 'John', lastName: 'Doe' } }];
  //     Blog.find.mockResolvedValue(blogs);
  //     req.query = { page: 1, limit: 10 };

  //     await getBlogs(req, res);

  //     expect(Blog.find).toHaveBeenCalledWith({ state: 'published' });
  //     expect(logger.info).toHaveBeenCalledWith('All Blogs requested successfully');
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({ blogs });
  //   });
  // });

  // describe('updateBlog', () => {
  //   it('should update a blog', async () => {
  //     const blogId = 'blog123';
  //     const userId = 'user123';
  //     const token = 'token123';
  //     req.params = { blogId };
  //     req.body = { title: 'Updated Title', description: 'Updated Description', tags: ['updated'], body: 'Updated Body', state: 'published' || 'draft' };
  //     req.headers = { authorization: `Bearer ${token}` };
  //     jwt.verify.mockReturnValue({ userId });
  //     const blog = { _id: blogId, title: 'Test Blog', description: 'Test Description', tags: ['test'], body: 'Test Body', author: userId };
  //     Blog.findById.mockResolvedValue(blog);

  //     await updateBlog(req, res);

  //     expect(Blog.findById).toHaveBeenCalledWith(blogId);
  //     expect(blog.title).toBe('Updated Title');
  //     expect(blog.description).toBe('Updated Description');
  //     expect(blog.tags).toEqual(['updated']);
  //     expect(blog.body).toBe('Updated Body');
  //     expect(blog.author).toBe(userId);
  //     expect(logger.info).toHaveBeenCalledWith('Blog updated successfully');
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({ message: 'Blog updated successfully', blog });
  //   });
  // });

  // describe('deleteBlog', () => {
  //   it('should delete a blog', async () => {
  //     const blogId = 'blog123';
  //     const userId = 'user123';
  //     const token = 'token123';
  //     req.params = { blogId };
  //     req.headers = { authorization: `Bearer ${token}` };
  //     jwt.verify.mockReturnValue({ userId });
  //     const blog = { _id: blogId, title: 'Test Blog', description: 'Test Description', tags: ['test'], body: 'Test Body', author: userId };
  //     Blog.findById.mockResolvedValue(blog);

  //     await deleteBlog(req, res);

  //     expect(Blog.findById).toHaveBeenCalledWith(blogId);
  //     expect(blog.findByIdAndDelete).toHaveBeenCalledWith(blogId);
  //     expect(logger.info).toHaveBeenCalledWith('Blog deleted successfully');
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({ message: 'Blog deleted successfully' });
  //   });
  // });
});
