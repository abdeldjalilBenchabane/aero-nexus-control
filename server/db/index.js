
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
    const { name, email, password, role } = user;
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, ...user };
  }
};

// Flight related database operations
const flightOperations = {
  getAll: async () => {
    return await query(`
      SELECT f.*, u.name as airline_name, g.gate_number, r.runway_number 
      FROM flights f 
      LEFT JOIN users u ON f.airline_id = u.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
    `);
  },
  getById: async (id) => {
    const flights = await query(`
      SELECT f.*, u.name as airline_name, g.gate_number, r.runway_number 
      FROM flights f 
      LEFT JOIN users u ON f.airline_id = u.id
      LEFT JOIN gates g ON f.gate_id = g.id
      LEFT JOIN runways r ON f.runway_id = r.id
      WHERE f.id = ?
    `, [id]);
    return flights[0] || null;
  },
  create: async (flight) => {
    const { flight_number, airline_id, departure_time, arrival_time, destination, status, price } = flight;
    const result = await query(
      'INSERT INTO flights (flight_number, airline_id, departure_time, arrival_time, destination, status, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [flight_number, airline_id, departure_time, arrival_time, destination, status, price]
    );
    return { id: result.insertId, ...flight };
  },
  update: async (id, flight) => {
    let sql = 'UPDATE flights SET ';
    const params = [];
    const updateFields = [];
    
    if (flight.flight_number !== undefined) {
      updateFields.push('flight_number = ?');
      params.push(flight.flight_number);
    }
    
    if (flight.gate_id !== undefined) {
      updateFields.push('gate_id = ?');
      params.push(flight.gate_id);
    }
    
    if (flight.runway_id !== undefined) {
      updateFields.push('runway_id = ?');
      params.push(flight.runway_id);
    }
    
    if (flight.status !== undefined) {
      updateFields.push('status = ?');
      params.push(flight.status);
    }
    
    if (updateFields.length === 0) {
      return null;
    }
    
    sql += updateFields.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    await query(sql, params);
    return await flightOperations.getById(id);
  }
};

// Gate related database operations
const gateOperations = {
  getAll: async () => {
    return await query('SELECT * FROM gates');
  },
  getAvailable: async () => {
    return await query(`
      SELECT g.* 
      FROM gates g
      LEFT JOIN flights f ON g.id = f.gate_id AND f.status IN ('scheduled', 'delayed')
      WHERE f.id IS NULL
    `);
  }
};

// Runway related database operations
const runwayOperations = {
  getAll: async () => {
    return await query('SELECT * FROM runways');
  },
  getAvailable: async () => {
    return await query(`
      SELECT r.* 
      FROM runways r
      LEFT JOIN flights f ON r.id = f.runway_id AND f.status IN ('scheduled', 'delayed')
      WHERE f.id IS NULL
    `);
  }
};

// Reservation related database operations
const reservationOperations = {
  getByUser: async (userId) => {
    return await query(`
      SELECT r.*, f.flight_number, f.destination, f.departure_time, f.arrival_time, s.seat_number 
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      JOIN seats s ON r.seat_id = s.id
      WHERE r.user_id = ?
    `, [userId]);
  },
  create: async (reservation) => {
    const { user_id, flight_id, seat_id } = reservation;
    
    // Update seat to reserved
    await query('UPDATE seats SET is_reserved = TRUE WHERE id = ?', [seat_id]);
    
    // Create reservation
    const result = await query(
      'INSERT INTO reservations (user_id, flight_id, seat_id) VALUES (?, ?, ?)',
      [user_id, flight_id, seat_id]
    );
    
    return { id: result.insertId, ...reservation };
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
    const { title, message, target_role, flight_id } = notification;
    const result = await query(
      'INSERT INTO notifications (title, message, target_role, flight_id) VALUES (?, ?, ?, ?)',
      [title, message, target_role, flight_id]
    );
    return { id: result.insertId, ...notification };
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
  flights: flightOperations,
  gates: gateOperations,
  runways: runwayOperations,
  reservations: reservationOperations,
  notifications: notificationOperations,
  auth: authOperations
};
