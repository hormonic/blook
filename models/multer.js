const multer = require('multer');

let storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

let fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

let upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Upload = module.exports = upload;