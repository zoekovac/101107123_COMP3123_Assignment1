# COMP 3123 – Assignment 1: Backend Development

**Employee management application with RESTful API security**

| Student Name | Student ID | GitHub Account |
|---|---|---|
| Zoë Kovac | 101107123 | [@zoekovac](https://github.com/zoekovac/) |

![NodeJS](https://img.shields.io/badge/node.js-%236DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-%23FF6C37.svg?style=for-the-badge&logo=postman&logoColor=white)
![JWT](https://img.shields.io/badge/json%20web%20tokens-%23000000.svg?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Installation](#2-installation)
3. [Configuration](#3-configuration)
4. [API](#4-api)
5. [Authentication](#5-authentication)
6. [Authorization](#6-authorization)
7. [Security](#7-security)
8. [Logging](#9-health-check)
9. [Health Check](#9-health-check)

## 1. Project Overview

### Application Purpose

This is a REST API for managing employee records. Users create an account, log in to receive a JWT, and then use 
that token to create, view, update and delete employees. Each employee belongs to the user who created it, so users 
can only see and manage their own records.

### Technologies Used

**Runtime and Framework**

- Node.js
- JavaScript
- Express.js

**Database**

- MongoDB
- Mongoose

**Authentication and Security**

- JSON Web Tokens (jsonwebtoken)
- bcrypt
- Helmet
- express-rate-limit

**Validation and Configuration**

- express-validator
- dotenv

**Testing and Tools**

- Postman
- Newman
- Git

### Project Structure/Architecture

```text
101107123_comp3123_assignment1 (root)
├── postman/
│   └── 101107123_comp3123_assignment1.postman_collection.json
├── logs/
│   └── app.log
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── employeeController.js
│   │   └── userController.js 
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   ├── rateLimiter.js
│   │   └── requestLogger.js
│   ├── models/
│   │   ├── Employee.js
│   │   └── User.js
│   ├── routes/
│   │   ├── employeeRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── cacheService.js
│   ├── utils/
│   │   ├── appError.js
│   │   ├── logger.js
│   │   └── token.js
│   ├── validators/
│   │   ├── employeeValidator.js
│   │   ├── userValidator.js
│   │   ├── requestBodyValidator.js
│   │   └── requestValidator.js
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── package.json
├── package-lock.json
├── .gitignore
├── sample.log
└── README.md
```

## 2. Installation

### Prerequisites

- Node.js
- MongoDB
- Postman (for testing)

### 1. Clone the repository

Copy in your terminal:

```bash
git clone https://github.com/zoekovac/101107123_COMP3123_Assignment1.git
cd 101107123_COMP3123_Assignment1
```

### 2. Install dependencies

Copy in your terminal:

```bash
npm install
```

### 3. Configure environment variables

Copy the example file in the terminal:

```bash
cp .env.example .env
```

Then open `.env` and set the values:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API runs on | `3020` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/employee_api` |
| `JWT_SECRET` | Secret used to sign tokens | see below |
| `JWT_EXPIRES_IN` | How long a token stays valid | `1h` |
| `LOG_DIR` | Folder for log files | `logs` |

To generate a secure `JWT_SECRET`:

Copy in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start MongoDB

Copy in your terminal:

```bash
brew services start mongodb-community
```

### 5. Health Check

Copy in your terminal:

```bash
curl http://localhost:3020/health
````

### 6. Run Tests

Copy in one terminal:

```bash
npm run dev
```

Copy in a second terminal:

```bash
npm run test
```

## 5. API

## API Endpoints

**Base URL:** `http://localhost:3020`

| Method | Endpoint | Auth | Request body | Success | Errors |
|---|---|---|---|---|---|
| GET | `/health` | No | None | 200 OK | None |
| POST | `/api/v1/user/signup` | No | `username`, `email`, `password` | 201 Created | 400 invalid input, 409 username or email exists, 429 too many attempts |
| POST | `/api/v1/user/login` | No | `username` **or** `email`, plus `password` | 200 OK + `token` | 400 invalid input, 401 invalid credentials, 429 too many attempts |
| GET | `/api/v1/emp/employees` | Yes | None | 200 OK, list of your employees | 401 missing/invalid/expired token |
| POST | `/api/v1/emp/employees` | Yes | `first_name`, `last_name`, `email`, `position`, `salary`, `date_of_joining`, `department` | 201 Created | 400 invalid input, 401 token |
| GET | `/api/v1/emp/employees/:eid` | Yes | None | 200 OK, one employee | 400 invalid ID, 401 token, 403 another user's employee, 404 not found |
| PUT | `/api/v1/emp/employees/:eid` | Yes | All 7 employee fields | 200 OK, updated employee | 400 invalid ID or input, 401 token, 403 another user's employee, 404 not found |
| DELETE | `/api/v1/emp/employees?eid=<id>` | Yes | None | 204 No Content | 400 invalid ID, 401 token, 403 another user's employee, 404 not found |

## 4. Authentication

### Signup

`POST /api/v1/user/signup` creates an account with a `username`, `email` and `password`. Usernames and emails must be 
unique. The password is validated, hashed with **bcrypt** before it is saved, and never returned in responses.

### Login

`POST /api/v1/user/login` accepts either a username or an email, plus the password. If the details are correct, 
the API returns a JWT. Wrong details always return the same `401 Invalid credentials` message, so it doesn't reveal 
which accounts exist.

### JWT

The token is signed with `JWT_SECRET` from `.env` using HS256, and it expires after `JWT_EXPIRES_IN`. It contains only 
the user's ID; no password or personal details.

### Authorization header

Send the token with every request to a protected endpoint:

```
Authorization: Bearer <token>
```

### Protected employee endpoints

All `/api/v1/emp/employees` routes run the `authenticate` middleware first. It:

- returns **401** if the token is missing, invalid or expired
- returns **401** if the user in the token no longer exists
- sets `req.user.id` from the token, so the user's identity always comes from the JWT and never from the request body

Only after these checks does the request reach the employee controller.

## 5. Authorization

Every employee belongs to the user who created it, and a user can only see and change their own employees. This is 
enforced in several layers, so no single mistake exposes another user's data.

1. **The user's identity comes only from the JWT**

    - All employee routes run the `authenticate` middleware first (`src/middleware/auth.js`).
    - The API never trusts a user ID sent by the client. The controllers only use `req.user.id`.

2. **The owner is set by the server, not the client**

    - When an employee is created, the owner is always taken from the token.

3. **Every query is limited to the current user**

    - Listing employees only returns the current user's employees.
    - For get, update and delete, the employee is loaded and its owner is checked first.

4. **The cache is separate for each user**

    - The employee list is cached per user (`employees:<userId>`), so one user's cached list is never served to another.
    - The cache is cleared whenever that user creates, updates or deletes an employee.

## 6. Security

### Password Hashing

Passwords are hashed with **bcrypt** in the `User` model before they are saved, so plain-text passwords are never 
stored. The password field is hidden from queries by default (`select: false`) and is removed 
from all API responses.

### JWT

After login, users get a JWT signed with `JWT_SECRET`. Tokens expire after 1 hour and contain only the user ID. When a 
token is checked, only HS256 is accepted, which blocks algorithm-swap attacks. Tokens for deleted users are rejected.

### Helmet

**Helmet** adds secure HTTP headers to every response. For example, it stops the browser from guessing content types, 
blocks the page being embedded in frames, and hides the `X-Powered-By: Express` header.

### Rate Limiting

**express-rate-limit** allows 20 signup/login requests per IP every 15 minutes. After that, the API returns **429 Too 
Many Requests**. This slows down password-guessing attacks.

### Input Validation

Every request body is checked with **express-validator** before it reaches a controller:

- Required fields, types and formats (email, date, non-negative salary)
- Strong passwords (uppercase, lowercase, number and special character)
- Unknown fields are rejected, so a client cannot set the employee owner (`user`)
- Employee IDs must be valid MongoDB IDs

The Mongoose schemas repeat the key rules as a second check. Invalid input returns **400** with a list of field errors. 
JSON bodies are limited to 10 KB.

### Environment Variables

Secrets and settings (`MONGODB_URI`, `JWT_SECRET`, `PORT`) are loaded from a `.env` file with **dotenv**. `.env` is listed
in `.gitignore` so it is never committed; `.env.example` shows the required variables without real values. The server 
refuses to start if `MONGODB_URI` or `JWT_SECRET` is missing.

## 7. Logging

Logs are stored in a JSON file named  `app.log` in the `/logs` folder under the project root.

```text
101107123_comp3123_assignment1 (root)
└── logs/
    └── app.log
```

### Logged Information

| Event | Description |
|---|---|
| `http_request` | Every request finishes |
| `signup_success` | A user signs up |
| `signup_conflict` | Signup uses a username or email that is taken |
| `login_success` | A user logs in |
| `login_failed` | Wrong password or unknown user |
| `authentication_failed` | Missing, invalid or expired JWT |
| `authorization_failed` | A user tries to access another user's employee |
| `validation_failed` | A request body or ID fails validation |
| `not_found` | An employee or route does not exist |
| `rate_limit_exceeded` | Too many login or signup attempts |
| `application_error` | Database errors/unexpected server errors |

### Information Not Logged

- Passwords
- JWT secrets
- Database passwords or connection strings
- Full authentication tokens
- Request bodies and headers

## 8. Health Check

Health Check URL: [http://localhost:3020/health]("http://localhost:3020/health")

**Expected Response**

```json
{
  "success":true,
  "message":"API is running"
}
```
