# urgent2kay

A fintech web app that allows users to bundle multiple bills and financial needs into a single request that, when accepted, automatically disburses payments directly to service providers and merchants

## Table of Contents

- Overview

- Features

- Technology Stack

- System Architecture

- Prerequisites

- Installation

- API Endpoints

- Testing

- API Documentation

- Project Structure

- Known Issues

- Future Improvements

- Contributors

- Contributing

- Acknowledgments

---

## Overview

Urgent2Kay is a full-featured financial services application that allows users to manage bills, create bill bundles, process payments, manage financial relationships, and access various utility services such as airtime purchase, data subscription, electricity payments, and cable TV subscriptions.

---

## Features

### Bill Management

- Create and track bills
- Organize bills by category
- Link bills to merchants with bank details
- View bills by owner

### Bill Bundles

- Group multiple bills into bundles
- Calculate total amounts automatically
- Share bundles with sponsors
- Track funding status (pending, partially-funded, fully-funded)
- Email notifications for bundle invitations

### Payment Processing

- Secure payment integration with Paystack
- Multiple payment channels
- Transaction verification
- Automatic status updates

### Financial Relationships

- Create and manage financial relationships between users
- Define relationship types (parent-child, partners, friends, etc.)
- Set spending controls and limits
- Track contributions and spending patterns
- Auto-approve transactions based on configured limits

### Utility Services

- Airtime purchase
- Data subscriptions
- Electricity bill payments
- Cable TV subscriptions
- Service providers management

### Automated Transfers

- Bulk transfers to multiple recipients
- Transfer tracking and status updates
- Automatic transfer on bundle full funding

### User Management

- User registration with email verification
- Secure authentication
- Password reset functionality
- Role-based access control

---

## Technology Stack

- Backend: Node.js with TypeScript
- Database: MongoDB with Mongoose ODM
- Payment Gateway: Paystack
- Email Service: Nodemailer
- Authentication: JWT (JSON Web Tokens)
- External Services: Ayinlak API for utility services

## System Architecture

Urgent2Kay follows a modern microservices architecture with clearly separated layers:

### Core Architecture Components

- Presentation Layer: RESTful API endpoints exposed via Express.js

- Business Logic Layer: Service modules handling core business logic

- Data Access Layer: Repository pattern implementation with Mongoose

- External Service Integration Layer: Adapters for Paystack, Ayinlak API, etc.

### Service Communication

- Internal Communication: Direct service calls

- External Communication: RESTful API, Webhooks

- Event System: Event-driven architecture for critical state changes

---

## Prerequisites

### Development Environment

- Node.js (v14.x or higher)
- npm (v7.x or higher) or Yarn (v1.22.x or higher)
- MongoDB (v4.4 or higher)
- Git

### External Service Accounts

- Paystack Developer Account
- Ayinlak API Access Credentials
- SMTP Email Provider

### Environment Configuration

Complete .env file with all required variables:

- Server Configuration

PORT=3000
NODE_ENV=development

- Database Configuration

