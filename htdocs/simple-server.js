const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'electroexpress',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
    }
    const [users] = await pool.query(
      'SELECT id, username, email, full_name, role FROM users WHERE username = ? AND password = ? AND is_active = 1',
      [username, password]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [users[0].id]);
    res.json({ message: 'Вход выполнен успешно', user: users[0] });
  } catch (error) {
    console.error('Error in /api/auth/login endpoint:', error);
    res.status(500).json({ error: 'Ошибка при входе в систему' });
  }
});

const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir));

app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/...`);
  console.log(`Frontend: served from /dist`);
});