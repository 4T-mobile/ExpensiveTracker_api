# ExpenseTracker API Backend - Comprehensive Requirements Plan

## Executive Summary

**Project Name:** Student Expense Tracker
**Tagline:** "Track Smart, Spend Wise"
**Target Audience:** Vietnamese university students aged 18-25
**Market Size:** ~1.7 million university students in Vietnam
**Current Status:** Basic NestJS setup completed; requires full API implementation with database schema, authentication, and feature modules

---

## 1. Functional Requirements

### 1.1 User Management and Authentication

#### Priority: HIGH - Core MVP Feature

**User Registration**
- Create new user accounts with username, email, and password
- Validate email uniqueness and format
- Enforce password strength requirements
- Store user profile data securely
- Return JWT tokens upon successful registration

**User Login/Authentication**
- Secure login with email/username and password
- JWT token-based authentication mechanism
- Access token (15 minutes) and refresh token (7 days) system
- Password hashing using bcrypt (minimum 10 salt rounds)
- Session management and token refresh capability

**User Profile Management**
- Retrieve user profile information
- Update profile details (username, email)
- Change password functionality
- Display username in profile screen
- Account deletion capability
- Logout functionality with token invalidation

### 1.2 Expense Tracking Features

#### Priority: HIGH - Core MVP Feature

**Expense CRUD Operations**
- **Create Expense:**
  - Expense name/description (required)
  - Amount in VND (required, decimal precision)
  - Category selection (required)
  - Date/timestamp (default: current time)
  - Optional notes field
  - User association via JWT token

- **Read Expenses:**
  - Retrieve all expenses for authenticated user
  - Get single expense by ID
  - Support pagination (limit/offset)
  - Sort by date, amount, or category
  - Filter by date range, category, amount range

- **Update Expense:**
  - Modify any expense field
  - Maintain audit trail (updatedAt timestamp)
  - Validate ownership before update

- **Delete Expense:**
  - Soft delete or hard delete option
  - Cascade budget calculations
  - Validate ownership before deletion

**Expense Categories Management**
- Predefined default categories:
  - Food & Dining
  - Transportation
  - Study & Education
  - Entertainment
  - Shopping
  - Utilities & Bills
  - Healthcare
  - Others
- Custom category creation (future enhancement)
- Category icons and colors for UI support
- Category-based expense grouping and filtering

### 1.3 Budget Management

#### Priority: MEDIUM - MVP Feature

**Budget Setting**
- Create budget limits with:
  - Amount in VND
  - Period type (weekly or monthly)
  - Start and end dates
  - Auto-renewal option (future)
- Update existing budget configurations
- Support multiple active budgets
- Budget templates for quick setup

**Budget Tracking**
- Real-time spending calculation against budget
- Percentage utilization tracking
- Remaining budget calculation
- Days remaining in budget period
- Historical budget performance

**Budget Alert System**
- Configurable alert thresholds (50%, 75%, 90%, 100%)
- Alert types:
  - In-app notifications
  - Push notifications (future)
  - Email notifications (future)
- Alert history and acknowledgment tracking
- Customizable alert preferences per user

### 1.4 Reporting and Analytics

#### Priority: MEDIUM - MVP Feature

**Statistics Generation**
- **Time-based Analytics:**
  - Daily spending totals
  - Weekly spending patterns
  - Monthly expense summaries
  - Custom date range analysis
  - Year-over-year comparisons (future)

- **Category Analytics:**
  - Expense breakdown by category
  - Top spending categories
  - Category trends over time
  - Average spending per category

- **Comparative Analytics:**
  - Current vs previous period comparison
  - Budget vs actual spending
  - Spending velocity metrics

**Data Visualization Support**
- Provide pre-aggregated data for:
  - Pie charts (category distribution)
  - Bar charts (daily/weekly/monthly spending)
  - Line graphs (spending trends)
  - Progress bars (budget utilization)
- Efficient data formatting for frontend consumption
- Support for multiple chart types per endpoint

