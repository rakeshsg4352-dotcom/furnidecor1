// config/db.js
// This file creates a connection pool to our MySQL database.
// A "pool" is better than a single connection because it can handle
// multiple requests at the same time without waiting.

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool using the credentials from our .env file
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,   // max number of simultaneous connections
  queueLimit: 0
});

// mysql2 gives us a "promise" version of the pool so we can use
// async/await in our controllers instead of callbacks — much cleaner code.
const promisePool = pool.promise();

// Quick test: try to connect once when the server starts, so we know
// immediately if our .env credentials are wrong, instead of finding out
// later when a user tries to log in.
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ MySQL connected successfully');
    connection.release(); // give the connection back to the pool
  }
});

module.exports = promisePool;