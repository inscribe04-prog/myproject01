const express = require('express');
const router = express.Router();
const dbQuery = require('../config/dbHelper');

// GET all users
router.get('/admin/users', async (req, res) => {
    try {
        const users = await dbQuery('SELECT id, firstname, lastname, email, isAdmin FROM users', []);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE user
router.delete('/admin/users/:id', async (req, res) => {
    try {
        await dbQuery('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TOGGLE admin
router.put('/admin/users/:id/admin', async (req, res) => {
    try {
        await dbQuery('UPDATE users SET isAdmin=? WHERE id=?', [req.body.isAdmin, req.params.id]);
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;