const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, checkBlockedIP } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', checkBlockedIP, loginLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
