const Member = require('../models/Member');
const LoanApplication = require('../models/LoanApplication');

// @desc    Create a new Subadmin (Branch Manager) account
// @route   POST /api/admin/subadmins
// @access  Private (Admin only)
exports.createSubadmin = async (req, res) => {
  try {
    const { name, email, password, branch, phone } = req.body;

    if (!name || !email || !password || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and assigned branch.',
      });
    }

    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const subadmin = await Member.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      branch,
      role: 'subadmin',
      assignedBy: req.user._id,
      savingsBalance: 0,
    });

    return res.status(201).json({
      success: true,
      message: `Subadmin (${branch} Manager) created successfully!`,
      subadmin: {
        id: subadmin._id,
        name: subadmin.name,
        email: subadmin.email,
        branch: subadmin.branch,
        role: subadmin.role,
        isActive: subadmin.isActive,
        createdAt: subadmin.createdAt,
      },
    });
  } catch (error) {
    console.error('Create Subadmin Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subadmin account',
      error: error.message,
    });
  }
};

// @desc    Get all Subadmins list
// @route   GET /api/admin/subadmins
// @access  Private (Admin only)
exports.getSubadmins = async (req, res) => {
  try {
    const subadmins = await Member.find({ role: 'subadmin' })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subadmins.length,
      subadmins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subadmins list',
      error: error.message,
    });
  }
};

// @desc    Toggle Subadmin active status
// @route   PATCH /api/admin/subadmins/:id/toggle-status
// @access  Private (Admin only)
exports.toggleSubadminStatus = async (req, res) => {
  try {
    const subadmin = await Member.findById(req.params.id);

    if (!subadmin || subadmin.role !== 'subadmin') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin account not found',
      });
    }

    subadmin.isActive = !subadmin.isActive;
    await subadmin.save();

    return res.status(200).json({
      success: true,
      message: `Subadmin account ${subadmin.isActive ? 'activated' : 'deactivated'} successfully.`,
      subadmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update subadmin status',
      error: error.message,
    });
  }
};

// @desc    Delete a Subadmin account
// @route   DELETE /api/admin/subadmins/:id
// @access  Private (Admin only)
exports.deleteSubadmin = async (req, res) => {
  try {
    const subadmin = await Member.findById(req.params.id);

    if (!subadmin || subadmin.role !== 'subadmin') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin account not found',
      });
    }

    await Member.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Subadmin account removed successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subadmin',
      error: error.message,
    });
  }
};

// @desc    Get system-wide analytics & stats for Admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin or Subadmin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalApplications = await LoanApplication.countDocuments();
    const pendingBranchReview = await LoanApplication.countDocuments({ status: 'submitted' });
    const pendingHeadOfficeReview = await LoanApplication.countDocuments({ status: 'subadmin_approved' });
    const approvedLoansCount = await LoanApplication.countDocuments({ status: 'admin_approved' });
    const rejectedLoansCount = await LoanApplication.countDocuments({
      status: { $in: ['subadmin_rejected', 'admin_rejected'] },
    });
    const flaggedLoansCount = await LoanApplication.countDocuments({ isExceedingRatio: true });

    const totalMembers = await Member.countDocuments({ role: 'user' });
    const totalSubadmins = await Member.countDocuments({ role: 'subadmin' });

    // Aggregate total amount disbursed
    const disbursedAggregation = await LoanApplication.aggregate([
      { $match: { status: 'admin_approved' } },
      { $group: { _id: null, totalAmount: { $sum: '$requestedAmount' } } },
    ]);
    const totalDisbursedAmount = disbursedAggregation.length > 0 ? disbursedAggregation[0].totalAmount : 0;

    // Aggregate total amount requested
    const requestedAggregation = await LoanApplication.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$requestedAmount' } } },
    ]);
    const totalRequestedAmount = requestedAggregation.length > 0 ? requestedAggregation[0].totalAmount : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        pendingBranchReview,
        pendingHeadOfficeReview,
        approvedLoansCount,
        rejectedLoansCount,
        flaggedLoansCount,
        totalMembers,
        totalSubadmins,
        totalDisbursedAmount,
        totalRequestedAmount,
      },
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};
