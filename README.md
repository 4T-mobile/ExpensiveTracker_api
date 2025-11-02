# ExpenseTracker API

A comprehensive REST API for tracking personal expenses, managing budgets, and generating financial insights. Built with NestJS, TypeScript, PostgreSQL, and Prisma.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing with bcrypt
  - Rate limiting to prevent abuse

- **Expense Management**
  - Full CRUD operations for expenses
  - Advanced filtering, sorting, and pagination
  - Category-based expense organization
  - Rich expense details with notes and timestamps

- **Budget Tracking**
  - Create and manage budgets (weekly/monthly)
  - Real-time budget vs. spending calculations
  - Budget utilization percentage tracking
  - Days remaining in budget period

- **Statistics & Analytics**
  - Comprehensive dashboard with key metrics
  - Daily, weekly, and monthly spending reports
  - Category-wise expense breakdown
  - Top spending categories analysis

- **User Management**
  - Profile management
  - Password change functionality
  - Account deletion

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5
- **Database:** PostgreSQL 14+ (via Docker)
- **ORM:** Prisma 6
- **Authentication:** JWT with Passport.js
- **Validation:** class-validator & class-transformer
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest & Supertest
- **Containerization:** Docker & Docker Compose

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ExpenseTracker_api
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables.

### 4. Start the database with Docker

```bash
docker-compose up -d postgres
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database with default categories

```bash
npm run prisma:seed
```

### 7. Start the development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PATCH /api/v1/users/password` - Change password
- `DELETE /api/v1/users/account` - Delete account

### Categories

- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories/:id` - Get category by ID
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Expenses

- `GET /api/v1/expenses` - Get all expenses (with filters)
- `POST /api/v1/expenses` - Create expense
- `GET /api/v1/expenses/recent` - Get recent expenses
- `GET /api/v1/expenses/:id` - Get expense by ID
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense

### Budgets

- `GET /api/v1/budgets` - Get all budgets
- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets/current` - Get current active budget
- `GET /api/v1/budgets/:id` - Get budget by ID
- `GET /api/v1/budgets/:id/status` - Get budget status
- `PUT /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget

### Statistics

- `GET /api/v1/statistics/dashboard` - Get dashboard statistics
- `GET /api/v1/statistics/daily` - Get daily statistics
- `GET /api/v1/statistics/monthly` - Get monthly statistics
- `GET /api/v1/statistics/by-category` - Get category statistics

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

## Docker Deployment

### Development

```bash
docker-compose up
```

### Production

```bash
docker-compose -f docker-compose.yml up --build
```

## Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# View database in Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Project Structure

```
ExpenseTracker_api/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management module
│   ├── categories/        # Categories module
│   ├── expenses/          # Expenses module
│   ├── budgets/           # Budgets module
│   ├── statistics/        # Statistics and analytics module
│   ├── common/            # Common utilities (filters, interceptors, pipes)
│   ├── config/            # Configuration module
│   ├── database/          # Database module with Prisma
│   ├── app.module.ts      # Root application module
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── docker/                # Docker configuration
├── .env                   # Environment variables
└── docker-compose.yml     # Docker Compose configuration
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Refresh token rotation
- Rate limiting (100 requests/minute)
- Input validation and sanitization
- SQL injection prevention (via Prisma)
- CORS configuration
- Error handling and user-friendly messages

## Environment Variables

See `.env.example` for all available environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - Access token expiration (default: 15m)
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiration (default: 7d)
- `BCRYPT_ROUNDS` - Bcrypt salt rounds (default: 10)
- `CORS_ORIGIN` - Allowed CORS origins

## License

This project is licensed under the MIT License.
