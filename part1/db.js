const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST, // "localhost"
  port: 3306, // default MySQL port
  user: process.env.DB_USER, // "dinesmart_user"
  password: process.env.DB_PASS, // "DevPass123!"
  database: process.env.DB_NAME, // "dinesmart"
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = db;