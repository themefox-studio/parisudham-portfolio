const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'database.json');
const JWT_SECRET = 'parisudham-secret-key-12345'; // Hardcoded for this simple implementation

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Set up image upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage });

// Helper to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { categories: [], products: [], users: [], testimonials: [], pageContent: {}, siteDetails: {} };
  }
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// --- Auth Endpoints ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);

  if (!user) return res.status(400).json({ error: 'Username or password is wrong' });

  const validPass = bcrypt.compareSync(password, user.passwordHash);
  if (!validPass) return res.status(400).json({ error: 'Username or password is wrong' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.cookie('token', token, { httpOnly: true, secure: false }); // set secure true in prod with https
  res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ authenticated: false });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, user: verified });
  } catch (err) {
    res.json({ authenticated: false });
  }
});

// --- Public Data Endpoints ---
app.get('/api/data', (req, res) => {
  const db = readDB();
  // Strip out users array for security
  const { users, ...publicData } = db;
  res.json(publicData);
});

// --- Protected Admin Endpoints ---

// Image Upload Endpoint
app.post('/api/admin/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ url: `/images/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Update Database (Generic save for everything from Admin panel)
app.post('/api/admin/save', authenticateToken, (req, res) => {
  const db = readDB();
  const newData = req.body;

  // We only allow updating these specific arrays/objects
  if (newData.products) db.products = newData.products;
  if (newData.categories) db.categories = newData.categories;
  if (newData.testimonials) db.testimonials = newData.testimonials;
  if (newData.pageContent) db.pageContent = newData.pageContent;
  if (newData.siteDetails) db.siteDetails = newData.siteDetails;
  
  // Users handling if role is admin
  if (newData.users && req.user.role === 'admin') {
      // If passing a new password for a user, hash it
      db.users = newData.users.map(u => {
          if (u.newPassword) {
              u.passwordHash = bcrypt.hashSync(u.newPassword, 10);
              delete u.newPassword;
          }
          return u;
      });
  }

  writeDB(db);
  res.json({ success: true });
});

// Admin get users (only if admin)
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  // Don't send password hashes back to frontend
  const safeUsers = db.users.map(u => ({ id: u.id, username: u.username, role: u.role }));
  res.json(safeUsers);
});

// Fallback to index.html for unknown routes (SPA like behavior)
app.use((req, res) => {
  // If it's an API route that wasn't found, return 404 JSON
  if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
