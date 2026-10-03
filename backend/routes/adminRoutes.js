const express = require('express');
const router = express.Router();
const {
  createSubadmin,
  getSubadmins,
  toggleSubadminStatus,
  deleteSubadmin,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Dashboard statistics (accessible by admin & subadmin for metrics overview)
router.get('/stats', protect, authorize('admin', 'subadmin'), getDashboardStats);

// Subadmin authorization management (Admin only)
router.post('/subadmins', protect, authorize('admin'), createSubadmin);
router.get('/subadmins', protect, authorize('admin'), getSubadmins);
router.patch('/subadmins/:id/toggle-status', protect, authorize('admin'), toggleSubadminStatus);
router.delete('/subadmins/:id', protect, authorize('admin'), deleteSubadmin);

module.exports = router;
