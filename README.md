# 🚀 Task Manager Backend API

A robust RESTful API for task management built with Node.js, Express, PostgreSQL, and Prisma ORM. This API provides complete task and category management with JWT authentication.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- 🔐 **JWT Authentication**: Secure user authentication with access and refresh tokens
- 👤 **User Management**: User registration, login, and profile management
- 📝 **Task Management**: Complete CRUD operations for tasks
- 📁 **Category System**: Organize tasks with customizable categories
- 🔍 **Advanced Filtering**: Search, filter, and sort tasks
- 📊 **Statistics**: Task completion and progress analytics
- 🛡️ **Security**: Helmet, CORS, input validation, and password hashing
- 📚 **API Documentation**: Comprehensive endpoint documentation

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- ngrok account (for public API access)

### 1. Database Setup

#### Create PostgreSQL Database and User

Connect as postgres superuser:
```bash
sudo -u postgres psql
```

Create database and user:
```sql
-- Create user
CREATE USER taskmanager_user WITH PASSWORD 'Powerwater123';

-- Create database
CREATE DATABASE taskmanager OWNER taskmanager_user;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskmanager_user;

-- Connect to the database
\c taskmanager

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskmanager_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskmanager_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO taskmanager_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO taskmanager_user;

-- Make the user owner of the database
ALTER DATABASE taskmanager OWNER TO taskmanager_user;

-- Exit
\q
```

### 2. Project Setup

#### Clone the Repository
```bash
git clone <repository-url>
cd task-manager-backend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration

Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://taskmanager_user:Powerwater123@localhost:5432/taskmanager"

# JWT Secrets (Generate your own!)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRE="1h"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:8081"
```

**Important**: Generate your own JWT secrets using:
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Database Migration and Seeding
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed
```

#### Start the Development Server
```bash
npm run dev
```

The API will be running at `http://localhost:3000`

### 3. Make API Publicly Available with ngrok

#### Install ngrok

Install ngrok via APT:
```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update \
  && sudo apt install ngrok
```

#### Configure ngrok

1. **Sign up** at [ngrok.com](https://ngrok.com)
2. **Get your authtoken** from the dashboard
3. **Add your authtoken**:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

#### Deploy with Static Domain (Recommended)

If you have a static domain:
```bash
ngrok http --url=your-static-domain.ngrok-free.app 3000
```

#### Deploy with Ephemeral Domain
```bash
ngrok http 3000
```

Your API will be available at the ngrok URL (e.g., `https://humane-properly-bug.ngrok-free.app`)

### 4. Update Mobile App Configuration

Update the API URL in your mobile app from the other repository:
```typescript
// In mobile app: src/context/AuthContext.tsx
const API_BASE_URL = "https://your-ngrok-url.ngrok-free.app/api";
```

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (with filters) | ✅ |
| GET | `/api/tasks/:id` | Get single task | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task | ✅ |
| GET | `/api/tasks/stats` | Get task statistics | ✅ |

### Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | ✅ |
| GET | `/api/categories/:id` | Get single category | ✅ |
| POST | `/api/categories` | Create new category | ✅ |
| PUT | `/api/categories/:id` | Update category | ✅ |
| DELETE | `/api/categories/:id` | Delete category | ✅ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health status | ❌ |

## 🔧 API Usage Examples

### Authentication

#### Register User
```bash
curl -X POST https://your-ngrok-url.ngrok-free.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST https://your-ngrok-url.ngrok-free.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "email": "kelvinchebon90@gmail.com",
    "password": "password123"
  }'
```

### Tasks

#### Create Task
```bash
curl -X POST https://your-ngrok-url.ngrok-free.app/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "dueDate": "2024-12-31T23:59:59Z",
    "status": "PENDING",
    "categoryId": "work-category"
  }'
```

#### Get All Tasks
```bash
curl -X GET "https://your-ngrok-url.ngrok-free.app/api/tasks?page=1&limit=10&status=PENDING" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

### Categories

#### Create Category
```bash
curl -X POST https://your-ngrok-url.ngrok-free.app/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "name": "Development",
    "color": "#3B82F6"
  }'
```

## 🗄️ Database Schema

### Users Table
- `id`: Unique identifier (cuid)
- `email`: User email (unique)
- `name`: User display name
- `password`: Hashed password
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Tasks Table
- `id`: Unique identifier (cuid)
- `title`: Task title
- `description`: Task description (optional)
- `dueDate`: Due date (optional)
- `status`: Task status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `userId`: Owner user ID (foreign key)
- `categoryId`: Category ID (foreign key, optional)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Categories Table
- `id`: Unique identifier (cuid)
- `name`: Category name
- `color`: Hex color code
- `userId`: Owner user ID (foreign key)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Access and refresh token system
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers
- **Rate Limiting**: (Can be added for production)

## 🧪 Demo Data

The seed script creates:

**Demo User:**
- Email: `kelvinchebon90@gmail.com`
- Password: `password123`

**Demo Categories:**
- Work (Blue - #3B82F6)
- Personal (Green - #10B981)
- Health (Amber - #F59E0B)

**Demo Tasks:**
- Various tasks across all categories
- Different statuses and due dates
- Sample descriptions and relationships

## 📊 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with demo data
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL if needed
sudo systemctl restart postgresql

# Verify user permissions
sudo -u postgres psql -c "\du"
```

#### Port Already in Use
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

#### ngrok Connection Issues
```bash
# Check ngrok status
ngrok status

# Restart ngrok
ngrok http 3000
```

#### Prisma Issues
```bash
# Reset database
npx prisma migrate reset

# Push schema changes
npx prisma db push

# Regenerate client
npx prisma generate
```

### Environment Variables Check

Ensure all required environment variables are set:
```bash
# Check if .env is loaded correctly
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

## 📝 Development Notes

### Adding New Endpoints

1. **Define route** in appropriate route file (`/src/routes/`)
2. **Add validation schema** in `/src/utils/validation.ts`
3. **Update database schema** in `/prisma/schema.prisma` if needed
4. **Run migration** with `npm run db:migrate`
5. **Test endpoint** with curl or Postman

### Database Changes

1. **Update schema** in `/prisma/schema.prisma`
2. **Create migration**: `npx prisma migrate dev --name description`
3. **Generate client**: `npm run db:generate`
4. **Update seed file** if needed

## 🚀 Production Deployment

For production deployment:

1. **Use environment-specific `.env`**
2. **Set `NODE_ENV=production`**
3. **Use managed PostgreSQL** (AWS RDS, DigitalOcean, etc.)
4. **Configure proper CORS origins**
5. **Add rate limiting and monitoring**
6. **Use PM2 or similar process manager**
7. **Set up SSL/TLS certificates**


**Happy Coding! 🎉**

*Task Manager Backend API - Powering your productivity.*