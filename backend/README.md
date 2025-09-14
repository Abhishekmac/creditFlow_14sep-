# CreditFlow Backend API

A comprehensive credit card management system backend built with Node.js, TypeScript, Express, and Prisma.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **Credit Card Management**: Apply, approve, block/unblock cards
- **Transaction Processing**: View, filter, and dispute transactions
- **Payment System**: Multiple payment methods with webhook support
- **Rewards Program**: Points tracking and redemption
- **Notifications**: Real-time user notifications
- **Admin Panel**: Application approval and management
- **API Documentation**: OpenAPI/Swagger documentation
- **Security**: Rate limiting, input validation, CORS protection

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, Rate limiting
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Logging**: Winston

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd creditflow/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/creditflow"
PORT=4000
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

4. **Database setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run db:seed
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:4000/api/docs`
- **OpenAPI JSON**: `http://localhost:4000/api/docs.json`

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** to get an access token
2. **Include token** in requests: `Authorization: Bearer <token>`
3. **Refresh tokens** are stored as httpOnly cookies

### Example Authentication Flow

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Use token in requests
curl -X GET http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer <your-token>"
```

## 🛣 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard` - Get dashboard overview

### Cards
- `POST /api/cards/apply` - Apply for new card
- `GET /api/cards/apply` - Get user's applications
- `GET /api/cards` - Get user's cards
- `PATCH /api/cards/:id/status` - Block/unblock card
- `PATCH /api/cards/:id/autopay` - Toggle autopay

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions/:id/dispute` - Create dispute

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get user's payments
- `POST /api/payments/webhook` - Payment webhook

### Rewards
- `GET /api/rewards` - Get user's rewards
- `POST /api/rewards/redeem` - Redeem reward

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile
- `PUT /api/profile/contact` - Update contact info
- `PUT /api/profile/password` - Change password

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Statements
- `GET /api/statements` - Get statements
- `GET /api/statements/:id` - Get specific statement

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- `tests/auth.test.ts` - Authentication tests
- `tests/cards.test.ts` - Card management tests
- `tests/payments.test.ts` - Payment processing tests
- `tests/transactions.test.ts` - Transaction tests

## 🗄 Database Schema

The database uses Prisma ORM with the following main entities:

- **User** - User accounts and profiles
- **Card** - Credit cards
- **CardApplication** - Card applications
- **Transaction** - Card transactions
- **Payment** - Payment records
- **Statement** - Monthly statements
- **Reward** - Reward points
- **Notification** - User notifications
- **Dispute** - Transaction disputes
- **RefreshToken** - JWT refresh tokens

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Input Validation** with Zod schemas
- **Rate Limiting** on all endpoints
- **CORS Protection** with configurable origins
- **Helmet** for security headers
- **SQL Injection Protection** via Prisma
- **XSS Protection** through input sanitization

## 📊 Monitoring & Logging

- **Winston Logger** for structured logging
- **Request/Response Logging** for debugging
- **Error Tracking** with stack traces
- **Performance Monitoring** via middleware

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/creditflow"
JWT_SECRET="your-production-secret"
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "start"]
```

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update API documentation
- Use conventional commit messages
- Ensure all tests pass before submitting

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field specific error",
        "code": "VALIDATION_CODE"
      }
    ]
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**
   - Reset database: `npx prisma migrate reset`
   - Check migration files for syntax errors

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header format

4. **CORS Errors**
   - Update CORS_ORIGIN in .env
   - Check frontend URL matches exactly

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test files for usage examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Node.js, TypeScript, Express, and Prisma**