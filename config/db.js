// const mysql = require('mysql2');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306,
// });



const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const connectDB = () => {
  pool.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      process.exit(1);
    } else {
      console.log('MySQL connected');
    }
  });
};

module.exports = { connectDB, pool};
