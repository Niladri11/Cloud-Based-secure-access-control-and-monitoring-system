const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id      INT AUTO_INCREMENT PRIMARY KEY,
        username     VARCHAR(100) NOT NULL UNIQUE,
        email        VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role         ENUM('user','admin') DEFAULT 'user',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active    BOOLEAN DEFAULT TRUE,
        failed_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        log_id      INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NULL,
        event_type  ENUM('LOGIN_SUCCESS','LOGIN_FAILURE','LOGOUT','ACCOUNT_LOCKED','REGISTER') NOT NULL,
        ip_address  VARCHAR(45),
        user_agent  VARCHAR(500),
        timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL UNIQUE,
        reason     VARCHAR(255),
        blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        permanent  BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('✅ Database tables initialized');
  } finally {
    conn.release();
  }
};

module.exports = { pool, initDB };
