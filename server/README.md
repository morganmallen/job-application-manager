<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Job Application Manager Backend (NestJS)

A robust backend server built with NestJS, TypeScript, PostgreSQL, TypeORM, and Swagger for managing job applications, companies, and interview events.

## 🚀 Features

- **NestJS Framework** with TypeScript for scalable architecture
- **RESTful API** with comprehensive CRUD operations
- **TypeORM** for database management with PostgreSQL
- **Swagger/OpenAPI** documentation
- **Input validation** with class-validator
- **Dependency injection** and modular architecture
- **CORS** configuration
- **Environment-based configuration**

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Navigate to the NestJS server directory:**

   ```bash
   cd server-nestjs
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

   Edit the `.env` file with your database configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/job_application_manager"
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the development server:**

   ```bash
   npm run start:dev
   ```

5. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

## 🏃‍♂️ Running the Server

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3001/api-docs`
- **Health Check**: `http://localhost:3001/api/health`

## 🗄️ Database Schema

The application uses the following main entities:

### User

- Basic user information (name, email)
- One-to-many relationship with companies and applications

### Company

- Company details (name, website, description, location)
- Belongs to a user
- One-to-many relationship with applications

### Application

- Job application details (position, status, salary, etc.)
- Belongs to a user and company
- One-to-many relationship with events

### ApplicationEvent

- Interview events and milestones
- Belongs to an application
- Includes scheduling and completion tracking

## 🔧 Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm run start:prod` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## 📡 API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Companies

- `GET /api/companies` - Get all companies (with optional user filter)
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create new company
- `PATCH /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Applications

- `GET /api/applications` - Get all applications (with optional filters)
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create new application
- `PATCH /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Events

- `GET /api/events` - Get all events (with optional filters)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## 🏗️ Architecture

### NestJS Structure

```
src/
├── controllers/          # HTTP request handlers
├── services/            # Business logic
├── entities/            # Database models
├── dto/                 # Data Transfer Objects
└── main.ts              # Application entry point
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data access
- **Entities**: Define database schema with TypeORM decorators
- **DTOs**: Define request/response data structures with validation
- **Modules**: Organize application into feature modules

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation with class-validator
- **CORS**: Configurable cross-origin resource sharing
- **Type Safety**: Full TypeScript support throughout the application
- **Error Handling**: Structured error responses with proper HTTP status codes

## 🧪 Testing

The API includes comprehensive validation and error handling. You can test the endpoints using:

1. **Swagger UI** at `http://localhost:3001/api-docs`
2. **Postman** or similar API testing tools
3. **cURL** commands

### Example API Calls

```bash
# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all applications
curl http://localhost:3001/api/applications

# Create a company
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name": "TechCorp", "userId": "user-id-here"}'
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

## 📝 Environment Variables

| Variable       | Description                  | Default               |
| -------------- | ---------------------------- | --------------------- |
| `DATABASE_URL` | PostgreSQL connection string | Required              |
| `PORT`         | Server port                  | 3001                  |
| `NODE_ENV`     | Environment mode             | development           |
| `CORS_ORIGIN`  | Allowed CORS origin          | http://localhost:5173 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔄 Migration from Express.js

This NestJS version provides the same functionality as the Express.js version but with:

- **Better Architecture**: Modular, scalable structure
- **Dependency Injection**: Built-in IoC container
- **Type Safety**: Enhanced TypeScript integration
- **Validation**: Built-in validation pipes
- **Testing**: Better testing utilities
- **Documentation**: Automatic Swagger generation
