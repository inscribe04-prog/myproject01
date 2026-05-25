const express = require('express');
const router = express.Router();
const dbQuery = require('../config/dbHelper');
const { requireAdmin } = require('../middleware/authMiddleware');


router.get('/api/dashboard/stats', requireAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as totalEntries,
                COUNT(DISTINCT user_id) as activeContributors,
                COUNT(CASE WHEN DATE(submitted) = CURDATE() THEN 1 END) as todayEntries
            FROM form_entries;
        `;
        const [results] = await dbQuery(query, []) ;

        let finalStats;
        if (Array.isArray(results)) {
            finalStats = results[0];
        } else {
            finalStats = results;
        }

        console.log("Sending finalStats:", finalStats);
        res.json(finalStats);
        
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
    });



router.get('/admin/users', requireAdmin, async (req, res) => {

    try {
        const users = await dbQuery('SELECT id, firstname, lastname, email, isAdmin FROM users', []);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/admin/users/:id', requireAdmin, async (req, res) => {

    try {
        await dbQuery('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/admin/users/:id/admin', requireAdmin, async (req, res) => {

    try {
        await dbQuery('UPDATE users SET isAdmin=? WHERE id=?', [req.body.isAdmin, req.params.id]);
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;