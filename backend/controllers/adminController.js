const { pool } = require('../db');
const logger = require('../logger');

// GET /api/admin/logs
const getLogs = async (req, res) => {
  const { page = 1, limit = 50, event_type, ip_address, from, to } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (event_type) { conditions.push('event_type = ?'); params.push(event_type); }
  if (ip_address) { conditions.push('ip_address LIKE ?'); params.push(`%${ip_address}%`); }
  if (from)       { conditions.push('timestamp >= ?'); params.push(from); }
  if (to)         { conditions.push('timestamp <= ?'); params.push(to); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const [logs] = await pool.query(
      `SELECT l.*, u.username 
       FROM activity_logs l 
       LEFT JOIN users u ON l.user_id = u.user_id 
       ${where} 
       ORDER BY l.timestamp DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM activity_logs l ${where}`,
      params
    );
    return res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    logger.error('getLogs error: ' + e.message);
    return res.status(500).json({ error: 'Failed to fetch logs.' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT user_id, username, email, role, created_at, is_active, failed_attempts, locked_until 
       FROM users ORDER BY created_at DESC`
    );
    return res.json({ users });
  } catch (e) {
    logger.error('getUsers error: ' + e.message);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// PATCH /api/admin/users/:id/toggle
const toggleUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE users SET is_active = NOT is_active WHERE user_id = ?`,
      [id]
    );
    return res.json({ message: 'User status updated.' });
  } catch (e) {
    logger.error('toggleUser error: ' + e.message);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
};

// GET /api/admin/blocked-ips
const getBlockedIPs = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM blocked_ips ORDER BY blocked_at DESC`);
    return res.json({ blocked_ips: rows });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch blocked IPs.' });
  }
};

// DELETE /api/admin/blocked-ips/:id
const unblockIP = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM blocked_ips WHERE id = ?`, [id]);
    return res.json({ message: 'IP unblocked.' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to unblock IP.' });
  }
};

// PATCH /api/admin/blocked-ips/:id/permanent
const permanentBlock = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE blocked_ips SET permanent = TRUE WHERE id = ?`, [id]);
    return res.json({ message: 'IP permanently blocked.' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to permanently block IP.' });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query(`SELECT COUNT(*) as total_users FROM users`);
    const [[{ total_logs }]] = await pool.query(`SELECT COUNT(*) as total_logs FROM activity_logs`);
    const [[{ failed_today }]] = await pool.query(
      `SELECT COUNT(*) as failed_today FROM activity_logs 
       WHERE event_type = 'LOGIN_FAILURE' AND DATE(timestamp) = CURDATE()`
    );
    const [[{ blocked_ips }]] = await pool.query(`SELECT COUNT(*) as blocked_ips FROM blocked_ips`);
    return res.json({ total_users, total_logs, failed_today, blocked_ips });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

module.exports = { getLogs, getUsers, toggleUser, getBlockedIPs, unblockIP, permanentBlock, getStats };
