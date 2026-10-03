const LoanApplication = require('../models/LoanApplication');
const Member = require('../models/Member');

// @desc    Apply for a new loan with supporting documents (Multer)
// @route   POST /api/loans/apply
// @access  Private (Member)
exports.applyLoan = async (req, res) => {
  try {
    const { requestedAmount, tenureMonths, loanPurpose, interestRate, branch } = req.body;

    if (!requestedAmount || !tenureMonths || !loanPurpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide requestedAmount, tenureMonths, and loanPurpose.',
      });
    }

    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Process uploaded documents from multer
    const documents = [];
    const documentPaths = [];

    if (req.files) {
      const fileKeys = ['idProof', 'incomeProof', 'bankStatement', 'addressProof'];
      
      fileKeys.forEach((key) => {
        if (req.files[key] && req.files[key].length > 0) {
          const file = req.files[key][0];
          const docType = key === 'idProof' ? 'id_proof' :
                          key === 'incomeProof' ? 'income_proof' :
                          key === 'bankStatement' ? 'bank_statement' : 'address_proof';
          
          const relativePath = `/uploads/${file.filename}`;
          documents.push({
            docType,
            docLabel: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            originalName: file.originalname,
            fileName: file.filename,
            filePath: relativePath,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date(),
          });
          documentPaths.push(relativePath);
        }
      });

      // Handle generic multi-upload if present
      if (req.files.documents && req.files.documents.length > 0) {
        req.files.documents.forEach((file) => {
          const relativePath = `/uploads/${file.filename}`;
          documents.push({
            docType: 'other',
            docLabel: file.originalname,
            originalName: file.originalname,
            fileName: file.filename,
            filePath: relativePath,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date(),
          });
          documentPaths.push(relativePath);
        });
      }
    }

    // At least one document is recommended
    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one supporting document (ID Proof, Income Proof, or Bank Statement).',
      });
    }

    const numAmount = Number(requestedAmount);
    const numTenure = Number(tenureMonths);
    const savingsAtApply = member.savingsBalance || 0;

    // Create loan application
    const loan = new LoanApplication({
      member: member._id,
      applicantName: member.name,
      applicantEmail: member.email,
      applicantPhone: member.phone || '',
      branch: branch || member.branch || 'Main Branch',
      requestedAmount: numAmount,
      tenureMonths: numTenure,
      interestRate: interestRate ? Number(interestRate) : 8.5,
      loanPurpose,
      savingsBalanceAtApply: savingsAtApply,
      documents,
      documentPaths,
      status: 'submitted',
      currentStage: 'branch_verification',
      timeline: [
        {
          status: 'Application Submitted',
          actionBy: member.name,
          role: 'user',
          message: `Application submitted for ₹${numAmount.toLocaleString()} (${numTenure} months) with ${documents.length} supporting document(s).`,
          timestamp: new Date(),
        },
      ],
    });

    await loan.save();

    return res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully and sent for Branch Verification!',
      loan,
    });
  } catch (error) {
    console.error('Apply Loan Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit loan application',
      error: error.message,
    });
  }
};

// @desc    Get all loans for current member
// @route   GET /api/loans/my-applications
// @access  Private (Member)
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await LoanApplication.find({ member: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: error.message,
    });
  }
};

// @desc    Get loan by ID
// @route   GET /api/loans/:id
// @access  Private
exports.getLoanById = async (req, res) => {
  try {
    const loan = await LoanApplication.findById(req.params.id)
      .populate('member', 'name email phone savingsBalance accountNumber branch');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' });
    }

    // Check authorization: Members can only see their own loans; subadmins and admins can see all
    if (
      req.user.role === 'user' &&
      loan.member._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this loan application',
      });
    }

    return res.status(200).json({
      success: true,
      loan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching loan details',
      error: error.message,
    });
  }
};

// @desc    Get loans for Subadmin (Branch Manager) review
// @route   GET /api/loans/branch-review
// @access  Private (Subadmin / Admin)
exports.getBranchLoans = async (req, res) => {
  try {
    let query = {};
    const { status, flaggedOnly } = req.query;

    if (req.user.role === 'subadmin' && req.user.branch && req.user.branch !== 'All Branches') {
      // Optional branch filtering
      query.branch = req.user.branch;
    }

    if (status) {
      query.status = status;
    }

    if (flaggedOnly === 'true') {
      query.isExceedingRatio = true;
    }

    const loans = await LoanApplication.find(query)
      .populate('member', 'name email phone savingsBalance accountNumber branch')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch branch applications',
      error: error.message,
    });
  }
};

