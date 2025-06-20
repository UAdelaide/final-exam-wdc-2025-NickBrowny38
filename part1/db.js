const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'db_user',
  password: 'pass123',
  database: 'dogwalks_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
