# TODO List API Backend

A comprehensive FastAPI backend implementation for the TODO List API specification.

## 🚀 Features

- **FastAPI Framework** - Modern, fast web framework for building APIs
- **SQLAlchemy ORM** - Database abstraction and object-relational mapping
- **JWT Authentication** - Secure token-based authentication
- **PostgreSQL Database** - Robust relational database
- **Alembic Migrations** - Database schema versioning
- **Pydantic Validation** - Request/response data validation
- **CORS Support** - Cross-origin resource sharing
- **Comprehensive Error Handling** - Detailed error responses
- **Pagination** - Efficient data pagination
- **Search & Filtering** - Advanced search capabilities
- **Analytics** - User productivity insights
- **Bulk Operations** - Batch processing for efficiency

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection and session
│   ├── auth.py              # Authentication utilities
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── todo_list.py
│   │   ├── task.py
│   │   └── category.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── user.py
│   │   ├── todo_list.py
│   │   ├── task.py
│   │   └── category.py
│   └── routers/             # API route handlers
│       ├── __init__.py
│       ├── auth.py
│       ├── users.py
│       ├── lists.py
│       ├── tasks.py
│       ├── categories.py
│       └── search.py
├── alembic/                 # Database migrations
│   ├── env.py
│   └── versions/
├── requirements.txt         # Python dependencies
├── env.example             # Environment variables template
├── alembic.ini            # Alembic configuration
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8+
- PostgreSQL
- Redis (optional, for caching)

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb todolist_db

# Run database migrations
alembic upgrade head
```

### 4. Run the Application

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use the built-in runner
python -m app.main
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost/todolist_db` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-here` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `["http://localhost:3000"]` |

## 📚 API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)
- **Health Check**: http://localhost:8000/health

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register**: `POST /v1/auth/register`
2. **Login**: `POST /v1/auth/login`
3. **Include token**: Add `Authorization: Bearer <token>` header to requests

### Example Authentication Flow

```bash
# Register a new user
curl -X POST "http://localhost:8000/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST "http://localhost:8000/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Use the returned token in subsequent requests
curl -X GET "http://localhost:8000/v1/lists" \
  -H "Authorization: Bearer <your-token>"
```

## 🗄️ Database Models

### User
- `id`: UUID primary key
- `email`: Unique email address
- `username`: Unique username
- `password_hash`: Hashed password
- `first_name`, `last_name`: User details
- `created_at`, `updated_at`: Timestamps

### TodoList
- `id`: UUID primary key
- `name`: List name
- `description`: Optional description
- `color`: Hex color code
- `is_shared`: Sharing flag
- `owner_id`: Foreign key to User
- `created_at`, `updated_at`: Timestamps

### Task
- `id`: UUID primary key
- `title`: Task title
- `description`: Optional description
- `is_completed`: Completion status
- `priority`: Priority level (low/medium/high/urgent)
- `due_date`: Optional due date
- `list_id`: Foreign key to TodoList
- `category_id`: Foreign key to Category
- `tags`: Array of tags
- `created_at`, `updated_at`, `completed_at`: Timestamps

### Category
- `id`: UUID primary key
- `name`: Category name
- `color`: Hex color code
- `user_id`: Foreign key to User
- `created_at`, `updated_at`: Timestamps

## 🔄 Database Migrations

### Create a new migration

```bash
# Generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Migration Commands

```bash
# Check current migration status
alembic current

# View migration history
alembic history

# Generate empty migration
alembic revision -m "Manual migration"
```

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

### Test Structure

```
tests/
├── __init__.py
├── conftest.py          # Test configuration and fixtures
├── test_auth.py         # Authentication tests
├── test_users.py        # User management tests
├── test_lists.py        # List management tests
├── test_tasks.py        # Task management tests
├── test_categories.py   # Category management tests
└── test_search.py       # Search and analytics tests
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   DEBUG=False
   ENVIRONMENT=production
   SECRET_KEY=<strong-secret-key>
   DATABASE_URL=<production-db-url>
   ```

2. **Database**
   ```bash
   # Run migrations
   alembic upgrade head
   ```

3. **Server**
   ```bash
   # Using Gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

   # Using Docker
   docker build -t todolist-api .
   docker run -p 8000:8000 todolist-api
   ```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔍 API Endpoints

### Authentication
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh` - Refresh token
- `POST /v1/auth/logout` - User logout

### Users
- `GET /v1/users/me` - Get current user profile
- `PUT /v1/users/me` - Update user profile

### Lists
- `GET /v1/lists` - Get user's lists (paginated)
- `POST /v1/lists` - Create new list
- `GET /v1/lists/{list_id}` - Get specific list
- `PUT /v1/lists/{list_id}` - Update list
- `DELETE /v1/lists/{list_id}` - Delete list

### Tasks
- `GET /v1/lists/{list_id}/tasks` - Get tasks in list (filtered)
- `POST /v1/lists/{list_id}/tasks` - Create new task
- `GET /v1/tasks/{task_id}` - Get specific task
- `PUT /v1/tasks/{task_id}` - Update task
- `DELETE /v1/tasks/{task_id}` - Delete task
- `PATCH /v1/tasks/{task_id}/toggle` - Toggle completion

### Categories
- `GET /v1/categories` - Get user's categories
- `POST /v1/categories` - Create new category
- `GET /v1/categories/{category_id}` - Get specific category
- `PUT /v1/categories/{category_id}` - Update category
- `DELETE /v1/categories/{category_id}` - Delete category

### Search & Analytics
- `GET /v1/search` - Search tasks and lists
- `GET /v1/analytics` - Get user analytics

### Bulk Operations
- `POST /v1/tasks/bulk` - Bulk create tasks
- `PATCH /v1/tasks/bulk/update` - Bulk update tasks
- `DELETE /v1/tasks/bulk/delete` - Bulk delete tasks

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt password hashing
- **Input Validation** - Pydantic request validation
- **CORS Protection** - Cross-origin request handling
- **SQL Injection Protection** - SQLAlchemy ORM
- **Rate Limiting** - Configurable rate limiting
- **Error Handling** - Secure error responses

## 📊 Performance Features

- **Database Connection Pooling** - Efficient DB connections
- **Pagination** - Large dataset handling
- **Indexing** - Database query optimization
- **Lazy Loading** - Efficient relationship loading
- **Bulk Operations** - Batch processing
- **Caching Support** - Redis integration ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