**Dashboard Data**
- Summary statistics:
  - Total expenses (today, this week, this month)
  - Current budget status and remaining amount
  - Top 3 spending categories
  - Recent 5 expenses
  - Average daily spending
- Quick insights and alerts
- Personalized recommendations (future)

### 1.5 Data Management

#### Priority: HIGH - Core MVP Feature

**Data Persistence**
- Primary storage in relational database
- ACID compliance for financial data
- Regular automated backups
- Data retention policies
- Export capabilities (CSV, Excel - future)

**Synchronization Support**
- Offline-first architecture support
- Bulk sync endpoints for mobile app
- Conflict resolution for concurrent updates
- Incremental sync with timestamps
- Data compression for bandwidth optimization

### 1.6 Notification System

#### Priority: LOW - Post-MVP

**Notification Types**
- Budget threshold alerts
- Daily expense reminders
- Weekly/monthly summaries
- Unusual spending patterns (future)
- Achievement badges (future)

**Notification Management**
- User preference settings
- Notification history
- Mark as read/unread
- Batch notification updates
- Notification scheduling

---

## 2. Non-Functional Requirements

### 2.1 Performance Requirements

**Response Time Targets**
- Authentication endpoints: < 300ms
- Read operations (GET): < 200ms
- Write operations (POST/PUT/DELETE): < 500ms
- Statistics aggregation: < 1000ms
- Dashboard data: < 800ms

**Scalability Requirements**
- Support 10,000+ concurrent users
- Horizontal scaling capability
- Database connection pooling
- Caching strategy (Redis - future)
- CDN for static assets (future)

**Database Performance**
- Indexed columns: user_id, date, category, amount
- Optimized queries with query builder
- Efficient aggregation pipelines
- Database query monitoring
- Query result caching for statistics

### 2.2 Security Requirements

**Authentication Security**
- Bcrypt password hashing (min 10 rounds)
- JWT RS256 algorithm
- Token rotation on refresh
- Secure cookie options for web
- Rate limiting on auth endpoints
- Account lockout after failed attempts

**Data Privacy**
- User data isolation (row-level security)
- PII encryption at rest
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- XSS protection through output encoding
- CSRF protection for web endpoints

**API Security**
- CORS configuration with whitelist
- Rate limiting (100 requests/minute per user)
- API versioning strategy
- Request size limits
- HTTPS enforcement
- API key for third-party integrations (future)

### 2.3 Reliability and Availability

**Uptime Requirements**
- 99.5% uptime SLA
- Graceful degradation
- Circuit breaker pattern
- Retry logic with exponential backoff
- Health check endpoints

**Data Integrity**
- Database transactions for critical operations
- Referential integrity constraints
- Data validation at multiple layers
- Audit logging for all modifications
- Backup and recovery procedures

### 2.4 Maintainability

**Code Quality Standards**
- TypeScript strict mode
- ESLint and Prettier configuration
- Minimum 80% test coverage
- Unit tests for services
- Integration tests for controllers
- E2E tests for critical flows

**Documentation Requirements**
- OpenAPI/Swagger documentation
- README with setup instructions
- Code comments for complex logic
- API versioning documentation
- Database schema documentation
- Deployment guide

**Monitoring and Logging**
- Structured logging (Winston/Pino)
- Correlation IDs for request tracking
- Error tracking (Sentry - future)
- Performance monitoring (APM - future)
- Custom metrics and dashboards

### 2.5 Technology Stack

**Core Technologies**
- **Runtime:** Node.js 18+ LTS
- **Framework:** NestJS 10+
- **Language:** TypeScript 5+
- **Package Manager:** npm/yarn

**Database Layer**
- **Primary Database:** PostgreSQL 14+ or MySQL 8+
- **ORM:** Prisma (recommended) or TypeORM
- **Migration Tool:** Prisma Migrate or TypeORM Migrations
- **Cache:** Redis (future enhancement)

**Authentication & Security**
- **Authentication:** Passport.js
- **JWT Library:** @nestjs/jwt
- **Validation:** class-validator, class-transformer
- **Hashing:** bcrypt
- **Rate Limiting:** @nestjs/throttler

