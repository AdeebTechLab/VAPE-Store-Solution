const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use absolute path for uploads relative to backend root
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
});

// File filter - allow all image types
const fileFilter = (req, file, cb) => {
    // Accept any file that starts with 'image/'
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
    fileFilter: fileFilter,
});

module.exports = upload;
