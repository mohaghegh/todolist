# TODO List API Specification

A comprehensive REST API specification for managing TODO lists and tasks, built with OpenAPI 3.0.

## 📋 Overview

This API provides a complete solution for building TODO list applications with features including:

- **User Authentication & Authorization** - JWT-based authentication
- **List Management** - Create, read, update, and delete TODO lists
- **Task Management** - Full CRUD operations for tasks within lists
- **Category System** - Organize tasks with custom categories
- **Advanced Filtering & Search** - Find tasks and lists efficiently
- **Bulk Operations** - Perform operations on multiple tasks at once
- **Analytics** - Get insights into user productivity
- **Pagination** - Handle large datasets efficiently

## 🚀 Features

### Core Functionality
- ✅ User registration and authentication
- ✅ TODO list creation and management
- ✅ Task creation, editing, and completion
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Due dates and reminders
- ✅ Task categorization
- ✅ Tags for additional organization

### Advanced Features
- 🔍 Full-text search across tasks and lists
- 📊 Analytics and productivity insights
- 🔄 Bulk operations for efficiency
- 📱 Pagination for large datasets
- 🎨 Custom colors for lists and categories
- 🔐 JWT-based security
- 📈 Activity tracking

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### User Management
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

### List Management
- `GET /lists` - Get user's lists (with pagination and search)
- `POST /lists` - Create a new list
- `GET /lists/{listId}` - Get specific list
- `PUT /lists/{listId}` - Update list
- `DELETE /lists/{listId}` - Delete list

### Task Management
- `GET /lists/{listId}/tasks` - Get tasks in a list (with filtering)
- `POST /lists/{listId}/tasks` - Create a new task
- `GET /tasks/{taskId}` - Get specific task
- `PUT /tasks/{taskId}` - Update task
- `DELETE /tasks/{taskId}` - Delete task
- `PATCH /tasks/{taskId}/toggle` - Toggle task completion

### Category Management
- `GET /categories` - Get user's categories
- `POST /categories` - Create a new category
- `GET /categories/{categoryId}` - Get specific category
- `PUT /categories/{categoryId}` - Update category
- `DELETE /categories/{categoryId}` - Delete category

### Search & Analytics
- `GET /search` - Search tasks and lists
- `GET /analytics` - Get user analytics

### Bulk Operations
- `POST /tasks/bulk` - Bulk create tasks
- `PATCH /tasks/bulk/update` - Bulk update tasks
- `DELETE /tasks/bulk/delete` - Bulk delete tasks

## 🔧 Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### TodoList
```json
{
  "id": "uuid",
  "name": "Work Tasks",
  "description": "Tasks for work projects",
  "color": "#FF5733",
  "isShared": false,
  "ownerId": "uuid",
  "taskCount": 5,
  "completedTaskCount": 2,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Task
```json
{
  "id": "uuid",
  "title": "Complete API documentation",
  "description": "Write comprehensive API docs",
  "isCompleted": false,
  "priority": "high",
  "dueDate": "2024-01-15T23:59:59Z",
  "listId": "uuid",
  "categoryId": "uuid",
  "tags": ["documentation", "api"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "completedAt": null
}
```

### Category
```json
{
  "id": "uuid",
  "name": "Work",
  "color": "#4CAF50",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📖 Usage Examples

### 1. User Registration
```bash
curl -X POST https://api.todolist.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. User Login
```bash
curl -X POST https://api.todolist.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### 3. Create a List
```bash
curl -X POST https://api.todolist.com/v1/lists \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Tasks",
    "description": "Tasks for work projects",
    "color": "#FF5733",
    "isShared": false
  }'
```

### 4. Create a Task
```bash
curl -X POST https://api.todolist.com/v1/lists/<list-id>/tasks \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "priority": "high",
    "dueDate": "2024-01-15T23:59:59Z",
    "categoryId": "<category-id>",
    "tags": ["documentation", "api"]
  }'
```

### 5. Get Tasks with Filtering
```bash
curl -X GET "https://api.todolist.com/v1/lists/<list-id>/tasks?completed=false&priority=high&sortBy=dueDate&sortOrder=asc" \
  -H "Authorization: Bearer <your-token>"
```

### 6. Search Tasks and Lists
```bash
curl -X GET "https://api.todolist.com/v1/search?q=documentation&type=tasks&page=1&limit=10" \
  -H "Authorization: Bearer <your-token>"
```

### 7. Get Analytics
```bash
curl -X GET "https://api.todolist.com/v1/analytics?period=month" \
  -H "Authorization: Bearer <your-token>"
```

### 8. Bulk Create Tasks
```bash
curl -X POST https://api.todolist.com/v1/tasks/bulk \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "listId": "<list-id>",
    "tasks": [
      {
        "title": "Task 1",
        "priority": "medium"
      },
      {
        "title": "Task 2",
        "priority": "high"
      }
    ]
  }'
```

## 🔍 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Task Filtering
- `completed` - Filter by completion status (true/false)
- `priority` - Filter by priority (low/medium/high/urgent)
- `categoryId` - Filter by category
- `search` - Search in task titles
- `sortBy` - Sort field (createdAt/updatedAt/dueDate/priority/title)
- `sortOrder` - Sort order (asc/desc)

### Search
- `q` - Search query (required)
- `type` - Search type (tasks/lists/all)

### Analytics
- `period` - Time period (week/month/year/all)

## 📊 Response Format

### Success Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "error": "Task not found",
  "code": "TASK_NOT_FOUND",
  "details": {
    "taskId": "invalid-uuid"
  }
}
```

## 🛡️ Security

- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Protection against abuse
- **CORS** - Cross-origin resource sharing support
- **HTTPS** - Secure communication (production)

## 🚀 Getting Started

1. **View the API Documentation**
   - Open `todo-api-specification.yaml` in any OpenAPI viewer
   - Use tools like Swagger UI or Redoc for interactive documentation

2. **Test the API**
   - Use the provided examples with tools like curl, Postman, or Insomnia
   - Start with authentication endpoints to get a JWT token

3. **Integration**
   - The API follows RESTful principles
   - All responses are in JSON format
   - Comprehensive error handling with meaningful messages

## 📝 Development Notes

- **API Versioning** - Current version: v1
- **Base URL** - `https://api.todolist.com/v1`
- **Content Type** - `application/json`
- **Date Format** - ISO 8601 (RFC 3339)
- **UUID Format** - Standard UUID v4

## 🤝 Contributing

This API specification is designed to be:
- **Comprehensive** - Covers all essential TODO list features
- **Scalable** - Supports large datasets with pagination
- **Flexible** - Multiple filtering and sorting options
- **Secure** - JWT authentication and input validation
- **Well-documented** - Clear examples and comprehensive documentation

## 📄 License

This API specification is licensed under the MIT License.