**Development Tools**
- **Container:** Docker & Docker Compose
- **Testing:** Jest, Supertest
- **Documentation:** @nestjs/swagger
- **Environment:** dotenv
- **Linting:** ESLint, Prettier

### 2.6 Database Schema Design

**Users Table**
```sql
- id: UUID (Primary Key)
- username: VARCHAR(50) UNIQUE NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Expenses Table**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> Users)
- name: VARCHAR(255) NOT NULL
- amount: DECIMAL(12,2) NOT NULL
- category_id: UUID (Foreign Key -> Categories)
- date: DATE NOT NULL
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- INDEX: (user_id, date)
- INDEX: (user_id, category_id)
```

**Budgets Table**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> Users)
- amount: DECIMAL(12,2) NOT NULL
- period_type: ENUM('WEEKLY', 'MONTHLY')
- start_date: DATE NOT NULL
- end_date: DATE NOT NULL
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- INDEX: (user_id, is_active)
- INDEX: (start_date, end_date)
```

**Categories Table**
```sql
- id: UUID (Primary Key)
- name: VARCHAR(50) NOT NULL
- icon: VARCHAR(50)
- color: VARCHAR(7)
- is_default: BOOLEAN DEFAULT false
- user_id: UUID (Foreign Key -> Users, NULL for defaults)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE: (name, user_id)
```

**Notifications Table** (Future)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> Users)
- type: VARCHAR(50) NOT NULL
- title: VARCHAR(255) NOT NULL
- message: TEXT
- is_read: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- INDEX: (user_id, is_read)
```

### 2.7 Localization Requirements

**Vietnamese Market Focus**
- Currency: Vietnamese Dong (VND) - no decimal places
- Language: Error messages in Vietnamese and English
- Date Format: DD/MM/YYYY
- Time Zone: Asia/Ho_Chi_Minh (UTC+7)
- Number Format: 1.000.000 VND
- First day of week: Monday

---

## 3. API Endpoint Specifications

### 3.1 Authentication Endpoints

```
POST   /api/v1/auth/register
       Body: { username, email, password }
       Response: { user, accessToken, refreshToken }

POST   /api/v1/auth/login
       Body: { email/username, password }
       Response: { user, accessToken, refreshToken }

POST   /api/v1/auth/refresh
       Body: { refreshToken }
       Response: { accessToken, refreshToken }

POST   /api/v1/auth/logout
       Headers: Authorization: Bearer {token}
       Response: { message }

GET    /api/v1/auth/me
       Headers: Authorization: Bearer {token}
       Response: { user }
```

### 3.2 User Management Endpoints

```
GET    /api/v1/users/profile
       Headers: Authorization: Bearer {token}
       Response: { profile }

PUT    /api/v1/users/profile
       Headers: Authorization: Bearer {token}
       Body: { username?, email? }
       Response: { profile }

PATCH  /api/v1/users/password
       Headers: Authorization: Bearer {token}
       Body: { currentPassword, newPassword }
       Response: { message }

DELETE /api/v1/users/account
       Headers: Authorization: Bearer {token}
       Body: { password }
       Response: { message }
```

### 3.3 Expense Endpoints

```
POST   /api/v1/expenses
       Headers: Authorization: Bearer {token}
       Body: { name, amount, categoryId, date?, notes? }
       Response: { expense }

GET    /api/v1/expenses
       Headers: Authorization: Bearer {token}
       Query: { page?, limit?, sortBy?, order?, categoryId?,
                startDate?, endDate?, minAmount?, maxAmount? }
       Response: { expenses, total, page, totalPages }

GET    /api/v1/expenses/:id
       Headers: Authorization: Bearer {token}
       Response: { expense }

PUT    /api/v1/expenses/:id
       Headers: Authorization: Bearer {token}
       Body: { name?, amount?, categoryId?, date?, notes? }
       Response: { expense }

DELETE /api/v1/expenses/:id
       Headers: Authorization: Bearer {token}
       Response: { message }

GET    /api/v1/expenses/recent
       Headers: Authorization: Bearer {token}
       Query: { limit? }
       Response: { expenses }

POST   /api/v1/expenses/bulk
       Headers: Authorization: Bearer {token}
       Body: { expenses: [...] }
       Response: { created, updated, failed }
```

