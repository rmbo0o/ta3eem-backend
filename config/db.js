const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
