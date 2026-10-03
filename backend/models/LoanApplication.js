const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: ['id_proof', 'address_proof', 'income_proof', 'bank_statement', 'other'],
    required: true,
  },
  docLabel: {
    type: String,
    default: 'Document',
  },
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  actionBy: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'subadmin', 'admin', 'system'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicantEmail: {
      type: String,
      required: true,
    },
    applicantPhone: {
      type: String,
    },
    branch: {
      type: String,
      default: 'Main Branch',
    },
    requestedAmount: {
      type: Number,
      required: [true, 'Requested loan amount is required'],
      min: [1000, 'Minimum loan amount is ₹1,000'],
    },
    tenureMonths: {
      type: Number,
      required: [true, 'Loan tenure in months is required'],
      min: [1, 'Minimum tenure is 1 month'],
      max: [60, 'Maximum tenure is 60 months'],
    },
    interestRate: {
      type: Number,
      default: 8.5, // 8.5% annual interest
    },
    monthlyEmi: {
      type: Number,
      default: 0,
    },
    totalRepayment: {
      type: Number,
      default: 0,
    },
    loanPurpose: {
      type: String,
      required: [true, 'Loan purpose is required'],
      trim: true,
    },
    savingsBalanceAtApply: {
      type: Number,
      required: true,
      default: 0,
    },
    loanToSavingsRatio: {
      type: Number,
      default: 0,
    },
    maxAllowedRatio: {
      type: Number,
      default: 3.0, // Default maximum allowable loan is 3x member's savings
    },
    isExceedingRatio: {
      type: Boolean,
      default: false,
    },
    ratioFlagReason: {
      type: String,
    },
    documents: [documentSchema],
    documentPaths: [String], // Array of file path strings for simple reference as requested
    status: {
      type: String,
      enum: [
        'submitted',
        'subadmin_approved',
        'subadmin_rejected',
        'admin_approved',
        'admin_rejected',
      ],
      default: 'submitted',
      index: true,
    },
    currentStage: {
      type: String,
      enum: [
        'submitted',
        'branch_verification',
        'head_branch_review',
        'approved_and_disbursed',
        'rejected',
      ],
      default: 'branch_verification',
    },
    subadminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
      reviewerName: String,
      status: {
        type: String,
        enum: ['approved', 'rejected', 'pending'],
        default: 'pending',
      },
      remarks: String,
      reviewedAt: Date,
    },
    adminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
      reviewerName: String,
      status: {
        type: String,
        enum: ['approved', 'rejected', 'pending'],
        default: 'pending',
      },
      remarks: String,
      reviewedAt: Date,
      disbursementDate: Date,
    },
    timeline: [timelineEventSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation hook for EMI, Ratio, and Application ID
loanApplicationSchema.pre('save', function (next) {
  if (!this.applicationId) {
    this.applicationId = 'LOAN-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
  }

  // Calculate EMI if not calculated
  if (this.requestedAmount && this.tenureMonths) {
    const principal = this.requestedAmount;
    const monthlyRate = (this.interestRate || 8.5) / 12 / 100;
    const months = this.tenureMonths;
    
    if (monthlyRate > 0) {
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      this.monthlyEmi = Math.round(emi);
      this.totalRepayment = Math.round(emi * months);
    } else {
      this.monthlyEmi = Math.round(principal / months);
      this.totalRepayment = principal;
    }
  }

  // Calculate Loan-to-Savings ratio and flag check
  const savings = this.savingsBalanceAtApply || 0;
  if (savings > 0) {
    this.loanToSavingsRatio = Number((this.requestedAmount / savings).toFixed(2));
  } else {
    this.loanToSavingsRatio = 999; // infinite/very high if savings is 0
  }

  const maxRatio = this.maxAllowedRatio || 3.0;
  if (this.loanToSavingsRatio > maxRatio) {
    this.isExceedingRatio = true;
    this.ratioFlagReason = `High Risk: Loan requested (${this.requestedAmount}) is ${this.loanToSavingsRatio}x of member savings (${savings}), which exceeds the standard ${maxRatio}x limit.`;
  } else {
    this.isExceedingRatio = false;
    this.ratioFlagReason = `Normal Risk: Loan requested is ${this.loanToSavingsRatio}x of member savings (within ${maxRatio}x limit).`;
  }

  next();
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