### 3.4 Budget Endpoints

```
POST   /api/v1/budgets
       Headers: Authorization: Bearer {token}
       Body: { amount, periodType, startDate, endDate }
       Response: { budget }

GET    /api/v1/budgets
       Headers: Authorization: Bearer {token}
       Query: { isActive?, page?, limit? }
       Response: { budgets, total }

GET    /api/v1/budgets/current
       Headers: Authorization: Bearer {token}
       Response: { budget, spent, remaining, percentage }

GET    /api/v1/budgets/:id
       Headers: Authorization: Bearer {token}
       Response: { budget }

PUT    /api/v1/budgets/:id
       Headers: Authorization: Bearer {token}
       Body: { amount?, periodType?, startDate?, endDate? }
       Response: { budget }

DELETE /api/v1/budgets/:id
       Headers: Authorization: Bearer {token}
       Response: { message }

GET    /api/v1/budgets/:id/status
       Headers: Authorization: Bearer {token}
       Response: { budget, spent, remaining, percentage, daysRemaining }
```

### 3.5 Statistics Endpoints

```
GET    /api/v1/statistics/dashboard
       Headers: Authorization: Bearer {token}
       Response: {
         todayTotal, weekTotal, monthTotal,
         topCategories, recentExpenses,
         budgetStatus, averageDailySpending
       }

GET    /api/v1/statistics/daily
       Headers: Authorization: Bearer {token}
       Query: { startDate, endDate }
       Response: { data: [{ date, total, count }] }

GET    /api/v1/statistics/weekly
       Headers: Authorization: Bearer {token}
       Query: { weeks? }
       Response: { data: [{ week, startDate, endDate, total, count }] }

GET    /api/v1/statistics/monthly
       Headers: Authorization: Bearer {token}
       Query: { months? }
       Response: { data: [{ month, year, total, count }] }

GET    /api/v1/statistics/by-category
       Headers: Authorization: Bearer {token}
       Query: { startDate?, endDate? }
       Response: { data: [{ category, total, count, percentage }] }

GET    /api/v1/statistics/trends
       Headers: Authorization: Bearer {token}
       Query: { period, intervals }
       Response: { data: [{ date, total, change }] }

GET    /api/v1/statistics/custom
       Headers: Authorization: Bearer {token}
       Query: { startDate, endDate, groupBy }
       Response: { data, summary }
```

### 3.6 Category Endpoints

```
GET    /api/v1/categories
       Headers: Authorization: Bearer {token}
       Response: { categories }

POST   /api/v1/categories
       Headers: Authorization: Bearer {token}
       Body: { name, icon?, color? }
       Response: { category }

PUT    /api/v1/categories/:id
       Headers: Authorization: Bearer {token}
       Body: { name?, icon?, color? }
       Response: { category }

DELETE /api/v1/categories/:id
       Headers: Authorization: Bearer {token}
       Response: { message }
```

### 3.7 Notification Endpoints (Future)

```
GET    /api/v1/notifications
       Headers: Authorization: Bearer {token}
       Query: { page?, limit?, isRead? }
       Response: { notifications, total }

GET    /api/v1/notifications/unread/count
       Headers: Authorization: Bearer {token}
       Response: { count }

PATCH  /api/v1/notifications/:id/read
       Headers: Authorization: Bearer {token}
       Response: { notification }

PUT    /api/v1/notifications/settings
       Headers: Authorization: Bearer {token}
       Body: { budgetAlerts?, dailyReminders?, weeklySummary? }
       Response: { settings }
```

---

## 4. Project Architecture

### 4.1 Directory Structure

