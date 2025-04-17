
const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'airport_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connection established successfully');
    console.log('Connected to database:', 'airport_management');
    
    // Test a simple query to verify database is working
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Database query test result:', rows);
    
    connection.release();
    return { success: true, message: "Connected to airport_management database" };
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    return { success: false, message: error.message || "Unknown database error" };
  }
}

module.exports = {
  pool,
  testConnection
};
