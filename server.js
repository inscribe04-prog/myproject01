// server.js
// ─────────────────────────────────────────────
// This is the ENTRY POINT of the app.
// Its only job is to:
//   1. Load env vars
//   2. Set up middleware (in order)
//   2. Mount routes
//   3. Start the server (always last)
// All actual logic lives in /routes and /config
// ─────────────────────────────────────────────
// FIRST LINE — must run before anything reads process.env
// This loads .env into process.env

// // ─────────────────────────────────────────────
// // Basic Request Flow
// // ─────────────────────────────────────────────
// //
// // Browser Request
// //        ↓
// // Middleware
// //        ↓
// // Route Match
// //        ↓
// // Route Handler
// //        ↓
// // Response Sent Back
// //



require('dotenv').config();

// // ─────────────────────────────────────────────
// // Imports
// // ─────────────────────────────────────────────

const express = require('express');
const session = require('express-session');
const app     = express();
const rateLimit = require('express-rate-limit');
const cors = require('cors');


app.set('trust proxy', 1);


// ── 1. BODY PARSERS ──────────────────────────
// ── Middleware ───────────────────────────────
// Parses incoming form data (urlencoded bodies)
// // Allows Express to read form data submitted
// // from HTML forms using req.body

app.use(express.urlencoded({ extended: true }));

// ADD THIS: Parses incoming JSON data (Crucial for modern APIs)
app.use(express.json()); 


// ── 2. SESSION ───────────────────────────────
// One session() call — with secure cookie config
// Registers session middlewareMust be before any route that reads req.session
// // Must be registered BEFORE routes that use sessions.


app.use(session({

  // secret is used to sign (encrypt) the session cookie
  // use any long random string — keep it private
  // process.env.SESSION_SECRET reads from .env
  // No hardcoded string in code — safe to share

    secret:            process.env.SESSION_SECRET,

  // resave: false — don't save session if nothing changed
    resave:            false,

  // saveUninitialized: false — don't create session until
  // something is stored in it (i.e. until user logs in)
    saveUninitialized: false,

    cookie: {
        httpOnly: true,                                // Prevents JS from reading cookies (XSS Protection)
        secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
        sameSite: 'none',                            // Blocks cross-site requests CSRF Protection
        maxAge: 3600000 // 1 hour
    }
}));


// ── 3. RATE LIMITER ──────────────────────────
// Blocks brute-force login/register attempts
// Must be before auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max:      100,               // max 5 attempts per window
    message:  { error: "Too many attempts, please try again later." }
});

app.use('/login',    authLimiter);
app.use('/register', authLimiter);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ── 4. LOGGING ───────────────────────────────
// Middleware for Logging: A custom middleware in server.js that logs every request to the console with a timestamp. 
// It’s the "Hello World" of Observability.

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ── 5. STATIC FILES ──────────────────────────
// Serves everything in /public (index.htm, register.htm, /js, /css)
app.use(express.static('public'));

// ── 6. requireLogin HELPER ───────────────────
// Defined before the routes that use it
function requireLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/index.htm');
        return;
    }
    next();
}



// ADD IT HERE
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.htm');
});

// ── 7. ROUTES ────────────────────────────────
// Root → login page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.htm');
});

// ── Auth routes ──────────────────────────────
// Auth (login, register, logout)
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// ── Protected page ───────────────────────────
// requireLogin runs first — if it calls next(), this handler runs
// if not, user is redirected before reaching sendFile
app.get('/form.htm', requireLogin, (req, res) => {
  
  // __dirname = the folder where server.js lives
  // this sends the actual HTML file to the browser
    res.sendFile(__dirname + '/views/form.htm');
});

// Current logged in user info ─── /me route

// Add a /me route — returns current user's info as JSON
app.get('/me', requireLogin, (req, res) => {
    if (!req.session.user) { 
    res.json(req.session.user);
}
res.json(req.session.user);
});

// ── Form CRUD routes ─────────────────────────
// Import the form routes file and mount all its
// routes directly at the root path /
const formRoutes = require('./routes/formRoutes');
app.use('/', formRoutes);

// ── 8. START SERVER ──────────────────────────
// Always the last line

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));



// <!-------------------------------------------


// // ─────────────────────────────────────────────
// // Authentication Middleware
// // ─────────────────────────────────────────────
// //
// // This function runs BEFORE protected routes.
// //
// // If user is NOT logged in:
// //   → redirect to login.htm
// //
// // If user IS logged in:
// //   → call next() to continue to the route
// function requireLogin(req, res, next) {

//   // req.session.user exists after login
//   if (!req.session.user) {
//     res.redirect('/login.htm');
//     return;
//   }

//   // Continue to next middleware/route
//   next();
// }


// // ─────────────────────────────────────────────
// // Auth Routes
// // ─────────────────────────────────────────────
// //
// // Handles:
// // - login
// // - register
// // - logout
// const authRoutes = require('./routes/authRoutes');

// app.use('/', authRoutes);


// // ─────────────────────────────────────────────
// // Protected Routes
// // ─────────────────────────────────────────────

// // Route protection flow:
// // 1. requireLogin runs first
// // 2. If logged in → continue
// // 3. Otherwise → redirect to login.htm
// app.get('/form.htm', requireLogin, (req, res) => {

//   // __dirname = folder where server.js lives
//   // Sends the actual HTML file to browser
//   res.sendFile(__dirname + '/public/form.htm');
// });


// // ─────────────────────────────────────────────
// // Current Logged-In User Route
// // ─────────────────────────────────────────────
// //
// // Used by frontend JavaScript to check
// // which user is currently logged in.
// app.get('/me', requireLogin, (req, res) => {
//   res.json(req.session.user);
// });


// // ─────────────────────────────────────────────
// // Form CRUD Routes
// // ─────────────────────────────────────────────
// //
// // Handles:
// // - Create form entries
// // - Read form entries
// // - Update form entries
// // - Delete form entries
// const formRoutes = require('./routes/formRoutes');

// app.use('/', formRoutes);


// // ─────────────────────────────────────────────
// // Start Server
// // ─────────────────────────────────────────────
// //
// // Starts the Express server and begins listening
// // for incoming browser requests.
// app.listen(3000, () => {
//   console.log('Server running on http://localhost:3000');
// });


// ----------->