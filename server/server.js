
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const result = await db.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.users.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.users.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await db.users.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await db.users.update(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.users.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.auth.login(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await db.auth.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Airlines API
app.get('/api/airlines', async (req, res) => {
  try {
    const airlines = await db.airlines.getAll();
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/airlines/:id', async (req, res) => {
  try {
    const airline = await db.airlines.getById(req.params.id);
    if (!airline) {
      return res.status(404).json({ error: 'Airline not found' });
    }
    res.json(airline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Airplanes API
app.get('/api/airplanes', async (req, res) => {
  try {
    const airplanes = await db.airplanes.getAll();
    res.json(airplanes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/airplanes/airline/:airlineId', async (req, res) => {
  try {
    const airplanes = await db.airplanes.getByAirline(req.params.airlineId);
    res.json(airplanes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add the missing endpoint for available airplanes
app.post('/api/airplanes/available', async (req, res) => {
  try {
    const { airline_id, departure_time, arrival_time } = req.body;
    const airplanes = await db.airplanes.getAvailable(airline_id, departure_time, arrival_time);
    res.json(airplanes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/airplanes', async (req, res) => {
  try {
    const airplane = await db.airplanes.create(req.body);
    res.status(201).json(airplane);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/airplanes/:id', async (req, res) => {
  try {
    await db.airplanes.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gates API
app.get('/api/gates', async (req, res) => {
  try {
    const gates = await db.gates.getAll();
    res.json(gates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gates/:id', async (req, res) => {
  try {
    const gate = await db.gates.getById(req.params.id);
    if (!gate) {
      return res.status(404).json({ error: 'Gate not found' });
    }
    res.json(gate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add the missing endpoint for available gates
app.post('/api/gates/available', async (req, res) => {
  try {
    const { departure_time, arrival_time } = req.body;
    const gates = await db.gates.getAvailable(departure_time, arrival_time);
    res.json(gates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gates', async (req, res) => {
  try {
    const gate = await db.gates.create(req.body);
    res.status(201).json(gate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/gates/:id', async (req, res) => {
  try {
    const gate = await db.gates.update(req.params.id, req.body);
    if (!gate) {
      return res.status(404).json({ error: 'Gate not found' });
    }
    res.json(gate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/gates/:id', async (req, res) => {
  try {
    await db.gates.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Runways API
app.get('/api/runways', async (req, res) => {
  try {
    const runways = await db.runways.getAll();
    res.json(runways);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/runways/:id', async (req, res) => {
  try {
    const runway = await db.runways.getById(req.params.id);
    if (!runway) {
      return res.status(404).json({ error: 'Runway not found' });
    }
    res.json(runway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add the missing endpoint for available runways
app.post('/api/runways/available', async (req, res) => {
  try {
    const { departure_time, arrival_time } = req.body;
    const runways = await db.runways.getAvailable(departure_time, arrival_time);
    res.json(runways);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/runways', async (req, res) => {
  try {
    const runway = await db.runways.create(req.body);
    res.status(201).json(runway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/runways/:id', async (req, res) => {
  try {
    const runway = await db.runways.update(req.params.id, req.body);
    if (!runway) {
      return res.status(404).json({ error: 'Runway not found' });
    }
    res.json(runway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/runways/:id', async (req, res) => {
  try {
    await db.runways.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flights API
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await db.flights.getAll();
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await db.flights.getById(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/flights/airline/:airlineId', async (req, res) => {
  try {
    const flights = await db.flights.getByAirline(req.params.airlineId);
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add the missing search endpoint for flights
app.post('/api/flights/search', async (req, res) => {
  try {
    const flights = await db.flights.search(req.body);
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/flights', async (req, res) => {
  try {
    const flight = await db.flights.create(req.body);
    res.status(201).json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flights/:id', async (req, res) => {
  try {
    const flight = await db.flights.update(req.params.id, req.body);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flights/:id/gate', async (req, res) => {
  try {
    const { gateId } = req.body;
    const flight = await db.flights.update(req.params.id, { gate_id: gateId });
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flights/:id/runway', async (req, res) => {
  try {
    const { runwayId } = req.body;
    const flight = await db.flights.update(req.params.id, { runway_id: runwayId });
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/flights/:id', async (req, res) => {
  try {
    await db.flights.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available seats for a flight
app.get('/api/flights/:flightId/available-seats', async (req, res) => {
  try {
    const seats = await db.seats.getAvailable(req.params.flightId);
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seats API
app.get('/api/flights/:flightId/seats', async (req, res) => {
  try {
    const seats = await db.seats.getByFlight(req.params.flightId);
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/flights/:flightId/seats/available', async (req, res) => {
  try {
    const seats = await db.seats.getAvailable(req.params.flightId);
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/flights/:flightId/seats/:seatNumber', async (req, res) => {
  try {
    const seat = await db.seats.getBySeatNumber(req.params.flightId, req.params.seatNumber);
    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    res.json(seat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reservations API
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await db.reservations.getAll();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations/:id', async (req, res) => {
  try {
    const reservation = await db.reservations.getById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations/user/:userId', async (req, res) => {
  try {
    const reservations = await db.reservations.getByUser(req.params.userId);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations/flight/:flightId', async (req, res) => {
  try {
    const reservations = await db.reservations.getByFlight(req.params.flightId);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const reservation = await db.reservations.create(req.body);
    res.status(201).json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reservations/:id/cancel', async (req, res) => {
  try {
    await db.reservations.cancel(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await db.notifications.getAll();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const user = await db.users.getById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notifications = await db.notifications.getForUser(req.params.userId, user.role);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notification = await db.notifications.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api`);
  
  // Test database connection on startup
  db.testConnection()
    .then(result => {
      if (result.success) {
        console.log('✅ ' + result.message);
      } else {
        console.error('❌ Database connection failed:', result.message);
      }
    })
    .catch(error => {
      console.error('❌ Database connection error:', error);
    });
});
