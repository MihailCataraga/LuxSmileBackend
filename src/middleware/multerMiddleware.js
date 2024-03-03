const multer = require('multer');

//Configurare multer disk storage
const storage = multer.diskStorage({
    destination: 'src/database/img/',
    filename: (req, file, callback) => {
        const fileName = file.originalname;
        callback(null, fileName);
    }
});

// Validare fisiere pentru upload
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpg') {
        callback(null, true);
    } else {
        callback(new Error('Sunt permise doar fișiere JPG'), false);
    }
};

// Config multer pentru file upload
exports.upload = multer({
    storage,
    fileFilter,
});