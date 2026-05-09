// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const bcrypt  = require('bcrypt');

// ── Helper: promisify db.query ────────────────────────────────────
// Wrap db.query in a Promise so we can use await on it
// query  = the SQL string
// params = the array of ? values
function dbQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}
// Now instead of wrapping every db.query manually,
// you just write: const results = await dbQuery(sql, [params])



// ── REGISTER ─────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  console.log('Register attempt:', email);
  
  try {
    // check if email already exists
    const existing = await dbQuery('SELECT id FROM users WHERE email=?', [email]);
    if (existing.length > 0) {
      res.json({ error: 'Email already registered' }); return;
    }

    // hash password — await pauses here until bcrypt finishes
    const hashed = await bcrypt.hash(password, 10);

    // save user with hashed password
    await dbQuery(
      'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
      [firstname, lastname, email, hashed]
    );

    res.json({ success: true });

  } catch (err) {
    console.log('Register error:', err.message);
    res.json({ error: 'Registration failed' });
  }
});


// ── LOGIN ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    // find user by email
    const results = await dbQuery('SELECT * FROM users WHERE email=?', [email]);
    if (results.length === 0) {
      res.json({ error: 'Invalid email or password' }); return;
    }

    const user  = results[0];

    // compare entered password against stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.json({ error: 'Invalid email or password' }); return;
    }

    // save to session — never save the password
    req.session.user = {
      id: user.id, firstname: user.firstname,
      lastname: user.lastname, email: user.email
    };

    res.json({ success: true });

  } catch (err) {
    console.log('Login error:', err.message);
    res.json({ error: 'Login failed' });
    }
});


// ── LOGOUT ────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  // logout doesn't need async — session.destroy uses a callback
  // but it's simple enough that a callback is fine here
  req.session.destroy((err) => {
    if (err) console.log('Logout error:', err);
    res.redirect('/index.htm');
  });
});

module.exports = router;