// @desc    Subadmin (Branch Manager) reviews and verifies documents
// @route   PATCH /api/loans/:id/subadmin-review
// @access  Private (Subadmin / Admin)
exports.subadminReviewLoan = async (req, res) => {
  try {
    const { decision, remarks } = req.body; // decision: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'approve' or 'reject'.",
      });
    }

    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' });
    }

    if (loan.status !== 'submitted' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot review. Current application status is '${loan.status}'.`,
      });
    }

    if (decision === 'approve') {
      loan.status = 'subadmin_approved';
      loan.currentStage = 'head_branch_review';
      loan.subadminReview = {
        reviewedBy: req.user._id,
        reviewerName: req.user.name,
        status: 'approved',
        remarks: remarks || 'Documents verified and found authentic. Forwarded to Head Branch for final sanction.',
        reviewedAt: new Date(),
      };
      loan.timeline.push({
        status: 'Branch Verification Approved',
        actionBy: `${req.user.name} (Branch Manager - ${req.user.branch || 'Branch'})`,
        role: 'subadmin',
        message: `Verified supporting documents. Forwarded to Head Office for sanction. Remarks: ${remarks || 'All documents verified.'}`,
        timestamp: new Date(),
      });
    } else {
      loan.status = 'subadmin_rejected';
      loan.currentStage = 'rejected';
      loan.subadminReview = {
        reviewedBy: req.user._id,
        reviewerName: req.user.name,
        status: 'rejected',
        remarks: remarks || 'Application rejected during branch document verification.',
        reviewedAt: new Date(),
      };
      loan.timeline.push({
        status: 'Branch Verification Rejected',
        actionBy: `${req.user.name} (Branch Manager)`,
        role: 'subadmin',
        message: `Application rejected at branch level. Reason: ${remarks || 'Incomplete or unverified documents.'}`,
        timestamp: new Date(),
      });
    }

    await loan.save();

    return res.status(200).json({
      success: true,
      message: decision === 'approve' 
        ? 'Application verified and forwarded to Head Branch Admin!' 
        : 'Application rejected at branch level.',
      loan,
    });
  } catch (error) {
    console.error('Subadmin Review Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process branch review',
      error: error.message,
    });
  }
};

// @desc    Get all loans for Admin (Head Branch)
// @route   GET /api/loans/all
// @access  Private (Admin)
exports.getAllLoans = async (req, res) => {
  try {
    const { status, stage, flaggedOnly, search, branch } = req.query;
    let query = {};

    if (status) query.status = status;
    if (stage) query.currentStage = stage;
    if (branch && branch !== 'all') query.branch = branch;
    if (flaggedOnly === 'true') query.isExceedingRatio = true;

    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { applicantName: { $regex: search, $options: 'i' } },
        { applicantEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const loans = await LoanApplication.find(query)
      .populate('member', 'name email phone savingsBalance accountNumber branch')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch loan applications',
      error: error.message,
    });
  }
};

// @desc    Admin (Head Branch) Final Sanction & Disbursement Review
// @route   PATCH /api/loans/:id/admin-review
// @access  Private (Admin)
exports.adminReviewLoan = async (req, res) => {
  try {
    const { decision, remarks } = req.body; // decision: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'approve' or 'reject'.",
      });
    }

    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' });
    }

    if (decision === 'approve') {
      loan.status = 'admin_approved';
      loan.currentStage = 'approved_and_disbursed';
      loan.adminReview = {
        reviewedBy: req.user._id,
        reviewerName: req.user.name,
        status: 'approved',
        remarks: remarks || 'Loan sanctioned and approved for disbursement by Head Office.',
        reviewedAt: new Date(),
        disbursementDate: new Date(),
      };
      loan.timeline.push({
        status: 'Head Branch Sanctioned & Disbursed',
        actionBy: `${req.user.name} (Head Office Admin)`,
        role: 'admin',
        message: `Final approval granted! Loan of ₹${loan.requestedAmount.toLocaleString()} sanctioned. Remarks: ${remarks || 'Approved and ready for disbursement.'}`,
        timestamp: new Date(),
      });
    } else {
      loan.status = 'admin_rejected';
      loan.currentStage = 'rejected';
      loan.adminReview = {
        reviewedBy: req.user._id,
        reviewerName: req.user.name,
        status: 'rejected',
        remarks: remarks || 'Loan rejected by Head Office.',
        reviewedAt: new Date(),
      };
      loan.timeline.push({
        status: 'Head Branch Rejected',
        actionBy: `${req.user.name} (Head Office Admin)`,
        role: 'admin',
        message: `Final sanction rejected by Head Branch. Reason: ${remarks || 'Did not meet credit society risk criteria.'}`,
        timestamp: new Date(),
      });
    }

    await loan.save();

    return res.status(200).json({
      success: true,
      message: decision === 'approve'
        ? `Loan #${loan.applicationId} approved and sanctioned successfully!`
        : `Loan #${loan.applicationId} rejected.`,
      loan,
    });
  } catch (error) {
    console.error('Admin Review Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process head branch review',
      error: error.message,
    });
  }
};

// @desc    Generic PATCH status endpoint (as specifically mentioned in requirements sheet PATCH /loans/:id/status)
// @route   PATCH /api/loans/:id/status
// @access  Private (Officer: Subadmin or Admin)
exports.updateLoanStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' });
    }

    const validStatuses = [
      'submitted',
      'subadmin_approved',
      'subadmin_rejected',
      'admin_approved',
      'admin_rejected',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    loan.status = status;
    if (status.includes('approved')) {
      loan.currentStage = status === 'admin_approved' ? 'approved_and_disbursed' : 'head_branch_review';
    } else if (status.includes('rejected')) {
      loan.currentStage = 'rejected';
    }

    loan.timeline.push({
      status: `Status updated to ${status}`,
      actionBy: `${req.user.name} (${req.user.role})`,
      role: req.user.role,
      message: remarks || `Status manually updated to ${status}`,
      timestamp: new Date(),
    });

    await loan.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      loan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};
