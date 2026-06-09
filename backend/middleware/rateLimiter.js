const rateLimit = require('express-rate-limit');
const { pool } = require('../db');
const logger = require('../logger');

// Express-rate-limit: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: async (req, res) => {
    const ip = req.ip;
    logger.warn(`Rate limit exceeded for IP: ${ip}`);

    try {
      // Record in blocked_ips table (upsert)
      await pool.query(
        `INSERT INTO blocked_ips (ip_address, reason)
         VALUES (?, 'Exceeded login rate limit')
         ON DUPLICATE KEY UPDATE blocked_at = NOW(), reason = VALUES(reason)`,
        [ip]
      );
    } catch (e) {
      logger.error('Failed to record blocked IP: ' + e.message);
    }

    return res.status(429).json({
      error: 'Too many login attempts. Your IP has been temporarily blocked for 30 minutes.',
    });
  },
});

// Middleware to check if IP is permanently blocked
const checkBlockedIP = async (req, res, next) => {
  const ip = req.ip;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM blocked_ips WHERE ip_address = ? AND permanent = TRUE`,
      [ip]
    );
    if (rows.length > 0) {
      return res.status(403).json({ error: 'Your IP address has been permanently blocked.' });
    }
  } catch (e) {
    logger.error('checkBlockedIP error: ' + e.message);
  }
  next();
};

module.exports = { loginLimiter, checkBlockedIP };
