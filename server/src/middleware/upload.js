const multer = require('multer');

// Store in memory buffer (we upload directly to Cloudinary)
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and image files are allowed!'), false);
    }
};

const safeDocFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only documents and images are allowed.'), false);
    }
};

exports.uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadResume = multer({
    storage,
    fileFilter: pdfFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

exports.uploadFile = multer({
    storage,
    fileFilter: safeDocFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
