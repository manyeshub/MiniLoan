const express = require('express');
const router = express.Router();
const {
  applyLoan,
  getMyLoans,
  getLoanById,
  getBranchLoans,
  subadminReviewLoan,
  getAllLoans,
  adminReviewLoan,
  updateLoanStatus,
} = require('../controllers/loanController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadLoanDocuments } = require('../middlewares/uploadMiddleware');

// Member routes
router.post('/apply', protect, authorize('user'), uploadLoanDocuments, applyLoan);
router.get('/my-applications', protect, authorize('user'), getMyLoans);

// Subadmin / Branch Officer routes
router.get('/branch-review', protect, authorize('subadmin', 'admin'), getBranchLoans);
router.patch('/:id/subadmin-review', protect, authorize('subadmin', 'admin'), subadminReviewLoan);

// Admin (Head Office) routes
router.get('/all', protect, authorize('admin'), getAllLoans);
router.patch('/:id/admin-review', protect, authorize('admin'), adminReviewLoan);

// Generic PATCH status route (specified in requirements deliverables)
router.patch('/:id/status', protect, authorize('subadmin', 'admin'), updateLoanStatus);

// Single loan retrieval route
router.get('/:id', protect, getLoanById);

module.exports = router;
