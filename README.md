
# Airport Flight Management System

A comprehensive flight management system for airports with role-based access control and real-time updates.

## Features

- Multi-role system: Admin, Staff, Airline, and Passenger
- Real-time flight tracking and management
- Gate and runway assignment
- Seat reservation system
- Notification system for flight updates
- Responsive UI with Tailwind CSS

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js
- **Database**: MySQL

## Setup Instructions

### 1. Database Setup

1. Install MySQL and create a database named `airport_db`:

```sql
CREATE DATABASE airport_db;
```

2. Use the schema script to set up the database structure:

```bash
mysql -u root -p airport_db < server/db/schema.sql
```

Or run the SQL commands directly in phpMyAdmin.

### 2. Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will run on http://localhost:3001 by default.

### 3. Frontend Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173.

## Default Users

The system comes with the following pre-configured users:

### Admin
- Email: admin@airport.com
- Password: admin123

### Staff
- Email: staff@airport.com
- Password: staff123

### Airline
- Email: airline@skyair.com
- Password: airline123

### Passenger
- Email: john@example.com
- Password: passenger123

## API Endpoints

The system provides the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Flights
- `GET /api/flights` - Get all flights
- `GET /api/flights/:id` - Get flight by ID
- `GET /api/flights/airline/:airlineId` - Get flights by airline
- `POST /api/flights` - Create a new flight
- `PUT /api/flights/:id` - Update a flight
- `DELETE /api/flights/:id` - Delete a flight

### Gates
- `GET /api/gates` - Get all gates
- `GET /api/gates/available` - Get available gates for a time slot
- `PUT /api/flights/:id/gate` - Assign a gate to a flight

### Runways
- `GET /api/runways` - Get all runways
- `GET /api/runways/available` - Get available runways for a time slot
- `PUT /api/flights/:id/runway` - Assign a runway to a flight

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/user/:userId` - Get notifications for a user
- `POST /api/notifications` - Create a new notification
- `PUT /api/notifications/:id/read` - Mark a notification as read

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/user/:userId` - Get reservations for a user
- `GET /api/reservations/flight/:flightId` - Get reservations for a flight
- `POST /api/reservations` - Create a new reservation
- `PUT /api/reservations/:id/cancel` - Cancel a reservation
- `PUT /api/reservations/:id/check-in` - Check in for a reservation
