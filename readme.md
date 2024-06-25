# Blog Application

AltSchool of Backend Engineering NodeJS Tinyuka 2nd Semester Examination Project. This is a simple blog application built with Node.js, Express, and MongoDB, with Redis caching integrated for improved performance. The general idea here is that the API has a general endpoint that shows a list of articles that have been created by different people, and anybody that calls this endpoint should be able to read a blog created by them or other users.

## Features

- Create, read, update, and delete (CRUD) blog posts.
- Filter and sort blog posts by various parameters.
- Authentication and authorization for secure access.
- Redis caching for frequently accessed data.

## Requirements

1. **User Model**:
    - Users should have a `firstName`, `lastName`, `email`, and `password`.
    - Additional attributes can be added as needed.
2. **Authentication**:
    - A user should be able to sign up and sign in to the blog app.
    - Use JWT as the authentication strategy and expire the token after 1 hour.
3. **Blog States**:
    - A blog can be in two states: `draft` and `published`.
4. **Accessing Blogs**:
    - Logged in and not logged in users should be able to get a list of published blogs.
    - Logged in and not logged in users should be able to get a single published blog.
5. **Creating Blogs**:
    - Logged in users should be able to create a blog.
    - When a blog is created, it is in the `draft` state.
6. **Managing Blogs**:
    - The owner of the blog should be able to update the state of the blog to `published`.
    - The owner of a blog should be able to edit the blog in `draft` or `published` state.
    - The owner of the blog should be able to delete the blog in `draft` or `published` state.
7. **User Blogs**:
    - The owner of the blog should be able to get a list of their blogs.
        - The endpoint should be paginated.
        - It should be filterable by state.
8. **Blog Model**:
    - Blogs should have `title`, `description`, `tags`, `author`, `timestamp`, `state`, `read_count`, `reading_time`, and `body`.
9. **Pagination & Search**:
    - The list of blogs endpoint accessible by both logged in and not logged in users should be paginated.
        - Default it to 20 blogs per page.
        - It should be searchable by `author`, `title`, and `tags`.
        - It should be orderable by `read_count`, `reading_time`, and `timestamp`.
10. **Read Count**:
    - When a single blog is requested, the API should return the user information (the author) with the blog.
    - The `read_count` of the blog should be updated by 1.
11. **Reading Time**:
    - Implement an algorithm to calculate the `reading_time` of the blog.
12. **Testing**:
    - Write tests for all endpoints.
13. **ERD**:
    - Create an ERD for entities and show relationships.
14. **Logging**:
    - Use Winston and ensure functions and processes are logged.

## Database

- Use MongoDB.

### Data Models

#### User

- `email`: required and should be unique
- `firstName`: required
- `lastName`: required
- `password`: required

#### Blog/Article

- `title`: required and unique
- `description`
- `author`
- `state`
- `read_count`
- `reading_time`
- `tags`
- `body`: required
- `timestamp`

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- MongoDB
- Redis
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/7maylord/blogApi.git
    cd blogApi
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=4000
    MONGODB_URI=mongodb://localhost:27017/blog
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=your_redis_password
    JWT_SECRET=your_jwt_secret
    ```

4. Start the application:
    ```sh
    npm start
    ```

## API Endpoints

### Authentication

#### Sign Up

- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user.
- **Request Body:**
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "password": "yourpassword"
    }
    ```
- **Response:**
    ```json
    {
      "message": "User registered successfully",
      "data": { ...userDetails }
    }
    ```

#### Sign In

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate a user.
- **Request Body:**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "yourpassword"
    }
    ```
- **Response:**
    ```json
    {
      "message": "User signed in successfully",
      "token": "JWT_TOKEN"
    }
    ```

### Blogs

#### Get Blogs

- **Endpoint:** `GET /api/blogs`
- **Description:** Retrieve all published blogs with optional filtering and sorting.
- **Query Parameters:**
  - `page`: Page number (default is 1)
  - `limit`: Number of blogs per page (default is 20)
  - `author`: Filter by author
  - `title`: Filter by title (supports partial matching)
  - `tags`: Filter by tags (comma-separated list)
  - `sortBy`: Sort by `readCount`, `readingTime`, or `timestamp`
- **Response:**
    ```json
    {
      "message": "All Published Blogs requested successfully",
      "data": [...]
    }
    ```

#### Get Single Blog

- **Endpoint:** `GET /api/blogs/:id`
- **Description:** Retrieve a single published blog and increment its read count.
- **Response:**
    ```json
    {
      "message": "Blog retrieved successfully",
      "data": { ...blogDetails }
    }
    ```

### Managing Blogs (Authenticated Users)

#### Create Blog

- **Endpoint:** `POST /api/blogs`
- **Description:** Create a new blog in draft state.
- **Request Body:**
    ```json
    {
      "title": "My New Blog",
      "description": "A short description",
      "tags": ["tag1", "tag2"],
      "body": "The content of the blog"
    }
    ```
- **Response:**
    ```json
    {
      "message": "Blog created successfully",
      "data": { ...blogDetails }
    }
    ```

#### Update Blog

- **Endpoint:** `PUT /api/blogs/:id`
- **Description:** Update an existing blog.
- **Request Body:**
    ```json
    {
      "title": "Updated Title",
      "description": "Updated description",
      "tags": ["tag1", "tag3"],
      "body": "Updated content",
      "state": "published"
    }
    ```
- **Response:**
    ```json
    {
      "message": "Blog updated successfully",
      "data": { ...blogDetails }
    }
    ```

#### Delete Blog

- **Endpoint:** `DELETE /api/blogs/:id`
- **Description:** Delete a blog.
- **Response:**
    ```json
    {
      "message": "Blog deleted successfully"
    }
    ```

### User Blogs

#### Get User Blogs

- **Endpoint:** `GET /api/user/blogs`
- **Description:** Retrieve blogs created by the authenticated user.
- **Query Parameters:**
  - `page`: Page number (default is 1)
  - `limit`: Number of blogs per page (default is 20)
  - `state`: Filter by state (`draft` or `published`)
- **Response:**
    ```json
    {
      "message": "User blogs retrieved successfully",
      "data": [...]
    }
    ```

## Caching with Redis

This application uses Redis to cache blog data for 10 minutes to improve performance. After implementing caching on the get blogs endpoint, the response time decreased significantly. Previously, the endpoint took approximately 1738 milliseconds to respond, With caching in place, the response time has improved to about 380 milliseconds.Redis is set up in the `redis.js` file and used in the `getBlogs` controller.