MONGODB_URI=mongodb:(mongodb+srv://your_connection_string)
MONGODB_TEST_URI=mongodb://your_test_string

- Authentication

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

- Payment Gateway

PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret

- Email Configuration

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=`your_email@example.com`
EMAIL_PASS=your_email_password

- Utility Service Provider (Ayinlak API)

AYINLAK_API_KEY=your_ayinlak_api_key
AYINLAK_BASE_URL=`https://api.ayinlak.com/v1`

- Logging

LOG_LEVEL=debug

---

## Installation

- Clone the repository

git clone `https://github.com/yourusername/urgent2kay.git`

cd urgent2kay

- Install dependencies

npm install

- Create a .env file in the root directory with the following variables:

PORT=3000
MONGODB_URI= (mongodb+srv://your_connection_string)
JWT_SECRET=your_jwt_secret_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=`your_email@example.com`
EMAIL_PASS=your_email_password

- Start the development server

npm run dev

---

## API Endpoints

### Authentication

POST /api/auth/register - Register new user

POST /api/auth/login - User login

GET /api/auth/verify-email - Verify email address

POST /api/auth/resend-verification - Resend verification email

POST /api/auth/forgot-password - Request password reset

POST /api/auth/reset-password - Reset password

### Bills

POST /api/bills - Create a new bill

GET /api/bills/owner/:ownerId - Get bills by owner

PATCH /api/bills/:id/status - Update bill status

### Bill Bundle

POST /api/bundles - Create a new bundle

POST /api/bundles/:id/share - Share bundle with sponsor

GET /api/bundles/:uniqueLink - Get bundle by link

### Payments

POST /api/payments/initialize - Initialize payment

GET /api/payments/verify/:reference - Verify payment

POST /api/webhooks/paystack - Handle Paystack webhooks

### Relationships

POST /api/relationships - Create a relationship

GET /api/relationships - Get user relationships

GET /api/relationships/:id - Get relationship by ID

PATCH /api/relationships/:id - Update a relationship

DELETE /api/relationships/:id - Delete a relationship

### Spending Controls

POST /api/relationships/:id/spending-control - Set spending controls

GET /api/relationships/:id/spending-control - Get spending controls

POST /api/relationships/:id/check-limits - Check spending limits

### Services

GET /api/services - Get all services

GET /api/services/:category/providers - Get service providers

GET /api/services/:category/:provider/plans - Get service plans

POST /api/services/airtime - Buy airtime

POST /api/services/data - Buy data

POST /api/services/electricity - Pay electricity bill

POST /api/services/cable - Subscribe to cable TV

---

## Testing

### Testing Framework

The project uses Jest as the primary testing framework with the following testing structure:

- Unit Tests: Test individual components in isolation
- Integration Tests: Test interactions between components
- End-to-End Tests: Test complete user workflows

### Running Tests

- Run all tests
npm test

- Run unit tests
npm run test:unit

- Run integration tests
npm run test:integration

- Run e2e tests
npm run test:e2e

- Generate test coverage report
npm run test:coverage

### Mocking

- External services (Paystack, Ayinlak) are mocked using Jest mock functions

- Database operations use an in-memory MongoDB server for integration tests

### CI/CD Integration

Tests are automatically run on:

- Pull requests to main branch

- Before deployment to staging/production environments

---

## API Documentation

API documentation is available via Swagger UI:

Development: `http://localhost:3000/api-docs`

Production: `https://api.urgent2kay.com/api-docs`

---

## Project Structure

urgent2kay/
│
├── src/
│   ├── config/                 # Configuration files
│   │   ├── db.ts               # Database connection
│   │   ├── config.ts           # Express configuration
│   │   └── ...
│   │
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── bill.controller.ts
│   │   └── ...
│   │
│   ├── middlewares/            # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── models/                 # MongoDB schemas
│   │   ├── user.model.ts
│   │   ├── bill.model.ts
│   │   └── ...
│   │
│   ├── routes/                 # API routes
│   │   ├── auth.routes.ts
│   │   ├── bill.routes.ts
│   │   └── ...
│   │
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── bill.service.ts
│   │   └── ...
│   │
│   ├── utils/                  # Utility functions
│   │   ├── index.ts
│   │   ├── validation.ts
│   │   └── ...
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── bill.types.ts
│   │   └── ...
│   │
│   ├── integrations/           # External service integrations
│       ├── paystack.ts
│       └── ayinlak.ts
│
├── server.ts                   # Application entry point
│
├── docs/                       # Documentation
├── .env                        # Environment variables
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation

---

## Known Issues and Limitations

### Current Limitations

- Concurrency Handling: Limited handling of concurrent bill modifications

- Internationalization: Currently supports English language only

- Payment Providers: Limited to Paystack integration only

- Service Coverage: Utility services limited to Nigerian providers

- Reporting: Basic reporting capabilities with limited customization

- Mobile Optimization: API optimized for web applications with limited mobile-specific optimizations

### Performance Considerations

- Database Scaling: MongoDB horizontal scaling should be implemented for production

- Rate Limiting: Basic rate limiting implemented; may need adjustment for high traffic

- Caching Strategy: In-memory caching for frequently accessed resource

- Payment Processing: Asynchronous processing for payment transactions

### Security Notes

- JWT tokens expire after 24 hours

- Refresh tokens implemented with 7-day expiry

- Payment information is not stored in the system

- Password reset tokens expire after 1 hour

- All API endpoints are protected with appropriate authorization

### Planned Improvements

- GraphQL API: Alternative to REST for more flexible data fetching

- WebSocket Support: Real-time updates for payment status changes

- Enhanced Analytics: Comprehensive reporting and analytics dashboard

- Multi-currency Support: Support for international currencies

- Authentication Providers: OAuth integration with social login options

- Advanced Caching: Redis implementation for improved performance

---

## Future Improvements

- Advanced analytics and reporting
- Subscription management
- Budget planning tools
- Investment options
- Multi-currency support
- Enhanced security features

---

## Contributors

- Uche Ejike
- Chikezie Ilodigwe
- Ifeyinwa Iyiegbu
- Collins Aninze

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/your-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Please ensure your code follows the style guidelines and includes appropriate tests.

---

## Acknowledgements

- Paystack: For providing the secure payment processing infrastructure that powers our financial transactions
- Ayinlak API: For their utility services integration that enables airtime, data, electricity, and cable TV subscriptions
- MongoDB: For the robust database technology that stores our application data
- Node.js Foundation: For the runtime environment that powers our backend services
- TypeScript: For providing the type safety that improves our code quality and development experience
- Express.js: For the web framework that facilitates our API development
- Jest: For the testing framework that ensures our code quality
- Nodemailer: For the email delivery service that powers our notifications
