// config/dbHelper.js
const db = require('./db');

// This wraps every SQL query in a Promise, allowing 'await'
module.exports = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

