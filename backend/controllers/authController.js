const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const logger = require('../logger');

// Helper: log activity to DB
const logActivity = async (userId, eventType, ip, userAgent) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, event_type, ip_address, user_agent) VALUES (?, ?, ?, ?)`,
      [userId || null, eventType, ip, userAgent]
    );
  } catch (e) {
    logger.error('Failed to log activity: ' + e.message);
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const [existing] = await pool.query(
      `SELECT user_id FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      [username, email, password_hash]
    );

    await logActivity(result.insertId, 'REGISTER', req.ip, req.headers['user-agent']);
    logger.info(`New user registered: ${username}`);

    return res.status(201).json({ message: 'Registration successful. Please log in.' });
  } catch (e) {
    logger.error('Register error: ' + e.message);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;
  const ua = req.headers['user-agent'];

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, username]
    );

    // Generic message to prevent username enumeration
    if (rows.length === 0) {
      await logActivity(null, 'LOGIN_FAILURE', ip, ua);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await logActivity(user.user_id, 'LOGIN_FAILURE', ip, ua);
      return res.status(423).json({ error: 'Account is temporarily locked. Try again later.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      const newFailedAttempts = user.failed_attempts + 1;
      let lockedUntil = null;

      if (newFailedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
        await pool.query(
          `UPDATE users SET failed_attempts = ?, locked_until = ? WHERE user_id = ?`,
          [newFailedAttempts, lockedUntil, user.user_id]
        );
        await logActivity(user.user_id, 'ACCOUNT_LOCKED', ip, ua);
        logger.warn(`Account locked for user: ${user.username} from IP: ${ip}`);
        return res.status(423).json({ error: 'Too many failed attempts. Account locked for 30 minutes.' });
      }

      await pool.query(
        `UPDATE users SET failed_attempts = ? WHERE user_id = ?`,
        [newFailedAttempts, user.user_id]
      );
      await logActivity(user.user_id, 'LOGIN_FAILURE', ip, ua);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Success — reset failed attempts
    await pool.query(
      `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?`,
      [user.user_id]
    );

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    await logActivity(user.user_id, 'LOGIN_SUCCESS', ip, ua);
    logger.info(`User logged in: ${user.username} from IP: ${ip}`);

    // Send JWT in HttpOnly cookie + body (for SPA flexibility)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user.user_id, username: user.username, role: user.role },
    });
  } catch (e) {
    logger.error('Login error: ' + e.message);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  await logActivity(req.user?.userId, 'LOGOUT', req.ip, req.headers['user-agent']);
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
const me = (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { register, login, logout, me };
