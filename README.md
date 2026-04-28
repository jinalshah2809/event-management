# Event Booking System API

A robust, production-ready backend for an Event Booking System built with Node.js, Express, TypeScript, and MySQL.

## Features

- **User Management**: Registration with securely hashed passwords, and JWT-based authentication.
- **Event Management**: Create, view, update, and delete events.
  - Browse events with optional date filtering (`start`, `end`) and pagination (`page`, `limit`).
- **Ticket Booking System**: Safe real-time concurrent ticket booking utilizing row-level database locking.
- **Role-based Access Control**: 
  - `admin`: Can create, update, delete events, and export bookings.
  - `user`: Can view events and book tickets.
- **Rate Limiting**: Protection of sensitive endpoints like login and bookings against brute force and spam.
- **Data Export**: Admins can export a CSV of all bookings.
- **Swagger Documentation**: Interactive OpenAPI specifications via Swagger UI.

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (using `mysql2/promise`)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for hashing
- **Security**: express-rate-limit

## Installation Roadmap

### Prerequisite
Provide an instance of MySQL database. Define connection parameters in your `.env` file (e.g., using XAMPP, Docker, or native installation).

1. **Clone or Extract Project**
   Navigate to the repository folder: `event-management`.

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Ensure `.env` at the root of the project looks like this:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=events_db
   JWT_SECRET=supersecret_jwt_key_123!
   ```
   *(Change values in `.env` if your database uses different credentials)*

4. **Initialize Database and Schema**
   Run the migration script to automatically create your database and needed tables (`users`, `events`, `bookings`).
   ```bash
   npm run db:init
   ```

5. **Start Application**
   - For **Development**:
     ```bash
     npm run dev
     ```
   - For **Production**:
     ```bash
     npm run build
     npm start
     ```

## API Documentation

Swagger API explorer is available when running the application.  
Access it in your browser:  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Important Endpoints

#### Authentication
- **POST** `/auth/register`: Register new users.
- **POST** `/auth/login`: Issue an access token.

#### Events
- **GET** `/events`: View paginated and filtered events. *(Public)*
- **POST** `/events`: Add a new event. *(Admin only)*
- **PUT** `/events/:id`: Update an event. *(Admin only)*
- **DELETE** `/events/:id`: Delete an event. *(Admin only)*

#### Bookings
- **POST** `/bookings`: Book an event (pass `eventId`, and optional `tickets`). *(Authenticated user)*
- **GET** `/bookings/export`: Download CSV containing all bookings. *(Admin only)*

## Role Assignment Note
By default, standard POST `/auth/register` assigns the `user` role. You can create an admin either by directly altering the `users` table row within MySQL (changing `role` from 'user' to 'admin'), or modifying `auth.service.ts` locally to default initial users to `admin`.
