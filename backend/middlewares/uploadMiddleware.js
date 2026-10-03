const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique sanitized filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const ext = path.extname(sanitizedOriginal) || '.pdf';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed file extensions / mime types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF, JPG, PNG, WEBP, and DOC files are allowed.'));
  }
};

// Multer upload instance with 10MB limit per file
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter,
});

// Multi-file field upload middleware for loan documents
const uploadLoanDocuments = upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'incomeProof', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'documents', maxCount: 5 }, // Fallback generic multi-document field
]);

module.exports = {
  upload,
  uploadLoanDocuments,
};
