const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db/mysql');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
(async function() {
  const connected = await testConnection();
  console.log('Database connection test result:', connected ? 'CONNECTED' : 'FAILED TO CONNECT');
})();

// Add a test endpoint to check database connection
app.get('/api/test-db-connection', async (req, res) => {
  try {
    const connected = await testConnection();
    if (connected) {
      res.json({ success: true, message: 'Successfully connected to database' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to connect to database' });
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({ success: false, message: 'Error testing database connection', error: error.message });
  }
});

// API endpoints
const apiRouter = express.Router();

// Authentication
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Format user name properly
    const firstName = user.name ? user.name.split(' ')[0] : '';
    const lastName = user.name ? user.name.split(' ')[1] || '' : '';
    
    return res.json({ 
      success: true, 
      user: {
        id: user.id.toString(),
        username: user.email,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        role: user.role,
        airlineId: user.airline_id ? user.airline_id.toString() : undefined,
        created_at: user.created_at
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Users
apiRouter.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    
    const users = rows.map(user => {
      // Properly handle name splitting
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      return {
        id: user.id.toString(),
        username: user.email,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        role: user.role,
        airlineId: user.airline_id ? user.airline_id.toString() : undefined,
        password: user.password, // In a real app, we would never return passwords
        created_at: user.created_at ? new Date(user.created_at).toISOString() : null
      };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = rows[0];
    
    // Properly handle name splitting
    const nameParts = user.name ? user.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    res.json({
      id: user.id.toString(),
      username: user.email,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      role: user.role,
      airlineId: user.airline_id ? user.airline_id.toString() : undefined,
      password: user.password,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : null
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, airlineId } = req.body;
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    
    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    // Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, airline_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, airlineId || null]
    );
    
    // Get the created user with all fields
    const [newUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    
    if (newUserRows.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve created user' });
    }
    
    const newUser = newUserRows[0];
    
    res.status(201).json({
      id: newUser.id.toString(),
      username: email,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email,
      password: password,
      role: role,
      airlineId: airlineId ? airlineId.toString() : undefined,
      created_at: newUser.created_at ? new Date(newUser.created_at).toISOString() : null
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, airlineId } = req.body;
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    
    // Update user data
    const params = [name, email, password, role];
    let query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?';
    
    // Handle airline_id separately (it can be null)
    if (airlineId !== undefined) {
      query += ', airline_id = ?';
      params.push(airlineId === null ? null : airlineId);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get the updated user
    const [updatedUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (updatedUserRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found after update' });
    }
    
    const updatedUser = updatedUserRows[0];
    
    // Properly handle name splitting
    const nameParts = updatedUser.name ? updatedUser.name.split(' ') : ['', ''];
    const updatedFirstName = nameParts[0] || '';
    const updatedLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    res.json({
      id: updatedUser.id.toString(),
      username: updatedUser.email,
      firstName: updatedFirstName,
      lastName: updatedLastName,
      email: updatedUser.email,
      password: updatedUser.password,
      role: updatedUser.role,
      airlineId: updatedUser.airline_id ? updatedUser.airline_id.toString() : undefined,
      created_at: updatedUser.created_at ? new Date(updatedUser.created_at).toISOString() : null
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Gates
apiRouter.get('/gates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gates');
    
    const gates = rows.map(gate => ({
      id: gate.id.toString(),
      name: gate.name,
      gate_number: gate.name, // For backward compatibility
      terminal: gate.terminal || 'Main Terminal',
      isAvailable: true, // Default to true, will be updated based on flight schedules
      scheduledFlights: [], // Will be populated from flights table
      created_at: gate.created_at ? new Date(gate.created_at).toISOString() : null
    }));
    
    // Get scheduled flights for each gate
    for (const gate of gates) {
      const [flights] = await pool.query(`
        SELECT id, departure_time, arrival_time 
        FROM flights 
        WHERE gate_id = ?
      `, [gate.id]);
      
      if (flights.length > 0) {
        gate.isAvailable = false;
        gate.scheduledFlights = flights.map(flight => ({
          flightId: flight.id.toString(),
          from: flight.departure_time,
          to: flight.arrival_time
        }));
      }
    }
    
    res.json(gates);
  } catch (error) {
    console.error('Error fetching gates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/gates', async (req, res) => {
  try {
    const { name, terminal } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO gates (name, terminal) VALUES (?, ?)',
      [name, terminal]
    );
    
    const newGate = {
      id: result.insertId.toString(),
      name: name,
      gate_number: name, // For backward compatibility
      terminal: terminal || 'Main Terminal',
      isAvailable: true,
      scheduledFlights: [],
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newGate);
  } catch (error) {
    console.error('Error creating gate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/gates/:id', async (req, res) => {
  try {
    const { name, terminal } = req.body;
    
    const [result] = await pool.query(
      'UPDATE gates SET name = ?, terminal = ? WHERE id = ?',
      [name, terminal, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }
    
    const [updatedGate] = await pool.query('SELECT * FROM gates WHERE id = ?', [req.params.id]);
    
    if (updatedGate.length === 0) {
      return res.status(404).json({ success: false, message: 'Gate not found after update' });
    }
    
    const gate = updatedGate[0];
    
    res.json({
      id: gate.id.toString(),
      name: gate.name,
      gate_number: gate.name, // For backward compatibility
      terminal: gate.terminal || 'Main Terminal',
      isAvailable: true,
      scheduledFlights: [],
      created_at: gate.created_at ? new Date(gate.created_at).toISOString() : null
    });
  } catch (error) {
    console.error('Error updating gate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.delete('/gates/:id', async (req, res) => {
  try {
    // Check if gate is used in any flights
    const [flights] = await pool.query('SELECT id FROM flights WHERE gate_id = ?', [req.params.id]);
    
    if (flights.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete gate because it is assigned to flights' 
      });
    }
    
    const [result] = await pool.query('DELETE FROM gates WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting gate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Runways
apiRouter.get('/runways', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM runways');
    
    const runways = rows.map(runway => ({
      id: runway.id.toString(),
      name: runway.name,
      runway_number: runway.name, // For backward compatibility
      isAvailable: true, // Default to true, will be updated based on flight schedules
      scheduledUse: [], // Will be populated from flights table
      created_at: runway.created_at ? new Date(runway.created_at).toISOString() : null
    }));
    
    // Get scheduled flights for each runway
    for (const runway of runways) {
      const [flights] = await pool.query(`
        SELECT id, departure_time 
        FROM flights 
        WHERE runway_id = ?
      `, [runway.id]);
      
      if (flights.length > 0) {
        runway.isAvailable = false;
        runway.scheduledUse = flights.map(flight => {
          const departureTime = new Date(flight.departure_time);
          const thirtyMinutesBefore = new Date(departureTime);
          thirtyMinutesBefore.setMinutes(departureTime.getMinutes() - 30);
          
          const thirtyMinutesAfter = new Date(departureTime);
          thirtyMinutesAfter.setMinutes(departureTime.getMinutes() + 30);
          
          return {
            flightId: flight.id.toString(),
            from: thirtyMinutesBefore.toISOString(),
            to: thirtyMinutesAfter.toISOString()
          };
        });
      }
    }
    
    res.json(runways);
  } catch (error) {
    console.error('Error fetching runways:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/runways', async (req, res) => {
  try {
    const { name } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO runways (name) VALUES (?)',
      [name]
    );
    
    const newRunway = {
      id: result.insertId.toString(),
      name: name,
      runway_number: name, // For backward compatibility
      isAvailable: true,
      scheduledUse: [],
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newRunway);
  } catch (error) {
    console.error('Error creating runway:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/runways/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    const [result] = await pool.query(
      'UPDATE runways SET name = ? WHERE id = ?',
      [name, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Runway not found' });
    }
    
    const [updatedRunway] = await pool.query('SELECT * FROM runways WHERE id = ?', [req.params.id]);
    
    if (updatedRunway.length === 0) {
      return res.status(404).json({ success: false, message: 'Runway not found after update' });
    }
    
    const runway = updatedRunway[0];
    
    res.json({
      id: runway.id.toString(),
      name: runway.name,
      runway_number: runway.name, // For backward compatibility
      isAvailable: true,
      scheduledUse: [],
      created_at: runway.created_at ? new Date(runway.created_at).toISOString() : null
    });
  } catch (error) {
    console.error('Error updating runway:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.delete('/runways/:id', async (req, res) => {
  try {
    // Check if runway is used in any flights
    const [flights] = await pool.query('SELECT id FROM flights WHERE runway_id = ?', [req.params.id]);
    
    if (flights.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete runway because it is assigned to flights' 
      });
    }
    
    const [result] = await pool.query('DELETE FROM runways WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Runway not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting runway:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Airplanes
apiRouter.get('/airlines', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM airlines');
    
    const airlines = rows.map(airline => ({
      id: airline.id.toString(),
      name: airline.name,
      email: airline.email,
      created_at: airline.created_at ? new Date(airline.created_at).toISOString() : null
    }));
    
    res.json(airlines);
  } catch (error) {
    console.error('Error fetching airlines:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/airplanes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, al.name as airline_name 
      FROM airplanes a
      JOIN airlines al ON a.airline_id = al.id
    `);
    
    const airplanes = rows.map(airplane => ({
      id: airplane.id.toString(),
      name: airplane.name,
      airline_id: airplane.airline_id.toString(),
      airlineId: airplane.airline_id.toString(), // For backward compatibility
      airlineName: airplane.airline_name,
      capacity: airplane.capacity,
      created_at: airplane.created_at ? new Date(airplane.created_at).toISOString() : null
    }));
    
    res.json(airplanes);
  } catch (error) {
    console.error('Error fetching airplanes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/airplanes', async (req, res) => {
  try {
    const { name, airline_id, capacity } = req.body;
    
    // Verify airline exists
    const [airlines] = await pool.query('SELECT id FROM airlines WHERE id = ?', [airline_id]);
    
    if (airlines.length === 0) {
      return res.status(400).json({ success: false, message: 'Airline not found' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO airplanes (name, airline_id, capacity) VALUES (?, ?, ?)',
      [name, airline_id, capacity]
    );
    
    // Generate seats for this airplane
    const airplaneId = result.insertId;
    
    // Generate seats based on capacity
    const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seatsToCreate = [];
    
    let remainingCapacity = capacity;
    let rowIndex = 0;
    
    while (remainingCapacity > 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      const seatsInRow = Math.min(remainingCapacity, 6); // Max 6 seats per row
      
      for (let col = 1; col <= seatsInRow; col++) {
        seatsToCreate.push(`${row}${col}`);
      }
      
      remainingCapacity -= seatsInRow;
      rowIndex++;
    }
    
    // Insert seats into the database
    for (const seatNumber of seatsToCreate) {
      await pool.query(
        'INSERT INTO seats (airplane_id, seat_number, is_available) VALUES (?, ?, TRUE)',
        [airplaneId, seatNumber]
      );
    }
    
    // Get the created airplane with airline name
    const [airplaneRows] = await pool.query(`
      SELECT a.*, al.name as airline_name 
      FROM airplanes a
      JOIN airlines al ON a.airline_id = al.id
      WHERE a.id = ?
    `, [airplaneId]);
    
    if (airplaneRows.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve created airplane' });
    }
    
    const airplane = airplaneRows[0];
    
    const newAirplane = {
      id: airplane.id.toString(),
      name: airplane.name,
      airline_id: airplane.airline_id.toString(),
      airlineId: airplane.airline_id.toString(), // For backward compatibility
      airlineName: airplane.airline_name,
      capacity: airplane.capacity,
      created_at: airplane.created_at ? new Date(airplane.created_at).toISOString() : null
    };
    
    res.status(201).json(newAirplane);
  } catch (error) {
    console.error('Error creating airplane:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Flights
apiRouter.get('/flights', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, a.name as airline_name, g.name as gate_name, r.name as runway_name 
      FROM flights f 
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
    `);
    
    const flights = rows.map(flight => ({
      id: flight.id.toString(),
      flight_number: flight.flight_number,
      flightNumber: flight.flight_number, // For backward compatibility
      airline_id: flight.airline_id.toString(),
      airline: flight.airline_id.toString(), // For backward compatibility
      airline_name: flight.airline_name,
      airlineName: flight.airline_name, // For backward compatibility
      airplane_id: flight.airplane_id ? flight.airplane_id.toString() : null,
      gate_id: flight.gate_id ? flight.gate_id.toString() : null,
      gate: flight.gate_name,
      gate_number: flight.gate_name,
      runway_id: flight.runway_id ? flight.runway_id.toString() : null,
      runway: flight.runway_name,
      runway_number: flight.runway_name,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time ? new Date(flight.departure_time).toISOString() : null,
      departureTime: flight.departure_time ? new Date(flight.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null,
      arrivalTime: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null, // For backward compatibility
      status: flight.status,
      price: flight.price,
      created_at: flight.created_at ? new Date(flight.created_at).toISOString() : null,
      availableSeats: [], // Will be populated later
      bookedSeats: [] // Will be populated later
    }));
    
    // Get available seats for each flight
    for (const flight of flights) {
      if (flight.airplane_id) {
        const [seats] = await pool.query(`
          SELECT s.* FROM seats s
          WHERE s.airplane_id = ? AND s.is_available = 1
        `, [flight.airplane_id]);
        
        flight.availableSeats = seats.map(seat => seat.seat_number);
        
        const [bookedSeats] = await pool.query(`
          SELECT r.seat_number, r.user_id as passengerId 
          FROM reservations r
          WHERE r.flight_id = ? AND r.status = 'confirmed'
        `, [flight.id]);
        
        flight.bookedSeats = bookedSeats.map(seat => ({
          seatId: seat.seat_number,
          passengerId: seat.passengerId.toString()
        }));
      }
    }
    
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/flights/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, a.name as airline_name, g.name as gate_name, r.name as runway_name 
      FROM flights f
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    const flight = rows[0];
    
    const [seats] = await pool.query(`
      SELECT s.* FROM seats s
      WHERE s.airplane_id = ? AND s.is_available = 1
    `, [flight.airplane_id]);
    
    const [bookedSeats] = await pool.query(`
      SELECT r.seat_number, r.user_id as passengerId 
      FROM reservations r
      WHERE r.flight_id = ? AND r.status = 'confirmed'
    `, [req.params.id]);
    
    const flightObj = {
      id: flight.id.toString(),
      flight_number: flight.flight_number,
      flightNumber: flight.flight_number, // For backward compatibility
      airline_id: flight.airline_id.toString(),
      airline: flight.airline_id.toString(), // For backward compatibility
      airline_name: flight.airline_name,
      airlineName: flight.airline_name, // For backward compatibility
      airplane_id: flight.airplane_id ? flight.airplane_id.toString() : null,
      gate_id: flight.gate_id ? flight.gate_id.toString() : null,
      gate: flight.gate_name,
      gate_number: flight.gate_name,
      runway_id: flight.runway_id ? flight.runway_id.toString() : null,
      runway: flight.runway_name,
      runway_number: flight.runway_name,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time ? new Date(flight.departure_time).toISOString() : null,
      departureTime: flight.departure_time ? new Date(flight.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null,
      arrivalTime: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null, // For backward compatibility
      status: flight.status,
      price: flight.price,
      created_at: flight.created_at ? new Date(flight.created_at).toISOString() : null,
      availableSeats: seats.map(seat => seat.seat_number),
      bookedSeats: bookedSeats.map(seat => ({
        seatId: seat.seat_number,
        passengerId: seat.passengerId.toString()
      }))
    };
    
    res.json(flightObj);
  } catch (error) {
    console.error('Error fetching flight:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/flights/airline/:airlineId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, a.name as airline_name, g.name as gate_name, r.name as runway_name 
      FROM flights f
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.airline_id = ?
    `, [req.params.airlineId]);
    
    const flights = await Promise.all(rows.map(async (flight) => {
      const [seats] = await pool.query(`
        SELECT s.* FROM seats s
        WHERE s.airplane_id = ? AND s.is_available = 1
      `, [flight.airplane_id]);
      
      const [bookedSeats] = await pool.query(`
        SELECT r.seat_number, r.user_id as passengerId 
        FROM reservations r
        WHERE r.flight_id = ? AND r.status = 'confirmed'
      `, [flight.id]);
      
      return {
        id: flight.id.toString(),
        flight_number: flight.flight_number,
        flightNumber: flight.flight_number, // For backward compatibility
        airline_id: flight.airline_id.toString(),
        airline: flight.airline_id.toString(), // For backward compatibility
        airline_name: flight.airline_name,
        airlineName: flight.airline_name, // For backward compatibility
        airplane_id: flight.airplane_id ? flight.airplane_id.toString() : null,
        gate_id: flight.gate_id ? flight.gate_id.toString() : null,
        gate: flight.gate_name,
        gate_number: flight.gate_name,
        runway_id: flight.runway_id ? flight.runway_id.toString() : null,
        runway: flight.runway_name,
        runway_number: flight.runway_name,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time ? new Date(flight.departure_time).toISOString() : null,
        departureTime: flight.departure_time ? new Date(flight.departure_time).toISOString() : null, // For backward compatibility
        arrival_time: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null,
        arrivalTime: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null, // For backward compatibility
        status: flight.status,
        price: flight.price,
        created_at: flight.created_at ? new Date(flight.created_at).toISOString() : null,
        availableSeats: seats.map(seat => seat.seat_number),
        bookedSeats: bookedSeats.map(seat => ({
          seatId: seat.seat_number,
          passengerId: seat.passengerId.toString()
        }))
      };
    }));
    
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights by airline:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/flights', async (req, res) => {
  try {
    // Check user role (should be staff or airline)
    const { role } = req.body.user || {};
    if (role !== 'staff' && role !== 'airline') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only staff and airline can create flights' });
    }
    
    const { 
      flightNumber, airline, origin, destination, 
      departureTime, arrivalTime, status, gate, runway, price, airplaneId 
    } = req.body;
    
    // Check if flight number is unique
    const [existingFlights] = await pool.query(
      'SELECT * FROM flights WHERE flight_number = ?',
      [flightNumber]
    );
    
    if (existingFlights.length > 0) {
      return res.status(400).json({ success: false, message: 'Flight number already exists' });
    }
    
    // Check if gate is available
    if (gate) {
      const [gateRow] = await pool.query('SELECT id FROM gates WHERE name = ?', [gate]);
      if (gateRow.length === 0) {
        return res.status(400).json({ success: false, message: 'Gate not found' });
      }
      
      const gateId = gateRow[0].id;
      
      const [gateConflicts] = await pool.query(`
        SELECT * FROM flights 
        WHERE gate_id = ? AND 
        ((departure_time <= ? AND arrival_time >= ?) OR 
         (departure_time <= ? AND arrival_time >= ?) OR
         (departure_time >= ? AND arrival_time <= ?))
      `, [gateId, departureTime, departureTime, arrivalTime, arrivalTime, departureTime, arrivalTime]);
      
      if (gateConflicts.length > 0) {
        return res.status(400).json({ success: false, message: 'Gate is not available during this time' });
      }
    }
    
    // Check if runway is available
    if (runway) {
      const [runwayRow] = await pool.query('SELECT id FROM runways WHERE name = ?', [runway]);
      if (runwayRow.length === 0) {
        return res.status(400).json({ success: false, message: 'Runway not found' });
      }
      
      const runwayId = runwayRow[0].id;
      
      const [runwayConflicts] = await pool.query(`
        SELECT * FROM flights 
        WHERE runway_id = ? AND 
        ((departure_time <= ? AND departure_time >= DATE_SUB(?, INTERVAL 30 MINUTE)) OR 
         (departure_time <= DATE_ADD(?, INTERVAL 30 MINUTE) AND departure_time >= ?))
      `, [runwayId, departureTime, departureTime, departureTime, departureTime]);
      
      if (runwayConflicts.length > 0) {
        return res.status(400).json({ success: false, message: 'Runway is not available during this time' });
      }
    }
    
    // Get gate_id and runway_id
    let gateId = null;
    let runwayId = null;
    
    if (gate) {
      const [gateRow] = await pool.query('SELECT id FROM gates WHERE name = ?', [gate]);
      if (gateRow.length > 0) {
        gateId = gateRow[0].id;
      }
    }
    
    if (runway) {
      const [runwayRow] = await pool.query('SELECT id FROM runways WHERE name = ?', [runway]);
      if (runwayRow.length > 0) {
        runwayId = runwayRow[0].id;
      }
    }
    
    // Insert flight
    const [result] = await pool.query(`
      INSERT INTO flights (
        flight_number, airline_id, origin, destination, 
        departure_time, arrival_time, status, gate_id, runway_id, price, airplane_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      flightNumber, airline, origin, destination,
      departureTime, arrivalTime, status, gateId, runwayId, price, airplaneId
    ]);
    
    const newFlight = {
      id: result.insertId.toString(),
      flightNumber,
      airline,
      origin,
      destination,
      departureTime,
      arrivalTime,
      status,
      gate,
      runway,
      price,
      availableSeats: [],
      bookedSeats: []
    };
    
    res.status(201).json(newFlight);
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/flights/:id', async (req, res) => {
  try {
    const { 
      flightNumber, airline, origin, destination, 
      departureTime, arrivalTime, status, gate, runway, price, airplaneId 
    } = req.body;
    
    // Get gate_id and runway_id
    let gateId = null;
    let runwayId = null;
    
    if (gate) {
      const [gateRow] = await pool.query('SELECT id FROM gates WHERE name = ?', [gate]);
      if (gateRow.length > 0) {
        gateId = gateRow[0].id;
      }
    }
    
    if (runway) {
      const [runwayRow] = await pool.query('SELECT id FROM runways WHERE name = ?', [runway]);
      if (runwayRow.length > 0) {
        runwayId = runwayRow[0].id;
      }
    }
    
    // Update flight
    const [result] = await pool.query(`
      UPDATE flights SET
        flight_number = ?, airline_id = ?, origin = ?, destination = ?,
        departure_time = ?, arrival_time = ?, status = ?, gate_id = ?, runway_id = ?, price = ?, airplane_id = ?
      WHERE id = ?
    `, [
      flightNumber, airline, origin, destination,
      departureTime, arrivalTime, status, gateId, runwayId, price, airplaneId,
      req.params.id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    // If flight status changed to cancelled, notify passengers
    if (status === 'cancelled') {
      // Get all passengers who have reservations for this flight
      const [reservations] = await pool.query(
        'SELECT user_id FROM reservations WHERE flight_id = ?',
        [req.params.id]
      );
      
      if (reservations.length > 0) {
        // Create notification for the flight cancellation
        const [notificationResult] = await pool.query(`
          INSERT INTO notifications (title, message, flight_id, created_at)
          VALUES (?, ?, ?, NOW())
        `, [
          'Flight Cancelled',
          `Flight ${flightNumber} has been cancelled. Please contact customer service for assistance.`,
          req.params.id
        ]);
        
        const notificationId = notificationResult.insertId;
        
        // Add notification for each passenger
        const userNotifications = reservations.map(reservation => [
          reservation.user_id,
          notificationId
        ]);
        
        if (userNotifications.length > 0) {
          await pool.query(`
            INSERT INTO user_notifications (user_id, notification_id)
            VALUES ?
          `, [userNotifications]);
        }
      }
    }
    
    // Get updated flight
    const [rows] = await pool.query(`
      SELECT f.*, a.name as airline_name, g.name as gate_name, r.name as runway_name 
      FROM flights f
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    const flight = rows[0];
    
    const [seats] = await pool.query(`
      SELECT s.* FROM seats s
      WHERE s.airplane_id = ? AND s.is_available = 1
    `, [flight.airplane_id]);
    
    const [bookedSeats] = await pool.query(`
      SELECT r.seat_number, r.user_id as passengerId 
      FROM reservations r
      WHERE r.flight_id = ? AND r.status = 'confirmed'
    `, [req.params.id]);
    
    const updatedFlight = {
      id: flight.id.toString(),
      flight_number: flight.flight_number,
      flightNumber: flight.flight_number, // For backward compatibility
      airline_id: flight.airline_id.toString(),
      airline: flight.airline_id.toString(), // For backward compatibility
      airline_name: flight.airline_name,
      airlineName: flight.airline_name, // For backward compatibility
      airplane_id: flight.airplane_id ? flight.airplane_id.toString() : null,
      gate_id: flight.gate_id ? flight.gate_id.toString() : null,
      gate: flight.gate_name,
      gate_number: flight.gate_name,
      runway_id: flight.runway_id ? flight.runway_id.toString() : null,
      runway: flight.runway_name,
      runway_number: flight.runway_name,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time ? new Date(flight.departure_time).toISOString() : null,
      departureTime: flight.departure_time ? new Date(flight.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null,
      arrivalTime: flight.arrival_time ? new Date(flight.arrival_time).toISOString() : null, // For backward compatibility
      status: flight.status,
      price: flight.price,
      created_at: flight.created_at ? new Date(flight.created_at).toISOString() : null,
      availableSeats: seats.map(seat => seat.seat_number),
      bookedSeats: bookedSeats.map(seat => ({
        seatId: seat.seat_number,
        passengerId: seat.passengerId.toString()
      }))
    };
    
    res.json(updatedFlight);
  } catch (error) {
    console.error('Error updating flight:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.delete('/flights/:id', async (req, res) => {
  try {
    // Get flight details before deletion
    const [flightRows] = await pool.query(
      'SELECT flight_number FROM flights WHERE id = ?',
      [req.params.id]
    );
    
    if (flightRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    const flightNumber = flightRows[0].flight_number;
    
    // Get all passengers who have reservations for this flight
    const [reservations] = await pool.query(
      'SELECT user_id FROM reservations WHERE flight_id = ?',
      [req.params.id]
    );
    
    // Delete all reservations for this flight
    await pool.query('DELETE FROM reservations WHERE flight_id = ?', [req.params.id]);
    
    // Delete the flight
    const [result] = await pool.query('DELETE FROM flights WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    // Notify passengers about the flight cancellation
    if (reservations.length > 0) {
      // Create notification for the flight cancellation
      const [notificationResult] = await pool.query(`
        INSERT INTO notifications (title, message, created_at)
        VALUES (?, ?, NOW())
      `, [
        'Flight Deleted',
        `Flight ${flightNumber} has been removed from the schedule. Please contact customer service for assistance.`,
      ]);
      
      const notificationId = notificationResult.insertId;
      
      // Add notification for each passenger
      const userNotifications = reservations.map(reservation => [
        reservation.user_id,
        notificationId
      ]);
      
      if (userNotifications.length > 0) {
        await pool.query(`
          INSERT INTO user_notifications (user_id, notification_id)
          VALUES ?
        `, [userNotifications]);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting flight:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Gates
apiRouter.get('/gates/available', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'startTime and endTime are required' });
    }
    
    // Get all gates
    const [allGates] = await pool.query('SELECT * FROM gates');
    
    // Find gates with conflicting schedules
    const [conflicts] = await pool.query(`
      SELECT DISTINCT g.id 
      FROM gates g
      JOIN flights f ON g.id = f.gate_id
      WHERE 
        (f.departure_time <= ? AND f.arrival_time >= ?) OR 
        (f.departure_time <= ? AND f.arrival_time >= ?) OR
        (f.departure_time >= ? AND f.arrival_time <= ?)
    `, [startTime, startTime, endTime, endTime, startTime, endTime]);
    
    const conflictingGateIds = conflicts.map(c => c.id);
    
    // Filter available gates
    const availableGates = allGates
      .filter(gate => !conflictingGateIds.includes(gate.id))
      .map(gate => ({
        id: gate.id.toString(),
        name: gate.name,
        gate_number: gate.name, // For backward compatibility
        terminal: gate.terminal || 'Main Terminal',
        isAvailable: true,
        scheduledFlights: [],
        created_at: gate.created_at ? new Date(gate.created_at).toISOString() : null
      }));
    
    res.json(availableGates);
  } catch (error) {
    console.error('Error fetching available gates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Assign gate to flight
apiRouter.put('/flights/:id/gate', async (req, res) => {
  try {
    const { gateId } = req.body;
    
    // Get flight details
    const [flights] = await pool.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (flights.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    const flight = flights[0];
    
    // Use the departure time for scheduling
    const departureTime = new Date(flight.departure_time);
    const oneHourBefore = new Date(departureTime);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    
    const oneHourAfter = new Date(departureTime);
    oneHourAfter.setHours(oneHourAfter.getHours() + 1);
    
    // Check if gate is available
    const [conflicts] = await pool.query(`
      SELECT * FROM flights 
      WHERE gate_id = ? AND id != ? AND 
      ((departure_time <= ? AND arrival_time >= ?) OR 
       (departure_time <= ? AND arrival_time >= ?) OR
       (departure_time >= ? AND arrival_time <= ?))
    `, [
      gateId, req.params.id,
      oneHourBefore.toISOString(), oneHourBefore.toISOString(),
      oneHourAfter.toISOString(), oneHourAfter.toISOString(),
      oneHourBefore.toISOString(), oneHourAfter.toISOString()
    ]);
    
    if (conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Gate is not available during this time' });
    }
    
    // Update flight with gate
    const [result] = await pool.query(
      'UPDATE flights SET gate_id = ? WHERE id = ?',
      [gateId, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Failed to assign gate' });
    }
    
    // Get updated flight details
    const [updatedFlights] = await pool.query(`
      SELECT f.*, g.name as gate_name
      FROM flights f
      LEFT JOIN gates g ON f.gate_id = g.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    const updatedFlight = updatedFlights[0];
    
    res.json({
      id: updatedFlight.id.toString(),
      flight_number: updatedFlight.flight_number,
      flightNumber: updatedFlight.flight_number, // For backward compatibility
      airline_id: updatedFlight.airline_id.toString(),
      airline: updatedFlight.airline_id.toString(), // For backward compatibility
      origin: updatedFlight.origin,
      destination: updatedFlight.destination,
      departure_time: updatedFlight.departure_time ? new Date(updatedFlight.departure_time).toISOString() : null,
      departureTime: updatedFlight.departure_time ? new Date(updatedFlight.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: updatedFlight.arrival_time ? new Date(updatedFlight.arrival_time).toISOString() : null,
      arrivalTime: updatedFlight.arrival_time ? new Date(updatedFlight.arrival_time).toISOString() : null, // For backward compatibility
      status: updatedFlight.status,
      gate: updatedFlight.gate_name,
      gate_number: updatedFlight.gate_name
    });
  } catch (error) {
    console.error('Error assigning gate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Runways
apiRouter.get('/runways/available', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'startTime and endTime are required' });
    }
    
    // Get all runways
    const [allRunways] = await pool.query('SELECT * FROM runways');
    
    // Find runways with conflicting schedules (within 30 minutes of departure)
    const [conflicts] = await pool.query(`
      SELECT DISTINCT r.id 
      FROM runways r
      JOIN flights f ON r.id = f.runway_id
      WHERE 
        (f.departure_time BETWEEN DATE_SUB(?, INTERVAL 30 MINUTE) AND DATE_ADD(?, INTERVAL 30 MINUTE)) OR
        (? BETWEEN DATE_SUB(f.departure_time, INTERVAL 30 MINUTE) AND DATE_ADD(f.departure_time, INTERVAL 30 MINUTE))
    `, [startTime, startTime, startTime]);
    
    const conflictingRunwayIds = conflicts.map(c => c.id);
    
    // Filter available runways
    const availableRunways = allRunways
      .filter(runway => !conflictingRunwayIds.includes(runway.id))
      .map(runway => ({
        id: runway.id.toString(),
        name: runway.name,
        runway_number: runway.name, // For backward compatibility
        isAvailable: true,
        scheduledUse: [],
        created_at: runway.created_at ? new Date(runway.created_at).toISOString() : null
      }));
    
    res.json(availableRunways);
  } catch (error) {
    console.error('Error fetching available runways:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Assign runway to flight
apiRouter.put('/flights/:id/runway', async (req, res) => {
  try {
    const { runwayId } = req.body;
    
    // Get flight details
    const [flights] = await pool.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (flights.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    
    const flight = flights[0];
    
    // Use the departure time for scheduling
    const departureTime = new Date(flight.departure_time);
    const thirtyMinutesBefore = new Date(departureTime);
    thirtyMinutesBefore.setMinutes(thirtyMinutesBefore.getMinutes() - 30);
    
    const thirtyMinutesAfter = new Date(departureTime);
    thirtyMinutesAfter.setMinutes(thirtyMinutesAfter.getMinutes() + 30);
    
    // Check if runway is available
    const [conflicts] = await pool.query(`
      SELECT * FROM flights 
      WHERE runway_id = ? AND id != ? AND 
      ((departure_time BETWEEN ? AND ?) OR
       (? BETWEEN DATE_SUB(departure_time, INTERVAL 30 MINUTE) AND DATE_ADD(departure_time, INTERVAL 30 MINUTE)))
    `, [
      runwayId, req.params.id,
      thirtyMinutesBefore.toISOString(), thirtyMinutesAfter.toISOString(),
      departureTime.toISOString()
    ]);
    
    if (conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Runway is not available during this time' });
    }
    
    // Update flight with runway
    const [result] = await pool.query(
      'UPDATE flights SET runway_id = ? WHERE id = ?',
      [runwayId, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Failed to assign runway' });
    }
    
    // Get updated flight details
    const [updatedFlights] = await pool.query(`
      SELECT f.*, r.name as runway_name
      FROM flights f
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    const updatedFlight = updatedFlights[0];
    
    res.json({
      id: updatedFlight.id.toString(),
      flight_number: updatedFlight.flight_number,
      flightNumber: updatedFlight.flight_number, // For backward compatibility
      airline_id: updatedFlight.airline_id.toString(),
      airline: updatedFlight.airline_id.toString(), // For backward compatibility
      origin: updatedFlight.origin,
      destination: updatedFlight.destination,
      departure_time: updatedFlight.departure_time ? new Date(updatedFlight.departure_time).toISOString() : null,
      departureTime: updatedFlight.departure_time ? new Date(updatedFlight.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: updatedFlight.arrival_time ? new Date(updatedFlight.arrival_time).toISOString() : null,
      arrivalTime: updatedFlight.arrival_time ? new Date(updatedFlight.arrival_time).toISOString() : null, // For backward compatibility
      status: updatedFlight.status,
      runway: updatedFlight.runway_name,
      runway_number: updatedFlight.runway_name
    });
  } catch (error) {
    console.error('Error assigning runway:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Notifications
apiRouter.get('/notifications', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT n.*, f.flight_number
      FROM notifications n
      LEFT JOIN flights f ON n.flight_id = f.id
      ORDER BY n.created_at DESC
    `);
    
    const notifications = rows.map(notif => ({
      id: notif.id.toString(),
      message: notif.message,
      title: notif.title,
      timestamp: notif.created_at,
      created_at: notif.created_at,
      sender: {
        id: notif.user_id ? notif.user_id.toString() : "1",
        role: notif.user_role || "admin"
      },
      targetType: notif.target_role ? "role" : (notif.flight_id ? "flight" : "all"),
      targetId: notif.target_role || (notif.flight_id ? notif.flight_id.toString() : undefined),
      flightId: notif.flight_id ? notif.flight_id.toString() : undefined,
      flightNumber: notif.flight_number,
      senderRole: notif.user_role || "admin",
      user_id: notif.user_id ? notif.user_id.toString() : undefined,
      user_role: notif.user_role,
      target_role: notif.target_role,
      flight_id: notif.flight_id ? notif.flight_id.toString() : undefined
    }));
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/notifications/user/:userId', async (req, res) => {
  try {
    // Get user role
    const [userRows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.params.userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userRole = userRows[0].role;
    
    // Get user's flight IDs if passenger
    let userFlightIds = [];
    if (userRole === 'passenger') {
      const [reservations] = await pool.query(
        'SELECT DISTINCT flight_id FROM reservations WHERE user_id = ?',
        [req.params.userId]
      );
      userFlightIds = reservations.map(r => r.flight_id);
    }
    
    // Get notifications for this user based on role and flights
    const [userNotifications] = await pool.query(`
      SELECT DISTINCT n.*, f.flight_number
      FROM notifications n
      LEFT JOIN flights f ON n.flight_id = f.id
      LEFT JOIN user_notifications un ON n.id = un.notification_id
      WHERE 
        un.user_id = ? OR
        n.target_role IS NULL OR
        n.target_role = ?
        ${userRole === 'passenger' && userFlightIds.length > 0 
          ? 'OR n.flight_id IN (?)' 
          : ''}
      ORDER BY n.created_at DESC
    `, [
      req.params.userId, 
      userRole,
      ...(userRole === 'passenger' && userFlightIds.length > 0 ? [userFlightIds] : [])
    ]);
    
    const notifications = userNotifications.map(notif => ({
      id: notif.id.toString(),
      message: notif.message,
      title: notif.title,
      timestamp: notif.created_at,
      created_at: notif.created_at,
      sender: {
        id: notif.user_id ? notif.user_id.toString() : "1",
        role: notif.user_role || "admin"
      },
      targetType: notif.target_role ? "role" : (notif.flight_id ? "flight" : "all"),
      targetId: notif.target_role || (notif.flight_id ? notif.flight_id.toString() : undefined),
      flightId: notif.flight_id ? notif.flight_id.toString() : undefined,
      flightNumber: notif.flight_number,
      senderRole: notif.user_role || "admin",
      user_id: notif.user_id ? notif.user_id.toString() : undefined,
      user_role: notif.user_role,
      target_role: notif.target_role,
      flight_id: notif.flight_id ? notif.flight_id.toString() : undefined
    }));
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/notifications', async (req, res) => {
  try {
    const { 
      message,
      title,
      sender,
      targetType,
      targetId,
      flightId
    } = req.body;
    
    // Check if sender role is allowed to send notifications
    if (!sender || !['admin', 'staff', 'airline'].includes(sender.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Only admin, staff, and airline roles can send notifications' 
      });
    }
    
    // Insert notification
    const [result] = await pool.query(`
      INSERT INTO notifications (
        title, message, user_id, user_role, 
        target_role, flight_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      title,
      message,
      sender.id,
      sender.role,
      targetType === 'role' ? targetId : null,
      targetType === 'flight' || flightId ? (flightId || targetId) : null
    ]);
    
    const notificationId = result.insertId;
    
    // If targeting specific flight, add notifications for all passengers with reservations
    if (targetType === 'flight' || flightId) {
      const targetFlightId = flightId || targetId;
      
      // Get all passengers with reservations for this flight
      const [reservations] = await pool.query(
        'SELECT DISTINCT user_id FROM reservations WHERE flight_id = ?',
        [targetFlightId]
      );
      
      if (reservations.length > 0) {
        // Add notification for each passenger
        const userNotifications = reservations.map(reservation => [
          reservation.user_id,
          notificationId
        ]);
        
        await pool.query(`
          INSERT INTO user_notifications (user_id, notification_id)
          VALUES ?
        `, [userNotifications]);
      }
    }
    
    // If targeting specific role, add notifications for all users with that role
    if (targetType === 'role') {
      const [users] = await pool.query(
        'SELECT id FROM users WHERE role = ?',
        [targetId]
      );
      
      if (users.length > 0) {
        // Add notification for each user with the target role
        const userNotifications = users.map(user => [
          user.id,
          notificationId
        ]);
        
        await pool.query(`
          INSERT INTO user_notifications (user_id, notification_id)
          VALUES ?
        `, [userNotifications]);
      }
    }
    
    // Get the created notification
    const [notifications] = await pool.query(`
      SELECT n.*, f.flight_number
      FROM notifications n
      LEFT JOIN flights f ON n.flight_id = f.id
      WHERE n.id = ?
    `, [notificationId]);
    
    if (notifications.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve created notification' });
    }
    
    const notification = notifications[0];
    
    const newNotification = {
      id: notification.id.toString(),
      message: notification.message,
      title: notification.title,
      timestamp: notification.created_at,
      created_at: notification.created_at,
      sender: {
        id: notification.user_id ? notification.user_id.toString() : "1",
        role: notification.user_role || "admin"
      },
      targetType: notification.target_role ? "role" : (notification.flight_id ? "flight" : "all"),
      targetId: notification.target_role || (notification.flight_id ? notification.flight_id.toString() : undefined),
      flightId: notification.flight_id ? notification.flight_id.toString() : undefined,
      flightNumber: notification.flight_number,
      senderRole: notification.user_role || "admin",
      user_id: notification.user_id ? notification.user_id.toString() : undefined,
      user_role: notification.user_role,
      target_role: notification.target_role,
      flight_id: notification.flight_id ? notification.flight_id.toString() : undefined
    };
    
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/notifications/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    
    // Check if this user-notification pair exists
    const [rows] = await pool.query(
      'SELECT * FROM user_notifications WHERE user_id = ? AND notification_id = ?',
      [userId, req.params.id]
    );
    
    if (rows.length === 0) {
      // Insert if it doesn't exist
      await pool.query(
        'INSERT INTO user_notifications (user_id, notification_id, is_read) VALUES (?, ?, 1)',
        [userId, req.params.id]
      );
    } else {
      // Update if it exists
      await pool.query(
        'UPDATE user_notifications SET is_read = 1 WHERE user_id = ? AND notification_id = ?',
        [userId, req.params.id]
      );
    }
    
    // Get the notification
    const [notifications] = await pool.query(`
      SELECT n.*, f.flight_number
      FROM notifications n
      LEFT JOIN flights f ON n.flight_id = f.id
      WHERE n.id = ?
    `, [req.params.id]);
    
    if (notifications.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    const notification = notifications[0];
    
    res.json({
      id: notification.id.toString(),
      message: notification.message,
      title: notification.title,
      timestamp: notification.created_at,
      created_at: notification.created_at,
      sender: {
        id: notification.user_id ? notification.user_id.toString() : "1",
        role: notification.user_role || "admin"
      },
      targetType: notification.target_role ? "role" : (notification.flight_id ? "flight" : "all"),
      targetId: notification.target_role || (notification.flight_id ? notification.flight_id.toString() : undefined),
      flightId: notification.flight_id ? notification.flight_id.toString() : undefined,
      flightNumber: notification.flight_number,
      senderRole: notification.user_role || "admin",
      user_id: notification.user_id ? notification.user_id.toString() : undefined,
      user_role: notification.user_role,
      target_role: notification.target_role,
      flight_id: notification.flight_id ? notification.flight_id.toString() : undefined,
      isRead: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reservations
apiRouter.get('/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, f.arrival_time, u.name as user_name
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    
    const reservations = rows.map(reservation => ({
      id: reservation.id.toString(),
      flight_id: reservation.flight_id.toString(),
      flightId: reservation.flight_id.toString(), // For backward compatibility
      user_id: reservation.user_id.toString(),
      userId: reservation.user_id.toString(), // For backward compatibility
      passengerId: reservation.user_id.toString(),
      seat_number: reservation.seat_number,
      seat: reservation.seat_number, // For backward compatibility
      seatId: reservation.seat_number, // For backward compatibility
      status: reservation.status,
      created_at: reservation.created_at ? new Date(reservation.created_at).toISOString() : null,
      timestamp: reservation.created_at ? new Date(reservation.created_at).toISOString() : null, // For backward compatibility
      flight_number: reservation.flight_number,
      flightNumber: reservation.flight_number, // For backward compatibility
      origin: reservation.origin,
      destination: reservation.destination,
      departure_time: reservation.departure_time ? new Date(reservation.departure_time).toISOString() : null,
      departureTime: reservation.departure_time ? new Date(reservation.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: reservation.arrival_time ? new Date(reservation.arrival_time).toISOString() : null,
      arrivalTime: reservation.arrival_time ? new Date(reservation.arrival_time).toISOString() : null, // For backward compatibility
      passengerName: reservation.user_name
    }));
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/reservations/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, f.arrival_time, f.status as flight_status
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.userId]);
    
    const reservations = rows.map(reservation => ({
      id: reservation.id.toString(),
      flight_id: reservation.flight_id.toString(),
      flightId: reservation.flight_id.toString(), // For backward compatibility
      user_id: reservation.user_id.toString(),
      userId: reservation.user_id.toString(), // For backward compatibility
      passengerId: reservation.user_id.toString(),
      seat_number: reservation.seat_number,
      seat: reservation.seat_number, // For backward compatibility
      seatId: reservation.seat_number, // For backward compatibility
      status: reservation.status,
      created_at: reservation.created_at ? new Date(reservation.created_at).toISOString() : null,
      timestamp: reservation.created_at ? new Date(reservation.created_at).toISOString() : null, // For backward compatibility
      flight_number: reservation.flight_number,
      flightNumber: reservation.flight_number, // For backward compatibility
      origin: reservation.origin,
      destination: reservation.destination,
      departure_time: reservation.departure_time ? new Date(reservation.departure_time).toISOString() : null,
      departureTime: reservation.departure_time ? new Date(reservation.departure_time).toISOString() : null, // For backward compatibility
      arrival_time: reservation.arrival_time ? new Date(reservation.arrival_time).toISOString() : null,
      arrivalTime: reservation.arrival_time ? new Date(reservation.arrival_time).toISOString() : null, // For backward compatibility
      flightStatus: reservation.flight_status
    }));
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.get('/reservations/flight/:flightId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.flight_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.flightId]);
    
    const reservations = rows.map(reservation => ({
      id: reservation.id.toString(),
      flight_id: reservation.flight_id.toString(),
      flightId: reservation.flight_id.toString(), // For backward compatibility
      user_id: reservation.user_id.toString(),
      userId: reservation.user_id.toString(), // For backward compatibility
      passengerId: reservation.user_id.toString(),
      seat_number: reservation.seat_number,
      seat: reservation.seat_number, // For backward compatibility
      seatId: reservation.seat_number, // For backward compatibility
      status: reservation.status,
      created_at: reservation.created_at ? new Date(reservation.created_at).toISOString() : null,
      timestamp: reservation.created_at ? new Date(reservation.created_at).toISOString() : null, // For backward compatibility
      passengerName: reservation.user_name,
      passengerEmail: reservation.user_email
    }));
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching flight reservations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/reservations', async (req, res) => {
  try {
    const { flightId, passengerId, seatId } = req.body;
    
    // Verify the flight exists
    const [flights] = await pool.query('SELECT * FROM flights WHERE id = ?', [flightId]);
    
    if (flights.length === 0) {
      return res.status(400).json({ success: false, message: 'Flight not found' });
    }
    
    // Check if seat is available
    const [existingReservations] = await pool.query(
      'SELECT * FROM reservations WHERE flight_id = ? AND seat_number = ? AND status != "cancelled"',
      [flightId, seatId]
    );
    
    if (existingReservations.length > 0) {
      return res.status(400).json({ success: false, message: 'Seat is not available' });
    }
    
    // Create reservation
    const [result] = await pool.query(
      'INSERT INTO reservations (flight_id, user_id, seat_number, status, created_at) VALUES (?, ?, ?, "confirmed", NOW())',
      [flightId, passengerId, seatId]
    );
    
    // Update seat availability in seats table
    // This assumes a seats table structure with airplane_id linking to the flight
    const [flightDetails] = await pool.query(`
      SELECT airplane_id FROM flights WHERE id = ?
    `, [flightId]);
    
    if (flightDetails.length > 0 && flightDetails[0].airplane_id) {
      await pool.query(`
        UPDATE seats 
        SET is_available = 0 
        WHERE airplane_id = ? AND seat_number = ?
      `, [flightDetails[0].airplane_id, seatId]);
    }
    
    // Get the created reservation
    const [reservations] = await pool.query(`
      SELECT r.*, f.flight_number
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    if (reservations.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve created reservation' });
    }
    
    const reservation = reservations[0];
    
    const newReservation = {
      id: reservation.id.toString(),
      flight_id: reservation.flight_id.toString(),
      flightId: reservation.flight_id.toString(), // For backward compatibility
      user_id: reservation.user_id.toString(),
      userId: reservation.user_id.toString(), // For backward compatibility
      passengerId: reservation.user_id.toString(),
      seat_number: reservation.seat_number,
      seat: reservation.seat_number, // For backward compatibility
      seatId: reservation.seat_number, // For backward compatibility
      status: reservation.status,
      created_at: reservation.created_at ? new Date(reservation.created_at).toISOString() : null,
      timestamp: reservation.created_at ? new Date(reservation.created_at).toISOString() : null, // For backward compatibility
      flight_number: reservation.flight_number,
      flightNumber: reservation.flight_number // For backward compatibility
    };
    
    res.status(201).json({ success: true, reservation: newReservation });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/reservations/:id/cancel', async (req, res) => {
  try {
    // Get reservation details before updating
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [req.params.id]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    
    const reservation = reservations[0];
    
    // Update reservation status
    const [result] = await pool.query(
      'UPDATE reservations SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    
    // Make seat available again
    const [flightDetails] = await pool.query(`
      SELECT airplane_id FROM flights WHERE id = ?
    `, [reservation.flight_id]);
    
    if (flightDetails.length > 0 && flightDetails[0].airplane_id) {
      await pool.query(`
        UPDATE seats 
        SET is_available = 1 
        WHERE airplane_id = ? AND seat_number = ?
      `, [flightDetails[0].airplane_id, reservation.seat_number]);
    }
    
    // Get updated reservation
    const [updatedReservations] = await pool.query(`
      SELECT r.*, f.flight_number
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (updatedReservations.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    
    const updatedReservation = updatedReservations[0];
    
    res.json({
      id: updatedReservation.id.toString(),
      flight_id: updatedReservation.flight_id.toString(),
      flightId: updatedReservation.flight_id.toString(), // For backward compatibility
      user_id: updatedReservation.user_id.toString(),
      userId: updatedReservation.user_id.toString(), // For backward compatibility
      passengerId: updatedReservation.user_id.toString(),
      seat_number: updatedReservation.seat_number,
      seat: updatedReservation.seat_number, // For backward compatibility
      seatId: updatedReservation.seat_number, // For backward compatibility
      status: updatedReservation.status,
      created_at: updatedReservation.created_at ? new Date(updatedReservation.created_at).toISOString() : null,
      timestamp: updatedReservation.created_at ? new Date(updatedReservation.created_at).toISOString() : null, // For backward compatibility
      flight_number: updatedReservation.flight_number,
      flightNumber: updatedReservation.flight_number // For backward compatibility
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.put('/reservations/:id/check-in', async (req, res) => {
  try {
    // Update reservation status
    const [result] = await pool.query(
      'UPDATE reservations SET status = "checked-in" WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    
    // Get updated reservation
    const [updatedReservations] = await pool.query(`
      SELECT r.*, f.flight_number
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (updatedReservations.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    
    const updatedReservation = updatedReservations[0];
    
    res.json({
      id: updatedReservation.id.toString(),
      flight_id: updatedReservation.flight_id.toString(),
      flightId: updatedReservation.flight_id.toString(), // For backward compatibility
      user_id: updatedReservation.user_id.toString(),
      userId: updatedReservation.user_id.toString(), // For backward compatibility
      passengerId: updatedReservation.user_id.toString(),
      seat_number: updatedReservation.seat_number,
      seat: updatedReservation.seat_number, // For backward compatibility
      seatId: updatedReservation.seat_number, // For backward compatibility
      status: updatedReservation.status,
      created_at: updatedReservation.created_at ? new Date(updatedReservation.created_at).toISOString() : null,
      timestamp: updatedReservation.created_at ? new Date(updatedReservation.created_at).toISOString() : null, // For backward compatibility
      flight_number: updatedReservation.flight_number,
      flightNumber: updatedReservation.flight_number // For backward compatibility
    });
  } catch (error) {
    console.error('Error checking in reservation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Database connection test endpoint: http://localhost:${port}/api/test-db-connection`);
});
