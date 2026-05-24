# MyProject01 — Backend

> Node.js + Express REST API with MySQL, session auth, and React frontend serving.

## Live Demo
🚀 [myproject01-production.up.railway.app](https://myproject01-production.up.railway.app)

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via mysql2)
- **Auth:** express-session + bcrypt
- **File Upload:** multer + exceljs
- **Security:** cors, express-rate-limit, httpOnly cookies
- **Deployment:** Railway

## Project Structure
```
Structured/
├── server.js              # Entry point — middleware, routes, static serving
├── routes/
│   ├── authRoutes.js      # POST /login, POST /register, GET /logout
│   ├── formRoutes.js      # REST CRUD for form_entries table
│   ├── adminRoutes.js     # GET/DELETE /admin/users, PUT /admin/users/:id/admin
│   └── importRoutes.js    # POST /api/import — Excel bulk import
├── config/
│   ├── db.js              # MySQL connection
│   └── dbHelper.js        # Promise wrapper for db.query
├── views/
│   └── form.htm           # Legacy HTML form (reference)
├── public/                # Legacy static files (reference)
└── dist/                  # React build — served as frontend
```

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /login | Login with email + password |
| POST | /register | Register new user |
| GET | /logout | Destroy session |
| GET | /me | Get current logged-in user |

### Form Entries (CRUD)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/entries | Fetch all entries |
| POST | /api/entries | Create new entry |
| PUT | /api/entries/:id | Update entry by ID |
| DELETE | /api/entries/:id | Delete entry by ID |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /admin/users | Get all users (admin only) |
| DELETE | /admin/users/:id | Delete user (admin only) |
| PUT | /admin/users/:id/admin | Toggle admin status (admin only) |

### Import
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/import | Bulk import entries from Excel file |

## Security Features
- Passwords hashed with bcrypt (salt rounds: 10)
- Sessions signed with SECRET_KEY
- HTTP-only, secure, sameSite cookies
- Rate limiting on /login and /register (5 attempts per 15 min in production)
- CORS configured for allowed origins only
- Server-side validation on all routes
- Admin routes protected by requireAdmin middleware

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT | Primary key |
| firstname | VARCHAR(50) | |
| lastname | VARCHAR(50) | |
| email | VARCHAR(254) | UNIQUE |
| password | VARCHAR(255) | bcrypt hash |
| isAdmin | BOOLEAN | DEFAULT FALSE |

### form_entries
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT | Primary key |
| firstname | VARCHAR(50) | |
| lastname | VARCHAR(50) | |
| asin | VARCHAR(10) | 2-digit number |
| inpass | VARCHAR(255) | |
| email | VARCHAR(254) | |
| phone | VARCHAR(15) | 10 digits |
| quantity | VARCHAR(10) | 2-digit number |
| age | INT | 0-999 |
| guardian | VARCHAR(50) | Required if age < 18 |
| relstatus | VARCHAR(20) | |
| spousename | VARCHAR(50) | Required if married |

## Local Setup
```bash
git clone https://github.com/inscribe04-prog/myproject01.git
cd myproject01/Structured
npm install
```

Create `.env` file:
```
SESSION_SECRET=your_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_db_name
DB_PORT=3306
NODE_ENV=development
PORT=3000
```

```bash
npm run dev
```

App runs at `http://localhost:3000`

## Deployment
Deployed on Railway. Environment variables set in Railway dashboard. React frontend built locally and committed as `dist/` folder, served as static files from Express.
