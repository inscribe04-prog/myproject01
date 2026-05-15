// config/db.js
// ─────────────────────────────────────────────
// All database connection logic lives here.
// Import this file in any route that needs MySQL.
// This way if you change DB credentials, you
// only change them in ONE place.
// ─────────────────────────────────────────────

// require('dotenv').config() reads the .env file
// and loads every KEY=VALUE into process.env
// Must be called before you use any process.env value

require('dotenv').config();

const mysql = require('mysql2');

const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT
});


db.connect((err) => {
  if (err) {
    console.log('MySQL CONNECTION ERROR:', err.message);
  } else {
    console.log('MySQL connected successfully');
  }
});

// Export db so other files can use it with:
// const db = require('../config/db');
module.exports = db;
