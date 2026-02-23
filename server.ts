import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('vault.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    master_password_hash TEXT,
    pin_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS passwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform TEXT,
    account_name TEXT,
    username TEXT,
    encrypted_password TEXT,
    notes TEXT,
    category TEXT,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

    app.post('/api/auth/register', (req, res) => {
    const { username, masterPasswordHash } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO users (username, master_password_hash) VALUES (?, ?)');
      const info = stmt.run(username, masterPasswordHash);
      const newUser = { id: info.lastInsertRowid, username };
      res.json({ success: true, user: newUser });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, masterPasswordHash } = req.body;
    const user = db.prepare('SELECT id, username, pin_hash FROM users WHERE username = ? AND master_password_hash = ?').get(username, masterPasswordHash) as any;

    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username }, hasPin: !!user.pin_hash });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });

  app.post('/api/auth/login-pin', (req, res) => {
    const { pinHash } = req.body;
    // In a real app, you'd look up user by a session/device ID
    // For this demo, we'll just find the first user with this PIN
    const user = db.prepare('SELECT id, username FROM users WHERE pin_hash = ?').get(pinHash) as any;
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: 'Invalid PIN' });
    }
  });

  app.post('/api/auth/setup-pin', (req, res) => {
    const { userId, pinHash } = req.body;
    try {
      const stmt = db.prepare('UPDATE users SET pin_hash = ? WHERE id = ?');
      stmt.run(pinHash, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to set PIN' });
    }
  });


  // Password Routes
  app.get('/api/passwords', (req, res) => {
    const userId = req.query.userId;
    const passwords = db.prepare('SELECT * FROM passwords WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json(passwords);
  });

  app.post('/api/passwords', (req, res) => {
    const { userId, platform, accountName, username, encryptedPassword, notes, category } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO passwords (user_id, platform, account_name, username, encrypted_password, notes, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(userId, platform, accountName, username, encryptedPassword, notes, category);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save password' });
    }
  });

  app.put('/api/passwords/:id', (req, res) => {
    const { id } = req.params;
    const { platform, accountName, username, encryptedPassword, notes, category } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE passwords 
        SET platform = ?, account_name = ?, username = ?, encrypted_password = ?, notes = ?, category = ?
        WHERE id = ?
      `);
      stmt.run(platform, accountName, username, encryptedPassword, notes, category, id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  app.delete('/api/passwords/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM passwords WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete password' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
