const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const LoanApplication = require('./models/LoanApplication');

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ Please define MONGO_URI in your .env file before running seed script.');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing collections
    await Member.deleteMany({});
    await LoanApplication.deleteMany({});
    console.log('🧹 Cleaned existing members and loans.');

    // 1. Create Admin Account (Head Office)
    const admin = await Member.create({
      name: 'Dr. Rajesh Sharma (Head Branch Director)',
      email: 'admin@microloan.com',
      password: 'admin123',
      role: 'admin',
      branch: 'Head Office - Central',
      phone: '+91 98200 11223',
      savingsBalance: 0,
    });
    console.log('👑 Admin user created: admin@microloan.com / admin123');

    // 2. Create Subadmin (Branch Manager)
    const subadmin = await Member.create({
      name: 'Priya Verma (Branch Manager)',
      email: 'subadmin@microloan.com',
      password: 'subadmin123',
      role: 'subadmin',
      branch: 'Downtown Mumbai Branch',
      phone: '+91 98111 22334',
      savingsBalance: 0,
      assignedBy: admin._id,
    });
    console.log('🏢 Subadmin user created: subadmin@microloan.com / subadmin123 (Downtown Mumbai Branch)');

    // 3. Create Additional Subadmin
    const subadmin2 = await Member.create({
      name: 'Amit Patel (North Branch Officer)',
      email: 'subadmin2@microloan.com',
      password: 'subadmin123',
      role: 'subadmin',
      branch: 'North Suburb Branch',
      phone: '+91 98333 44556',
      savingsBalance: 0,
      assignedBy: admin._id,
    });
    console.log('🏢 Subadmin 2 created: subadmin2@microloan.com / subadmin123 (North Suburb Branch)');

    // 4. Create Standard Members (Borrowers)
    const member1 = await Member.create({
      name: 'Rahul Deshmukh',
      email: 'rahul@gmail.com',
      password: 'user123',
      role: 'user',
      branch: 'Downtown Mumbai Branch',
      phone: '+91 99887 66554',
      savingsBalance: 50000, // ₹50,000 savings
      accountNumber: 'MEM-104829',
    });

    const member2 = await Member.create({
      name: 'Sunita Patil',
      email: 'sunita@gmail.com',
      password: 'user123',
      role: 'user',
      branch: 'Downtown Mumbai Branch',
      phone: '+91 98765 43210',
      savingsBalance: 20000, // ₹20,000 savings
      accountNumber: 'MEM-209418',
    });

    console.log('👤 Member users created: rahul@gmail.com / user123 (₹50k savings) & sunita@gmail.com / user123 (₹20k savings)');

    // 5. Create Sample Loan Applications to demonstrate workflow stages
    // Loan 1: Standard eligible loan pending Branch Review
    await LoanApplication.create({
      member: member1._id,
      applicantName: member1.name,
      applicantEmail: member1.email,
      applicantPhone: member1.phone,
      branch: member1.branch,
      requestedAmount: 75000, // Ratio: 75000/50000 = 1.5x (Safe, within 3.0x)
      tenureMonths: 12,
      interestRate: 8.5,
      loanPurpose: 'Small Grocery Shop Inventory Expansion',
      savingsBalanceAtApply: member1.savingsBalance,
      documents: [
        {
          docType: 'id_proof',
          docLabel: 'Aadhar Card (UIDAI)',
          originalName: 'aadhar_card_rahul.pdf',
          fileName: 'aadhar_card_rahul.pdf',
          filePath: '/uploads/sample_doc.pdf',
          fileSize: 102400,
          mimeType: 'application/pdf',
        },
        {
          docType: 'income_proof',
          docLabel: 'Shop Income Certificate',
          originalName: 'income_proof.pdf',
          fileName: 'income_proof.pdf',
          filePath: '/uploads/sample_doc.pdf',
          fileSize: 204800,
          mimeType: 'application/pdf',
        },
      ],
      documentPaths: ['/uploads/sample_doc.pdf'],
      status: 'submitted',
      currentStage: 'branch_verification',
      timeline: [
        {
          status: 'Application Submitted',
          actionBy: member1.name,
          role: 'user',
          message: 'Member submitted loan application for ₹75,000 (12 months tenure).',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        },
      ],
    });

    // Loan 2: Loan that exceeded savings ratio (> 3x) and was approved by subadmin -> now awaiting Head Office final approval
    await LoanApplication.create({
      member: member2._id,
      applicantName: member2.name,
      applicantEmail: member2.email,
      applicantPhone: member2.phone,
      branch: member2.branch,
      requestedAmount: 90000, // Ratio: 90000/20000 = 4.5x (Exceeds 3.0x -> Flagged!)
      tenureMonths: 24,
      interestRate: 8.5,
      loanPurpose: 'Handicraft Workshop Equipment',
      savingsBalanceAtApply: member2.savingsBalance,
      documents: [
        {
          docType: 'id_proof',
          docLabel: 'PAN Card Copy',
          originalName: 'pan_card_sunita.jpg',
          fileName: 'pan_card_sunita.jpg',
          filePath: '/uploads/sample_doc.pdf',
          fileSize: 154000,
          mimeType: 'image/jpeg',
        },
        {
          docType: 'bank_statement',
          docLabel: 'Bank Statement 6 Months',
          originalName: 'bank_statement.pdf',
          fileName: 'bank_statement.pdf',
          filePath: '/uploads/sample_doc.pdf',
          fileSize: 524000,
          mimeType: 'application/pdf',
        },
      ],
      documentPaths: ['/uploads/sample_doc.pdf'],
      status: 'subadmin_approved',
      currentStage: 'head_branch_review',
      subadminReview: {
        reviewedBy: subadmin._id,
        reviewerName: subadmin.name,
        status: 'approved',
        remarks: 'Physical workshop and supporting documents verified at Downtown Branch. High ratio noted due to sound seasonal sales turnover. Recommended to Head Office.',
        reviewedAt: new Date(Date.now() - 6 * 3600 * 1000),
      },
      timeline: [
        {
          status: 'Application Submitted',
          actionBy: member2.name,
          role: 'user',
          message: 'Member submitted loan application for ₹90,000 (24 months tenure). Flagged high ratio (4.5x).',
          timestamp: new Date(Date.now() - 48 * 3600 * 1000),
        },
        {
          status: 'Branch Verification Approved',
          actionBy: `${subadmin.name} (Downtown Branch Manager)`,
          role: 'subadmin',
          message: 'Verified physical documents. Forwarded to Head Office for sanction.',
          timestamp: new Date(Date.now() - 6 * 3600 * 1000),
        },
      ],
    });

    console.log('📑 Demo loan applications seeded successfully.');
    console.log('🎉 Seed database complete! You can now test all user roles.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
