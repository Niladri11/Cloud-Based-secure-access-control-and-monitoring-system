const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getLogs, getUsers, toggleUser,
  getBlockedIPs, unblockIP, permanentBlock, getStats,
} = require('../controllers/adminController');

// All admin routes require a valid JWT + admin role
router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/logs', getLogs);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.get('/blocked-ips', getBlockedIPs);
router.delete('/blocked-ips/:id', unblockIP);
router.patch('/blocked-ips/:id/permanent', permanentBlock);

module.exports = router;