```
ExpenseTracker_api/
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── refresh.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── jwt-refresh.guard.ts
│   │   └── interfaces/
│   │       └── jwt-payload.interface.ts
│   │
│   ├── users/                     # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   │   ├── update-profile.dto.ts
│   │   │   └── change-password.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── expenses/                  # Expense tracking module
│   │   ├── expenses.controller.ts
│   │   ├── expenses.service.ts
│   │   ├── expenses.module.ts
│   │   ├── dto/
│   │   │   ├── create-expense.dto.ts
│   │   │   ├── update-expense.dto.ts
│   │   │   └── query-expense.dto.ts
│   │   └── entities/
│   │       └── expense.entity.ts
│   │
│   ├── budgets/                   # Budget management module
│   │   ├── budgets.controller.ts
│   │   ├── budgets.service.ts
│   │   ├── budgets.module.ts
│   │   ├── dto/
│   │   │   ├── create-budget.dto.ts
│   │   │   └── update-budget.dto.ts
│   │   └── entities/
│   │       └── budget.entity.ts
│   │
│   ├── statistics/                # Analytics module
│   │   ├── statistics.controller.ts
│   │   ├── statistics.service.ts
│   │   ├── statistics.module.ts
│   │   └── interfaces/
│   │       └── statistics.interface.ts
│   │
│   ├── categories/                # Category management module
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── categories.module.ts
│   │   ├── dto/
│   │   │   └── create-category.dto.ts
│   │   └── entities/
│   │       └── category.entity.ts
│   │
│   ├── notifications/             # Notification module (future)
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.module.ts
│   │
│   ├── database/                  # Database configuration
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── common/                    # Shared utilities
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation.filter.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── constants/
│   │       └── app.constants.ts
│   │
│   ├── config/                    # Configuration module
│   │   ├── config.module.ts
│   │   ├── configuration.ts
│   │   └── validation.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── prisma/                        # Prisma ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docker/                        # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
│
├── test/                          # Testing
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                          # Documentation
│   ├── api/
│   └── deployment/
│
├── scripts/                       # Utility scripts
│   ├── seed-db.ts
│   └── generate-types.ts
│
├── .github/                       # GitHub configuration
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── tsconfig.build.json
├── package.json
├── package-lock.json
└── README.md
```

### 4.2 Module Dependencies

```
AppModule
├── ConfigModule (global)
├── DatabaseModule (global)
├── AuthModule
│   └── UsersModule
├── UsersModule
├── ExpensesModule
│   ├── CategoriesModule
│   └── UsersModule
├── BudgetsModule
│   ├── ExpensesModule
│   └── UsersModule
├── StatisticsModule
│   ├── ExpensesModule
│   ├── BudgetsModule
│   └── CategoriesModule
├── CategoriesModule
│   └── UsersModule
└── NotificationsModule (future)
    └── UsersModule
```

---

## 5. Development Roadmap

### Phase 1: Foundation (Week 1 - High Priority)

**Day 1-2: Project Setup**
- [ ] Initialize database with Prisma
- [ ] Create database schema and migrations
- [ ] Configure environment variables
- [ ] Set up Docker environment
- [ ] Configure ESLint and Prettier
- [ ] Create basic project structure

**Day 3-4: Authentication Module**
- [ ] Implement user registration
- [ ] Implement user login
- [ ] Set up JWT authentication
- [ ] Create auth guards and strategies
- [ ] Implement refresh token mechanism
- [ ] Add password hashing

**Day 5-7: Core Expense Module**
- [ ] Create expense CRUD endpoints
- [ ] Implement expense filtering and sorting
- [ ] Add pagination support
- [ ] Create expense validation
- [ ] Set up basic categories
- [ ] Write unit tests

### Phase 2: Core Features (Week 2 - High Priority)

**Day 8-9: Budget Management**
- [ ] Create budget CRUD endpoints
- [ ] Implement budget calculation logic
- [ ] Add budget status tracking
- [ ] Create budget validation
- [ ] Write unit tests

**Day 10-11: User Management**
- [ ] Implement profile management
- [ ] Add password change functionality
- [ ] Create account deletion
- [ ] Add user settings
- [ ] Write unit tests

