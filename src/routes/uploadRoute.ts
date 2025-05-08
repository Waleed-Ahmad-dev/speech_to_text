import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { handleAudioUpload, UploadedAudioFile } from '../services/uploadService';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
     fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
     destination: (_req, _file, cb) => cb(null, uploadDir),
     filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}-${file.originalname}`);
     },
});

const upload = multer({ storage });

// POST /api/upload
router.post('/upload', upload.single('audio'), (req, res) => {
     try {
          const file = req.file as UploadedAudioFile;
          const result = handleAudioUpload(file);
          res.status(200).json(result);
     } catch (error: any) {
          res.status(400).json({ error: error.message });
     }
});

export default router;
