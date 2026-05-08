// routes/formRoutes.js
// ─────────────────────────────────────────────
// All routes related to the form entries live here.
// server.js imports this and mounts it with app.use()
// ─────────────────────────────────────────────

const express = require('express');

// express.Router() creates a mini-app for just these routes
// Think of it as a sub-section of your server
const router  = express.Router();

// Import the shared DB connection from config/db.js
const db      = require('../config/db');


// ── CREATE ──────────────────────────────────────
// POST /subbmmit — insert a new form entry
router.post('/subbmmit', (req, res) => {
  const {
    fn01, fn02, number1, password01,
    email01, phone01, quantity01,
    age, guardian, relstatus, spousename
  } = req.body;

  console.log('FULL BODY:', req.body);

  const sql = `INSERT INTO form_entries
    (firstname, lastname, ankval, inpass, email, phone, quantity, age, guardian, relstatus, spousename)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [fn01, fn02, number1, password01, email01, phone01, quantity01, age, guardian, relstatus, spousename], (err) => {
    if (err) { console.log('MySQL ERROR:', err.message); res.send('Error saving data'); return; }
    res.send('Saved!');
  });
});


// ── READ ─────────────────────────────────────────
// GET /yentries — fetch all form entries
router.get('/yentries', (req, res) => {
  const sql = 'SELECT * FROM form_entries ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) { res.send('Error fetching data'); return; }
    res.json(results);
  });
});


// ── UPDATE ───────────────────────────────────────
// POST /yupdate — update an existing row by id
router.post('/yupdate', (req, res) => {
  const {
    id, fn01, fn02, number1, password01,
    email01, phone01, quantity01,
    age, guardian, relstatus, spousename
  } = req.body;

  const sql = `UPDATE form_entries
    SET firstname=?, lastname=?, ankval=?, inpass=?, email=?, phone=?,
        quantity=?, age=?, guardian=?, relstatus=?, spousename=?
    WHERE id=?`;

  db.query(sql, [fn01, fn02, number1, password01, email01, phone01, quantity01, age, guardian, relstatus, spousename, id], (err) => {
    if (err) { console.log('MySQL ERROR:', err.message); res.send('Error updating'); return; }
    res.send('Updated!');
  });
});


// ── DELETE ───────────────────────────────────────
// POST /ydelete — delete a row by id
router.post('/ydelete', (req, res) => {
  const { id } = req.body;
  const sql = 'DELETE FROM form_entries WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) { res.send('Error deleting'); return; }
    res.send('Deleted!');
  });
});


// Export the router so server.js can mount it
module.exports = router;