**Day 12-14: Basic Statistics**
- [ ] Create dashboard endpoint
- [ ] Implement daily/weekly/monthly statistics
- [ ] Add category-based analytics
- [ ] Optimize queries for performance
- [ ] Write integration tests

### Phase 3: Analytics & Enhancement (Week 3 - Medium Priority)

**Day 15-16: Advanced Statistics**
- [ ] Implement trend analysis
- [ ] Add custom date range queries
- [ ] Create comparative analytics
- [ ] Optimize aggregation queries
- [ ] Add caching for statistics

**Day 17-18: Category Management**
- [ ] Implement custom categories
- [ ] Add category icons and colors
- [ ] Create category management endpoints
- [ ] Add category validation

**Day 19-21: Integration & Testing**
- [ ] Frontend integration testing
- [ ] API documentation with Swagger
- [ ] Performance testing
- [ ] Security testing
- [ ] Bug fixes and refinements

### Phase 4: Polish & Deployment (Week 4 - Medium Priority)

**Day 22-23: Notification System**
- [ ] Create notification module
- [ ] Implement budget alerts
- [ ] Add notification preferences
- [ ] Create notification history

**Day 24-25: Documentation**
- [ ] Complete API documentation
- [ ] Write deployment guide
- [ ] Create user manual
- [ ] Document database schema
- [ ] Add code comments

**Day 26-28: Production Readiness**
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Implement monitoring and logging
- [ ] Performance optimization
- [ ] Final testing and deployment

---

## 6. Docker Configuration

### 6.1 Development Environment

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: expense_tracker_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - expense_tracker_network

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
      target: development
    container_name: expense_tracker_api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
    ports:
      - "3000:3000"
      - "9229:9229"
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - postgres
    networks:
      - expense_tracker_network
    command: npm run start:dev

  redis:
    image: redis:7-alpine
    container_name: expense_tracker_cache
    ports:
      - "6379:6379"
    networks:
      - expense_tracker_network

volumes:
  postgres_data:

networks:
  expense_tracker_network:
    driver: bridge
```

### 6.2 Dockerfile

```dockerfile
# Base image
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Development stage
FROM base AS development
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## 7. Environment Variables

**.env.example**
```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
DB_USER=expense_user
DB_PASSWORD=secure_password
DB_NAME=expense_tracker
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:19006

# Redis (future)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Monitoring (future)
SENTRY_DSN=
NEW_RELIC_LICENSE_KEY=

# Email (future)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 8. Testing Strategy

### 8.1 Unit Testing

**Coverage Target: 80%**

- Service layer business logic
- DTO validation
- Utility functions
- Guards and interceptors
- Database queries

### 8.2 Integration Testing

- Controller endpoints
- Authentication flow
- Database transactions
- Module interactions
- Error handling

### 8.3 E2E Testing

- Complete user registration and login flow
- Expense creation and budget tracking
- Statistics generation
- API rate limiting
- Security vulnerabilities

### 8.4 Performance Testing

- Load testing with 1000+ concurrent users
- Stress testing for breaking points
- Database query optimization
- API response time validation
- Memory leak detection

---

## 9. Security Checklist

### 9.1 Authentication & Authorization

- [x] Password hashing with bcrypt
- [x] JWT token implementation
- [x] Token refresh mechanism
- [x] Rate limiting on auth endpoints
- [x] Account lockout after failed attempts
- [ ] Two-factor authentication (future)

### 9.2 Data Protection

- [x] Input validation and sanitization
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Secure headers (Helmet)
- [ ] Data encryption at rest

### 9.3 API Security

- [x] HTTPS enforcement
- [x] CORS configuration
- [x] API rate limiting
- [x] Request size limits
- [x] Authentication on all protected routes
- [ ] API versioning

### 9.4 Compliance

- [ ] GDPR compliance
- [ ] Data retention policies
- [ ] User consent management
- [ ] Right to deletion
- [ ] Data portability

---

## 10. Deployment Strategy

### 10.1 Development Environment

- Local development with Docker
- Feature branch workflow
- Code review process
- Automated testing in CI

### 10.2 Staging Environment

- Mirror of production
- Integration testing
- Performance testing
- User acceptance testing

### 10.3 Production Environment

**Cloud Provider Options:**
1. **Heroku** (Simple, quick deployment)
2. **AWS** (EC2 + RDS + ElastiCache)
3. **Google Cloud Platform** (Cloud Run + Cloud SQL)
4. **DigitalOcean** (App Platform + Managed Database)
5. **Vercel** (for API) + **Supabase** (for database)

**Recommended: DigitalOcean App Platform**
- Simple deployment from GitHub
- Managed PostgreSQL database
- Auto-scaling capabilities
- Built-in monitoring
- Cost-effective for students

### 10.4 CI/CD Pipeline

**.github/workflows/ci.yml**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl apps create-deployment ${{ secrets.APP_ID }}
```

