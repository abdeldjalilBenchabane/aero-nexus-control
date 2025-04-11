
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoints
const apiRouter = express.Router();

// Authentication
apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.getUserByCredentials(username, password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  // In a real app, we would generate a JWT token here
  return res.json({ 
    success: true, 
    user,
    token: 'mock-jwt-token'
  });
});

// Users
apiRouter.get('/users', (req, res) => {
  res.json(db.getUsers());
});

apiRouter.get('/users/:id', (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json(user);
});

apiRouter.post('/users', (req, res) => {
  const newUser = db.addUser(req.body);
  res.status(201).json(newUser);
});

apiRouter.put('/users/:id', (req, res) => {
  const updatedUser = db.updateUser(req.params.id, req.body);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json(updatedUser);
});

apiRouter.delete('/users/:id', (req, res) => {
  const success = db.deleteUser(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true });
});

// Flights
apiRouter.get('/flights', (req, res) => {
  res.json(db.getFlights());
});

apiRouter.get('/flights/:id', (req, res) => {
  const flight = db.getFlightById(req.params.id);
  if (!flight) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }
  res.json(flight);
});

apiRouter.get('/flights/airline/:airlineId', (req, res) => {
  res.json(db.getFlightsByAirline(req.params.airlineId));
});

apiRouter.post('/flights', (req, res) => {
  const newFlight = db.addFlight(req.body);
  res.status(201).json(newFlight);
});

apiRouter.put('/flights/:id', (req, res) => {
  const updatedFlight = db.updateFlight(req.params.id, req.body);
  if (!updatedFlight) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }
  res.json(updatedFlight);
});

apiRouter.delete('/flights/:id', (req, res) => {
  const success = db.deleteFlight(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }
  res.json({ success: true });
});

// Gates
apiRouter.get('/gates', (req, res) => {
  res.json(db.getGates());
});

apiRouter.get('/gates/available', (req, res) => {
  const { startTime, endTime } = req.query;
  res.json(db.getAvailableGates(startTime, endTime));
});

// Assign gate to flight
apiRouter.put('/flights/:id/gate', (req, res) => {
  const { gateId } = req.body;
  const flight = db.getFlightById(req.params.id);
  
  if (!flight) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }
  
  // Use the departure time for scheduling
  const departureTime = new Date(flight.departureTime);
  const oneHourBefore = new Date(departureTime);
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);
  
  const oneHourAfter = new Date(departureTime);
  oneHourAfter.setHours(oneHourAfter.getHours() + 1);
  
  const updatedFlight = db.assignGate(
    req.params.id, 
    gateId, 
    oneHourBefore.toISOString(), 
    oneHourAfter.toISOString()
  );
  
  if (!updatedFlight) {
    return res.status(400).json({ success: false, message: 'Failed to assign gate' });
  }
  
  res.json(updatedFlight);
});

// Runways
apiRouter.get('/runways', (req, res) => {
  res.json(db.getRunways());
});

apiRouter.get('/runways/available', (req, res) => {
  const { startTime, endTime } = req.query;
  res.json(db.getAvailableRunways(startTime, endTime));
});

// Assign runway to flight
apiRouter.put('/flights/:id/runway', (req, res) => {
  const { runwayId } = req.body;
  const flight = db.getFlightById(req.params.id);
  
  if (!flight) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }
  
  // Use the departure time for scheduling
  const departureTime = new Date(flight.departureTime);
  const thirtyMinutesBefore = new Date(departureTime);
  thirtyMinutesBefore.setMinutes(thirtyMinutesBefore.getMinutes() - 30);
  
  const thirtyMinutesAfter = new Date(departureTime);
  thirtyMinutesAfter.setMinutes(thirtyMinutesAfter.getMinutes() + 30);
  
  const updatedFlight = db.assignRunway(
    req.params.id, 
    runwayId, 
    thirtyMinutesBefore.toISOString(), 
    thirtyMinutesAfter.toISOString()
  );
  
  if (!updatedFlight) {
    return res.status(400).json({ success: false, message: 'Failed to assign runway' });
  }
  
  res.json(updatedFlight);
});

// Notifications
apiRouter.get('/notifications', (req, res) => {
  res.json(db.getNotifications());
});

apiRouter.get('/notifications/user/:userId', (req, res) => {
  res.json(db.getNotificationsForUser(req.params.userId));
});

apiRouter.post('/notifications', (req, res) => {
  const newNotification = db.addNotification(req.body);
  res.status(201).json(newNotification);
});

// Reservations
apiRouter.get('/reservations', (req, res) => {
  res.json(db.getReservations());
});

apiRouter.get('/reservations/user/:userId', (req, res) => {
  res.json(db.getReservationsByUser(req.params.userId));
});

apiRouter.get('/reservations/flight/:flightId', (req, res) => {
  res.json(db.getReservationsByFlight(req.params.flightId));
});

apiRouter.post('/reservations', (req, res) => {
  const result = db.addReservation(req.body);
  
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }
  
  res.status(201).json(result.reservation);
});

apiRouter.put('/reservations/:id/cancel', (req, res) => {
  const updatedReservation = db.updateReservationStatus(req.params.id, 'cancelled');
  
  if (!updatedReservation) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }
  
  res.json(updatedReservation);
});

apiRouter.put('/reservations/:id/check-in', (req, res) => {
  const updatedReservation = db.updateReservationStatus(req.params.id, 'checked-in');
  
  if (!updatedReservation) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }
  
  res.json(updatedReservation);
});

// Mount API routes
app.use('/api', apiRouter);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Create db directory if it doesn't exist
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
