const Blog = require('../src/models/blog.js');
const jwt = require('jsonwebtoken');
const { getUserBlogs, updateBlogState } = require('../src/controllers/userController.js');
const logger = require('../src/services/logger.js');

// Mocking dependencies
jest.mock('jsonwebtoken');
jest.mock('../src/models/blog.js');
jest.mock('../src/services/logger.js');

// Example test data
const mockRequest = (headers = {}, params = {}, query = {}, body = {}) => ({
  headers,
  params,
  query,
  body,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Example decoded token
const decodedToken = {
  userId: 'mockUserId',
};

// Example blog data
const mockBlog = {
  _id: 'mockBlogId',
  authorId: 'mockUserId',
  state: 'draft',
};

// Mocking JWT verification
jwt.verify.mockReturnValue(decodedToken);

describe('getUserBlogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return user blogs', async () => {
    const req = mockRequest({ authorization: 'Bearer mockToken' });
    const res = mockResponse();

    Blog.find.mockResolvedValue([mockBlog]);

    await getUserBlogs(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('mockToken', process.env.JWT_SECRET);
    expect(Blog.find).toHaveBeenCalledWith({ authorId: decodedToken.userId });
    //expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'All authors blogs requested successfully', blogs: [mockBlog] });
    expect(logger.info).toHaveBeenCalledWith('All authors blogs requested successfully');
  });

});

describe('updateBlogState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update blog state', async () => {
    const req = mockRequest(
      { authorization: 'Bearer mockToken' },
      { blogId: 'mockBlogId' },
      {},
      { state: 'published' }
    );
    const res = mockResponse();

    Blog.findById.mockResolvedValue(mockBlog);

    await updateBlogState(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('mockToken', process.env.JWT_SECRET);
    expect(Blog.findById).toHaveBeenCalledWith('mockBlogId');
    //expect(mockBlog.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Blog published successfully', blog: mockBlog });
    expect(logger.info).toHaveBeenCalledWith('Blog published successfully');
  });

  test('should handle blog not found', async () => {
    const req = mockRequest({ authorization: 'Bearer mockToken' }, { blogId: 'nonExistingId' });
    const res = mockResponse();

    Blog.findById.mockResolvedValue(null);

    await updateBlogState(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Blog not found' });
  });

  test('should handle unauthorized update', async () => {
    const req = mockRequest({ authorization: 'Bearer mockToken' }, { blogId: 'mockBlogId' });
    const res = mockResponse();

    Blog.findById.mockResolvedValue({ ...mockBlog, authorId: 'otherUserId' });

    await updateBlogState(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'You are not authorized to update this blog' });
  });

  test('should handle errors', async () => {
    const req = mockRequest({ authorization: 'Bearer mockToken' }, { blogId: 'mockBlogId' });
    const res = mockResponse();
    const error = new Error('Mock error');

    Blog.findById.mockRejectedValue(error);

    await updateBlogState(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
    expect(logger.error).toHaveBeenCalledWith(`Error publishing blog: ${error.message}`);
  });
});


