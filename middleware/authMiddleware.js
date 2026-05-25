// middleware/authMiddleware.js

// This ensures the request has a logged-in user
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// This attaches the user ID from the session to the request body automatically
const attachUserContext = (req, res, next) => {
    if (req.session && req.session.user) {
        req.body.user_id = req.session.user.id;
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}


module.exports = { isAuthenticated, attachUserContext, requireAdmin };