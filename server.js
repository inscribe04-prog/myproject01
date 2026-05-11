// server.js
// ─────────────────────────────────────────────
// This is the ENTRY POINT of the app.
// Its only job is to:
//   1. Set up middleware
//   2. Mount routes
//   3. Start the server
// All actual logic lives in /routes and /config
// ─────────────────────────────────────────────
// FIRST LINE — must run before anything reads process.env
// This loads .env into process.env

require('dotenv').config();


const express = require('express');
const session = require('express-session');
const app     = express();


// ── Middleware ───────────────────────────────
// Parses incoming form data (urlencoded bodies)
app.use(express.urlencoded({ extended: true }));

// add this AFTER app.use(express.urlencoded) in server.js
// this registers session middleware — must be before any routes
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
    saveUninitialized: false
}));

// Middleware for Logging: A custom middleware in server.js that logs every request to the console with a timestamp. 
// It’s the "Hello World" of Observability.


app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});



// Serves login/index.htm, register.htm, and all /js, /css files publicly

// serves login/index.htm and register.htm publicly

// // Serves all files in /public folder statically
// // e.g. /public/form.htm is accessible at /form.htm
// app.use(express.static('public'));

// app.use(express.static('.'));


app.use(express.static('public'));


// ADD IT HERE
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.htm');
});



// helper function
// function requireLogin(req, res, next) { ... }

// ── requireLogin — defined here, used below ──
function requireLogin(req, res, next) {
    if (!req.session.user) {
    res.redirect('/index.htm');
    return;
  }
  next();
}

// ── Auth routes ──────────────────────────────
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

// ── /me route — returns logged in user info ──

// Add a /me route — returns current user's info as JSON
app.get('/me', requireLogin, (req, res) => {
    res.json(req.session.user);
});

// ── Routes ──────────────────────────────────

// Import the form routes file and mount all its
// routes directly at the root path /
// ── Form CRUD routes ─────────────────────────
// Import the form routes file and mount all its
// routes directly at the root path /
const formRoutes = require('./routes/formRoutes');
app.use('/', formRoutes);

// ── Start server ─────────────────────────────
// Always the last line

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));


  






















// <!-------------------------------------------


// // server.js
// // ─────────────────────────────────────────────
// // Main starting file of the application.
// //
// // This file should stay small and clean.
// // Its job is only to:
// //   1. Configure middleware
// //   2. Connect route files
// //   3. Start the server
// //
// // Actual logic should live inside:
// //   - /routes
// //   - /config
// //   - future controllers/services
// //
// // Keeping code separated makes large apps
// // easier to read, debug, and maintain.
// // ─────────────────────────────────────────────


// // ─────────────────────────────────────────────
// // Imports
// // ─────────────────────────────────────────────
// const express = require('express');
// const session = require('express-session');

// const app = express();


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


// // ─────────────────────────────────────────────
// // Middleware
// // ─────────────────────────────────────────────

// // Allows Express to read form data submitted
// // from HTML forms using req.body
// app.use(express.urlencoded({ extended: true }));


// // Session middleware
// // Adds req.session so login state can persist
// // between requests.
// //
// // Must be registered BEFORE routes that use sessions.
// app.use(session({

//   // Used to sign the session cookie so users
//   // cannot tamper with it.
//   //
//   // In real apps:
//   // - store secrets inside .env files
//   // - NEVER hardcode secrets in source code
//   secret: 'mySecretKey2026',

//   // Don't save session again if nothing changed
//   resave: false,

//   // Don't create empty sessions for visitors
//   // who are not logged in yet
//   saveUninitialized: false
// }));


// // Makes all files inside /public accessible
// // directly in the browser.
// //
// // Example:
// // public/login.htm
// // → http://localhost:3000/login.htm
// app.use(express.static('public'));


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