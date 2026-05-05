import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'floor_plan') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Floor plan must be an image file.'));
            }
        } else if (file.fieldname === 'pdf') {
            if (file.mimetype !== 'application/pdf') {
                return cb(new Error('Introduction summary must be a PDF file.'));
            }
        }
        cb(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
}).fields([
    { name: 'floor_plan', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]);

export const validateWorkshopFiles = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        
        if (!req.files || !req.files['floor_plan'] || req.files['floor_plan'].length === 0) {
            return res.status(400).json({ message: 'Floor plan image is mandatory.' });
        }
        
        next();
    });
};
