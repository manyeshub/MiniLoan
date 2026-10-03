const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

// Helper to generate JWT Token
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'secret_key_microloan_itm_2026';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new member
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, branch, savingsBalance } = req.body;

    // Check if user already exists
    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'A member with this email address is already registered.',
      });
    }

    // Default savings balance if not provided
    const initialSavings = Number(savingsBalance) >= 0 ? Number(savingsBalance) : 25000;

    // Create user (role always defaults to 'user' on public register)
    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      branch: branch || 'Main Branch',
      savingsBalance: initialSavings,
      role: 'user',
    });

    const token = generateToken(member._id);

    return res.status(201).json({
      success: true,
      message: 'Member registered successfully!',
      token,
      user: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        branch: member.branch,
        accountNumber: member.accountNumber,
        savingsBalance: member.savingsBalance,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Login Member / Subadmin / Admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for member and include password for verification
    const member = await Member.findOne({ email: email.toLowerCase() }).select('+password');

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!member.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the Head Branch administrator.',
      });
    }

    // Check password
    const isMatch = await member.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // If a portal requires a specific role (e.g. /admin requires admin, /subadmin requires subadmin)
    if (requiredRole && member.role !== requiredRole && !(requiredRole === 'subadmin' && member.role === 'admin')) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized portal access. This portal requires '${requiredRole}' privileges. Your account role is '${member.role}'.`,
      });
    }

    const token = generateToken(member._id);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${member.name}!`,
      token,
      user: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        branch: member.branch,
        accountNumber: member.accountNumber,
        savingsBalance: member.savingsBalance,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        branch: member.branch,
        accountNumber: member.accountNumber,
        savingsBalance: member.savingsBalance,
        membershipDate: member.membershipDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Deposit / Update Member Savings Balance (useful for testing eligibility changes)
// @route   PATCH /api/auth/savings
// @access  Private (User or Admin)
exports.updateSavingsBalance = async (req, res) => {
  try {
    const { amount, action } = req.body; // action: 'deposit', 'set'
    const targetUserId = req.body.userId || req.user.id;

    const member = await Member.findById(targetUserId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ success: false, message: 'Invalid savings amount provided' });
    }

    if (action === 'set') {
      member.savingsBalance = numAmount;
    } else {
      // default deposit
      member.savingsBalance += numAmount;
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Savings balance updated to ₹${member.savingsBalance.toLocaleString()}`,
      savingsBalance: member.savingsBalance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating savings balance',
      error: error.message,
    });
  }
};
