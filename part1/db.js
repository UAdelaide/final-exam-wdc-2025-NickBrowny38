const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'db_user',
  password: 'pass123',
  database: process.env.DB_NAME, // "dinesmart"
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = db;