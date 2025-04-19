
const mysql = require('./mysql');
const { pool } = mysql;

// Helper function to run a query
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Format date or return null for display
const formatDateOrNull = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch (e) {
    return null;
  }
};

// User related database operations
const userOperations = {
  getAll: async () => {
    return await query('SELECT * FROM users');
  },
  getById: async (id) => {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  },
  getByCredentials: async (email, password) => {
    const users = await query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    return users[0] || null;
  },
  create: async (user) => {
    const { name, email, password, role, airline_id } = user;
    const result = await query(
      'INSERT INTO users (name, email, password, role, airline_id) VALUES (?, ?, ?, ?, ?)',
      [name || 'New User', email, password, role, airline_id || null]
    );
    return { id: result.insertId, ...user, created_at: new Date().toISOString() };
  },
  update: async (id, userData) => {
    let sql = 'UPDATE users SET ';
    const params = [];
    const updateFields = [];
    
    if (userData.name !== undefined) {
      updateFields.push('name = ?');
      params.push(userData.name || 'Updated User');
    }
    
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(userData.email);
    }
    
    if (userData.password !== undefined) {
      updateFields.push('password = ?');
      params.push(userData.password);
    }
    
    if (userData.role !== undefined) {
      updateFields.push('role = ?');
      params.push(userData.role);
    }
    
    if (userData.airline_id !== undefined) {
      updateFields.push('airline_id = ?');
      params.push(userData.airline_id);
    }
    
    if (updateFields.length === 0) {
      return null;
    }
    
    sql += updateFields.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    await query(sql, params);
    return await userOperations.getById(id);
  },
  delete: async (id) => {
    await query('DELETE FROM users WHERE id = ?', [id]);
    return { success: true };
  }
};

// Airline related database operations
const airlineOperations = {
  getAll: async () => {
    return await query('SELECT * FROM airlines');
  },
  getById: async (id) => {
    const airlines = await query('SELECT * FROM airlines WHERE id = ?', [id]);
    return airlines[0] || null;
  }
};

// Airplane related database operations
const airplaneOperations = {
  getAll: async () => {
    return await query('SELECT * FROM airplanes');
  },
  getByAirline: async (airlineId) => {
    return await query('SELECT * FROM airplanes WHERE airline_id = ?', [airlineId]);
  },
  getAvailable: async (airlineId, departureTime, arrivalTime) => {
    return await query(`
      SELECT a.* FROM airplanes a
      WHERE a.airline_id = ?
      AND NOT EXISTS (
        SELECT 1 FROM flights f
        WHERE f.airplane_id = a.id
        AND f.status IN ('scheduled', 'boarding', 'delayed')
        AND (
          (f.departure_time <= ? AND f.arrival_time >= ?) OR
          (f.departure_time <= ? AND f.arrival_time >= ?) OR
          (f.departure_time >= ? AND f.arrival_time <= ?)
        )
      )
    `, [airlineId, departureTime, departureTime, arrivalTime, arrivalTime, departureTime, arrivalTime]);
  },
  create: async (airplane) => {
    const { name, airline_id, capacity } = airplane;
    if (!name) {
      throw new Error('Airplane name is required');
    }
    if (!airline_id) {
      throw new Error('Airline ID is required');
    }
    if (!capacity || capacity < 1) {
      throw new Error('Valid capacity is required');
    }
    
    const result = await query(
      'INSERT INTO airplanes (name, airline_id, capacity) VALUES (?, ?, ?)',
      [name, airline_id, capacity]
    );
    
    const airplaneId = result.insertId;
    
    // Generate seats for the airplane
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
      await query(
        'INSERT INTO seats (airplane_id, seat_number, is_available) VALUES (?, ?, TRUE)',
        [airplaneId, seatNumber]
      );
    }
    
    // Get the created airplane with all fields
    const createdAirplane = await query('SELECT * FROM airplanes WHERE id = ?', [airplaneId]);
    return createdAirplane[0] || { id: airplaneId, ...airplane, created_at: new Date().toISOString() };
  },
  delete: async (id) => {
    // First check if airplane is used in any flights
    const flightsUsingAirplane = await query('SELECT COUNT(*) as count FROM flights WHERE airplane_id = ? AND status IN ("scheduled", "boarding", "delayed")', [id]);
    if (flightsUsingAirplane[0].count > 0) {
      throw new Error('Cannot delete airplane that is in use by active flights');
    }
    
    // First delete related seats
    await query('DELETE FROM seats WHERE airplane_id = ?', [id]);
    // Then delete the airplane
    await query('DELETE FROM airplanes WHERE id = ?', [id]);
    return { success: true };
  }
};