---

## 11. Monitoring and Maintenance

### 11.1 Application Monitoring

- Health check endpoints
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)
- Custom metrics dashboard

### 11.2 Database Monitoring

- Query performance tracking
- Connection pool monitoring
- Storage usage alerts
- Backup verification
- Index usage analysis

### 11.3 Log Management

- Centralized logging (ELK Stack/CloudWatch)
- Log retention policies
- Alert rules for errors
- Audit trail for sensitive operations
- Request/response logging

---

## 12. Future Enhancements

### 12.1 Phase 2 Features (3-6 months)

- **E-wallet Integration:** Momo, ZaloPay automatic import
- **Receipt Scanning:** OCR for expense entry
- **Recurring Expenses:** Scheduled/repeated expenses
- **Shared Budgets:** Group expense tracking for roommates
- **Export Functions:** CSV, Excel, PDF reports
- **Multi-currency Support:** USD, EUR conversion
- **Savings Goals:** Track savings alongside expenses
- **Bill Reminders:** Upcoming payment notifications

### 12.2 Phase 3 Features (6-12 months)

- **AI Insights:** Spending pattern analysis and predictions
- **Bank Integration:** Direct bank account sync
- **Campus Integration:** University payment systems
- **Social Features:** Compare spending with peers (anonymized)
- **Gamification:** Achievements, badges, challenges
- **Voice Input:** Voice-to-expense entry
- **Smart Notifications:** Context-aware alerts
- **Investment Tracking:** Basic portfolio monitoring

### 12.3 Technical Enhancements

- **GraphQL API:** Alternative to REST
- **Microservices:** Service separation for scale
- **Event-Driven Architecture:** Real-time updates
- **Machine Learning:** Expense categorization
- **Blockchain:** Expense verification (experimental)
- **PWA Support:** Progressive Web App
- **Real-time Sync:** WebSocket for live updates
- **Kubernetes:** Container orchestration

---

## 13. Success Metrics

### 13.1 Technical KPIs

- API uptime > 99.5%
- Average response time < 300ms
- Error rate < 1%
- Test coverage > 80%
- Zero critical security vulnerabilities
- Database query time < 100ms
- Successful deployment rate > 95%

### 13.2 Business KPIs

- User registration success rate > 90%
- Daily active users growth
- Average session duration
- Feature adoption rate
- User retention (30-day)
- App crash rate < 0.5%
- Customer satisfaction score > 4.5/5

### 13.3 Performance Benchmarks

- Handle 100 requests/second
- Support 10,000 concurrent users
- Process 1,000 expenses/minute
- Generate statistics in < 2 seconds
- Complete backup in < 10 minutes
- Restore from backup in < 30 minutes

---

## 14. Risk Analysis and Mitigation

### 14.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database failure | High | Low | Regular backups, replication |
| Security breach | High | Medium | Security audits, penetration testing |
| Performance degradation | Medium | Medium | Monitoring, caching, optimization |
| Third-party service outage | Low | Medium | Fallback mechanisms, queuing |
| Data loss | High | Low | Backup strategy, transaction logs |

### 14.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | User feedback, iterative improvement |
| Competitor features | Medium | High | Rapid feature development |
| Regulatory changes | Medium | Low | Compliance monitoring |
| Scope creep | High | High | Strict prioritization, MVP focus |
| Technical debt | Medium | High | Regular refactoring, code reviews |

