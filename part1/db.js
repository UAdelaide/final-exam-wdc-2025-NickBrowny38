const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost'
  user: process.env.DB_USER, // "dinesmart_user"
  password: process.env.DB_PASS, // "DevPass123!"
  database: process.env.DB_NAME, // "dinesmart"
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = db;