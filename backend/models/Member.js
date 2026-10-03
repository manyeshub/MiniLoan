const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Hidden by default on queries
    },
    role: {
      type: String,
      enum: ['user', 'subadmin', 'admin'],
      default: 'user',
    },
    branch: {
      type: String,
      default: 'Main Branch',
      trim: true,
    },
    accountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    savingsBalance: {
      type: Number,
      default: 25000, // Default savings balance for credit society member
      min: [0, 'Savings balance cannot be negative'],
    },
    membershipDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null, // For subadmins created by an admin
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Auto-generate membership account number if not present
  if (!this.accountNumber && this.role === 'user') {
    this.accountNumber = 'MEM-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

// Compare password method
memberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);
