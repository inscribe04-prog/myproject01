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
const dbQuery     = require('../config/dbHelper');


// ── CREATE ──────────────────────────────────────
// POST /RESTful routes  — insert a new form entry
router.post('/api/entries', async (req, res) => {
  const {
    fn01, fn02, number1, password01,
    email01, phone01, quantity01,
    age, guardian, relstatus, spousename
  } = req.body;

  console.log('FULL BODY:', req.body);

  // Server-side check
  if (!fn01 || fn01.length < 3) {
    return res.status(400).send('Invalid First Name');
  }
  if (!email01 || !email01.includes('@')) {
    return res.status(400).send('Invalid Email');
  }
  try {
  const sql = `INSERT INTO form_entries
    (firstname, lastname, ankval, inpass, email, phone, quantity, age, guardian, relstatus, spousename)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await dbQuery(sql, [fn01, fn02, number1, password01, email01, phone01, quantity01, age, guardian, relstatus, spousename]);
  res.status(201).json({ message: 'Entry created successfully' });
}
    catch (err) {
       res.status(500).json({error: 'Save failed' });
      }
});


// ── READ ─────────────────────────────────────────
// GET /api/entries — fetch all form entries
router.get('/api/entries', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM form_entries ORDER BY id DESC', []);
        res.status(200).json(results);
    } catch (err) {
        // res.status(500).json({ error: 'Database fetch error' });
        // Change this line temporarily:
        console.error("SQL ERROR:", err); // Log the real error to the terminal
        res.status(500).json({ error: err.message }); // Send the REAL error to the browser
    }
});


// ── UPDATE ───────────────────────────────────────
// PUT /api/entries/:id — update an existing row by id
router.put('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  const { fn01, fn02, number1, password01, email01, phone01, quantity01, age, guardian, relstatus, spousename } = req.body;

  try {
  const sql = `UPDATE form_entries
    SET firstname=?, lastname=?, ankval=?, inpass=?, email=?, phone=?,
        quantity=?, age=?, guardian=?, relstatus=?, spousename=?
    WHERE id=?`;

  await dbQuery(sql, [fn01, fn02, number1, password01, email01, phone01, quantity01, age, guardian, relstatus, spousename, id]);
   res.status(200).json({ message: 'Updated successfully' });
} catch (err) {
     res.status(500).json({ error: 'Update failed' });
  }
});


// ── DELETE ───────────────────────────────────────
// POST delete /api/entries/:id — delete a row by id
// ── DELETE ───────────────────────────────────────
// DELETE /api/entries/:id — delete a row by id
router.delete('/api/entries/:id', async (req, res) => {
    // FIX: Get the ID from the URL params, not the body
    const id = req.params.id; 
    const sql = 'DELETE FROM form_entries WHERE id=?';
    
    try {
        await dbQuery(sql, [id]);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: 'Delete failed' });
    } 
});

// Export the router so server.js can mount it
module.exports = router;