// Flight related database operations
const flightOperations = {
  getAll: async () => {
    return await query(`
      SELECT f.*, a.name as airline_name, ap.name as airplane_name, g.name as gate_number, r.name as runway_number 
      FROM flights f 
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airplanes ap ON f.airplane_id = ap.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
    `);
  },
  getById: async (id) => {
    const flights = await query(`
      SELECT f.*, a.name as airline_name, ap.name as airplane_name, g.name as gate_number, r.name as runway_number 
      FROM flights f 
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airplanes ap ON f.airplane_id = ap.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.id = ?
    `, [id]);
    return flights[0] || null;
  },
  getByAirline: async (airlineId) => {
    return await query(`
      SELECT f.*, a.name as airline_name, ap.name as airplane_name, g.name as gate_number, r.name as runway_number 
      FROM flights f 
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airplanes ap ON f.airplane_id = ap.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.airline_id = ?
    `, [airlineId]);
  },
  search: async (criteria) => {
    let sql = `
      SELECT f.*, a.name as airline_name, ap.name as airplane_name, g.name as gate_number, r.name as runway_number 
      FROM flights f 
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airplanes ap ON f.airplane_id = ap.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE 1=1
    `;
    const params = [];
    
    if (criteria.origin) {
      sql += ' AND f.origin LIKE ?';
      params.push(`%${criteria.origin}%`);
    }
    
    if (criteria.destination) {
      sql += ' AND f.destination LIKE ?';
      params.push(`%${criteria.destination}%`);
    }
    
    if (criteria.date) {
      sql += ' AND DATE(f.departure_time) = ?';
      params.push(criteria.date);
    }
    
    return await query(sql, params);
  },
  create: async (flight) => {
    const { 
      flight_number, 
      airline_id, 
      airplane_id, 
      gate_id, 
      runway_id, 
      origin, 
      destination, 
      departure_time, 
      arrival_time, 
      status, 
      price 
    } = flight;
    
    const result = await query(
      `INSERT INTO flights 
        (flight_number, airline_id, airplane_id, gate_id, runway_id, origin, destination, 
         departure_time, arrival_time, status, price) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [flight_number, airline_id, airplane_id, gate_id, runway_id, origin, destination, 
       departure_time, arrival_time, status || 'scheduled', price]
    );
    
    // Get the created flight with all fields
    const createdFlight = await query(`
      SELECT f.*, a.name as airline_name, ap.name as airplane_name, g.name as gate_number, r.name as runway_number 
      FROM flights f 
      LEFT JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airplanes ap ON f.airplane_id = ap.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.id = ?
    `, [result.insertId]);
    
    return createdFlight[0] || { id: result.insertId, ...flight, created_at: new Date().toISOString() };
  },
  update: async (id, flight) => {
    let sql = 'UPDATE flights SET ';
    const params = [];
    const updateFields = [];
    
    if (flight.flight_number !== undefined) {
      updateFields.push('flight_number = ?');
      params.push(flight.flight_number);
    }
    
    if (flight.airline_id !== undefined) {
      updateFields.push('airline_id = ?');
      params.push(flight.airline_id);
    }
    
    if (flight.airplane_id !== undefined) {
      updateFields.push('airplane_id = ?');
      params.push(flight.airplane_id);
    }
    
    if (flight.gate_id !== undefined) {
      updateFields.push('gate_id = ?');
      params.push(flight.gate_id);
    }
    
    if (flight.runway_id !== undefined) {
      updateFields.push('runway_id = ?');
      params.push(flight.runway_id);
    }
    
    if (flight.origin !== undefined) {
      updateFields.push('origin = ?');
      params.push(flight.origin);
    }
    
    if (flight.destination !== undefined) {
      updateFields.push('destination = ?');
      params.push(flight.destination);
    }
    
    if (flight.departure_time !== undefined) {
      updateFields.push('departure_time = ?');
      params.push(flight.departure_time);
    }
    
    if (flight.arrival_time !== undefined) {
      updateFields.push('arrival_time = ?');
      params.push(flight.arrival_time);
    }
    
    if (flight.status !== undefined) {
      updateFields.push('status = ?');
      params.push(flight.status);
    }
    
    if (flight.price !== undefined) {
      updateFields.push('price = ?');
      params.push(flight.price);
    }
    
    if (updateFields.length === 0) {
      return null;
    }
    
    sql += updateFields.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    await query(sql, params);
    return await flightOperations.getById(id);
  },
  delete: async (id) => {
    // Delete any reservations associated with this flight
    await query('DELETE FROM reservations WHERE flight_id = ?', [id]);
    // Then delete the flight
    await query('DELETE FROM flights WHERE id = ?', [id]);
    return { success: true };
  }
};

// Gate related database operations
const gateOperations = {
  getAll: async () => {
    const gates = await query('SELECT * FROM gates');
    return gates.map(gate => ({
      ...gate,
      created_at: formatDateOrNull(gate.created_at)
    }));
  },
  getById: async (id) => {
    const gates = await query('SELECT * FROM gates WHERE id = ?', [id]);
    if (!gates || gates.length === 0) return null;
    
    return {
      ...gates[0],
      created_at: formatDateOrNull(gates[0].created_at)
    };
  },
  getAvailable: async (departureTime, arrivalTime) => {
    const gates = await query(`
      SELECT g.* 
      FROM gates g
      WHERE NOT EXISTS (
        SELECT 1 FROM flights f 
        WHERE f.gate_id = g.id 
        AND f.status IN ('scheduled', 'boarding', 'delayed')
        AND (
          (f.departure_time <= ? AND f.departure_time >= ?) OR
          (? <= f.departure_time AND ? >= f.departure_time)
        )
      )
    `, [arrivalTime, departureTime, departureTime, arrivalTime]);
    
    return gates.map(gate => ({
      ...gate,
      created_at: formatDateOrNull(gate.created_at)
    }));
  },
  create: async (gate) => {
    const { name, terminal } = gate;
    if (!name) {
      throw new Error('Gate name is required');
    }
    
    // Check if gate with this name already exists
    const existingGate = await query('SELECT id FROM gates WHERE name = ?', [name]);
    if (existingGate.length > 0) {
      throw new Error('Gate with this name already exists');
    }
    
    const result = await query(
      'INSERT INTO gates (name, terminal) VALUES (?, ?)',
      [name, terminal || null]
    );
    
    // Get the created gate with all fields
    const createdGate = await query('SELECT * FROM gates WHERE id = ?', [result.insertId]);
    if (!createdGate || createdGate.length === 0) {
      return { 
        id: result.insertId, 
        name, 
        terminal, 
        created_at: new Date().toISOString() 
      };
    }
    
    return {
      ...createdGate[0],
      created_at: formatDateOrNull(createdGate[0].created_at)
    };
  },
  update: async (id, gate) => {
    let sql = 'UPDATE gates SET ';
    const params = [];
    const updateFields = [];
    
    if (gate.name !== undefined) {
      // Check if new name already exists
      if (gate.name) {
        const existingGate = await query('SELECT id FROM gates WHERE name = ? AND id != ?', [gate.name, id]);
        if (existingGate.length > 0) {
          throw new Error('Gate with this name already exists');
        }
      }
      
      updateFields.push('name = ?');
      params.push(gate.name);
    }
    
    if (gate.terminal !== undefined) {
      updateFields.push('terminal = ?');
      params.push(gate.terminal);
    }
    
    if (updateFields.length === 0) {
      return null;
    }
    
    sql += updateFields.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    await query(sql, params);
    return await gateOperations.getById(id);
  },
  delete: async (id) => {
    // Check if gate is in use by any flights
    const flightsUsingGate = await query(
      'SELECT COUNT(*) as count FROM flights WHERE gate_id = ? AND status IN ("scheduled", "boarding", "delayed")', 
      [id]
    );
    
    if (flightsUsingGate[0].count > 0) {
      throw new Error('Cannot delete gate that is in use by active flights');
    }
    
    await query('DELETE FROM gates WHERE id = ?', [id]);
    return { success: true };
  }
};

// Runway related database operations
const runwayOperations = {
  getAll: async () => {
    const runways = await query('SELECT * FROM runways');
    return runways.map(runway => ({
      ...runway,
      created_at: formatDateOrNull(runway.created_at)
    }));
  },
  getById: async (id) => {
    const runways = await query('SELECT * FROM runways WHERE id = ?', [id]);
    if (!runways || runways.length === 0) return null;
    
    return {
      ...runways[0],
      created_at: formatDateOrNull(runways[0].created_at)
    };
  },
  getAvailable: async (departureTime, arrivalTime) => {
    const runways = await query(`
      SELECT r.* 
      FROM runways r
      WHERE NOT EXISTS (
        SELECT 1 FROM flights f 
        WHERE f.runway_id = r.id 
        AND f.status IN ('scheduled', 'boarding', 'delayed')
        AND (
          (f.departure_time <= ? AND f.departure_time >= ?) OR
          (? <= f.departure_time AND ? >= f.departure_time)
        )
      )
    `, [arrivalTime, departureTime, departureTime, arrivalTime]);
    
    return runways.map(runway => ({
      ...runway,
      created_at: formatDateOrNull(runway.created_at)
    }));
  },
  create: async (runway) => {
    const { name } = runway;
    if (!name) {
      throw new Error('Runway name is required');
    }
    
    // Check if runway with this name already exists
    const existingRunway = await query('SELECT id FROM runways WHERE name = ?', [name]);
    if (existingRunway.length > 0) {
      throw new Error('Runway with this name already exists');
    }
    
    const result = await query(
      'INSERT INTO runways (name) VALUES (?)',
      [name]
    );
    
    // Get the created runway with all fields
    const createdRunway = await query('SELECT * FROM runways WHERE id = ?', [result.insertId]);
    if (!createdRunway || createdRunway.length === 0) {
      return { 
        id: result.insertId, 
        name, 
        created_at: new Date().toISOString() 
      };
    }
    
    return {
      ...createdRunway[0],
      created_at: formatDateOrNull(createdRunway[0].created_at)
    };
  },
  update: async (id, runway) => {
    if (!runway.name) {
      throw new Error('Runway name is required');
    }
    
    // Check if new name already exists
    const existingRunway = await query('SELECT id FROM runways WHERE name = ? AND id != ?', [runway.name, id]);
    if (existingRunway.length > 0) {
      throw new Error('Runway with this name already exists');
    }
    
    await query('UPDATE runways SET name = ? WHERE id = ?', [runway.name, id]);
    return await runwayOperations.getById(id);
  },
  delete: async (id) => {
    // Check if runway is in use by any flights
    const flightsUsingRunway = await query(
      'SELECT COUNT(*) as count FROM flights WHERE runway_id = ? AND status IN ("scheduled", "boarding", "delayed")', 
      [id]
    );
    
    if (flightsUsingRunway[0].count > 0) {
      throw new Error('Cannot delete runway that is in use by active flights');
    }
    
    await query('DELETE FROM runways WHERE id = ?', [id]);
    return { success: true };
  }
};

// Reservation related database operations
const reservationOperations = {
  getAll: async () => {
    return await query(`
      SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, f.arrival_time, s.seat_number, u.name as passengerName, u.email as passengerEmail 
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      JOIN seats s ON r.seat_id = s.id
      JOIN users u ON r.user_id = u.id
    `);
  },
  getById: async (id) => {
    const reservations = await query(`
      SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, f.arrival_time, s.seat_number, u.name as passengerName, u.email as passengerEmail 
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      JOIN seats s ON r.seat_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    return reservations[0] || null;
  },
  getByUser: async (userId) => {
    return await query(`
      SELECT r.*, f.flight_number, f.origin, f.destination, f.departure_time, f.arrival_time, s.seat_number, u.name as passengerName, u.email as passengerEmail
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      JOIN seats s ON r.seat_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ?
    `, [userId]);
  },
  create: async (reservation) => {
    const { user_id, flight_id, seat_id } = reservation;
    
    // Update seat to reserved
    await query('UPDATE seats SET is_reserved = TRUE WHERE id = ?', [seat_id]);
    
    // Create reservation
    const result = await query(
      'INSERT INTO reservations (user_id, flight_id, seat_id, status) VALUES (?, ?, ?, ?)',
      [user_id, flight_id, seat_id, 'confirmed']
    );
    
    return { id: result.insertId, ...reservation, created_at: new Date().toISOString() };
  },
  cancel: async (id) => {
    // Get reservation details first
    const reservation = await reservationOperations.getById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    // Update reservation status
    await query('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', id]);
    
    // Set seat to available again
    await query('UPDATE seats SET is_reserved = FALSE WHERE id = ?', [reservation.seat_id]);
    
    return { success: true };
  }
};