---

## 15. Open Questions and Decisions Needed

### 15.1 Technical Decisions

1. **Database Selection:** PostgreSQL vs MySQL?
   - **Recommendation:** PostgreSQL for better JSON support and advanced features

2. **ORM Choice:** Prisma vs TypeORM?
   - **Recommendation:** Prisma for better TypeScript support and developer experience

3. **Caching Strategy:** Redis vs In-memory?
   - **Recommendation:** Start with in-memory, add Redis when scaling

4. **File Storage:** Local vs Cloud (S3)?
   - **Recommendation:** Start local, migrate to S3 for receipts feature

5. **Search Engine:** PostgreSQL full-text vs Elasticsearch?
   - **Recommendation:** PostgreSQL full-text for MVP, Elasticsearch later

### 15.2 Business Decisions

1. **Monetization Model:** Freemium vs Ads vs Paid?
2. **Data Retention Period:** How long to keep user data?
3. **Multi-tenancy:** Single database vs Database per user?
4. **Localization Priority:** Vietnamese first or bilingual?
5. **Platform Priority:** Mobile-first or web-first?

### 15.3 Feature Prioritization

1. **Social Features:** Share expenses with friends?
2. **Gamification:** Points and achievements system?
3. **AI Features:** Smart categorization and predictions?
4. **Integration Priority:** Banks vs E-wallets?
5. **Export Formats:** Which formats to support first?

---

## 16. Team Collaboration Guidelines

### 16.1 Development Workflow

1. **Branching Strategy:** Git Flow
   - main: Production-ready code
   - develop: Integration branch
   - feature/*: New features
   - bugfix/*: Bug fixes
   - hotfix/*: Emergency fixes

2. **Commit Convention:** Conventional Commits
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Code style
   - refactor: Refactoring
   - test: Testing
   - chore: Maintenance

3. **Code Review Process:**
   - Minimum 1 reviewer required
   - All tests must pass
   - No decrease in code coverage
   - Follow coding standards

### 16.2 Communication

- **Daily Standup:** 15 minutes
- **Sprint Planning:** Every 2 weeks
- **Sprint Review:** End of sprint
- **Retrospective:** Monthly
- **Documentation:** Confluence/Notion
- **Communication:** Slack/Discord

---

## 17. Resources and References

### 17.1 Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io)
- [Docker Documentation](https://docs.docker.com)

### 17.2 Learning Resources

- [NestJS Fundamentals Course](https://courses.nestjs.com)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com)
- [API Security Best Practices](https://owasp.org/www-project-api-security)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)

### 17.3 Tools

- **API Testing:** Postman, Insomnia
- **Database Client:** pgAdmin, DBeaver
- **Monitoring:** Grafana, Prometheus
- **Load Testing:** K6, JMeter
- **Documentation:** Swagger, Redoc
- **Version Control:** Git, GitHub

---

## 18. Conclusion

This comprehensive requirements plan provides a complete roadmap for developing the ExpenseTracker API backend. The plan addresses all functional and non-functional requirements, provides detailed technical specifications, and outlines a clear development path from MVP to full-featured application.

The focus on the Vietnamese student market with features like VND currency support, budget management, and expense tracking positions this application to effectively serve its target audience of 1.7 million university students.

With the modular NestJS architecture, robust security measures, and scalable design, the ExpenseTracker API is positioned to grow from a simple expense tracking tool to a comprehensive financial management platform for students.

**Key Success Factors:**
1. Focus on MVP features first
2. Maintain high code quality and testing standards
3. Prioritize security and data privacy
4. Ensure excellent performance and user experience
5. Iterate based on user feedback

**Next Immediate Steps:**
1. Set up the development environment with Docker
2. Initialize the database with Prisma
3. Implement authentication module
4. Create basic expense CRUD operations
5. Deploy initial version for testing

The project is now ready to move from planning to implementation phase.

---

*Document Version: 1.0*
*Last Updated: November 2025*
*Prepared for: 4T-mobile ExpenseTracker Team*