// Seat related database operations
const seatOperations = {
  getByFlight: async (flightId) => {
    return await query(`
      SELECT s.* 
      FROM seats s
      JOIN flights f ON s.airplane_id = f.airplane_id
      WHERE f.id = ?
    `, [flightId]);
  },
  getAvailable: async (flightId) => {
    return await query(`
      SELECT s.* 
      FROM seats s
      JOIN flights f ON s.airplane_id = f.airplane_id
      LEFT JOIN reservations r ON r.seat_id = s.id AND r.flight_id = f.id AND r.status = 'confirmed'
      WHERE f.id = ? AND (r.id IS NULL OR r.status = 'cancelled')
    `, [flightId]);
  },
  getBySeatNumber: async (flightId, seatNumber) => {
    const seats = await query(`
      SELECT s.* 
      FROM seats s
      JOIN flights f ON s.airplane_id = f.airplane_id
      WHERE f.id = ? AND s.seat_number = ?
    `, [flightId, seatNumber]);
    return seats[0] || null;
  }
};

// Notification related database operations
const notificationOperations = {
  getAll: async () => {
    return await query('SELECT * FROM notifications ORDER BY created_at DESC');
  },
  getForUser: async (userId, role) => {
    const user = await userOperations.getById(userId);
    
    if (!user) return [];
    
    return await query(`
      SELECT n.* FROM notifications n
      WHERE n.target_role = ? OR n.target_role = 'all'
      ORDER BY n.created_at DESC
    `, [user.role]);
  },
  create: async (notification) => {
    const { title, message, user_id, target_role, flight_id } = notification;
    const result = await query(
      'INSERT INTO notifications (title, message, user_id, target_role, flight_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [title, message, user_id, target_role, flight_id]
    );
    return { id: result.insertId, ...notification, created_at: new Date().toISOString() };
  }
};

// Auth operations
const authOperations = {
  login: async (email, password) => {
    const user = await userOperations.getByCredentials(email, password);
    if (!user) return null;
    
    return { user, token: 'mock-token-' + user.id };
  },
  register: async (userData) => {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [userData.email]);
    if (existing.length > 0) {
      throw new Error('Email already in use');
    }
    
    const user = await userOperations.create(userData);
    return { user, token: 'mock-token-' + user.id };
  }
};

// Export all database operations
module.exports = {
  testConnection: mysql.testConnection,
  users: userOperations,
  airlines: airlineOperations,
  airplanes: airplaneOperations,
  flights: flightOperations,
  gates: gateOperations,
  runways: runwayOperations,
  reservations: reservationOperations,
  seats: seatOperations,
  notifications: notificationOperations,
  auth: authOperations
};
