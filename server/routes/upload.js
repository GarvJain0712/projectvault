import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

const dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(dirname, '..', 'uploads');

/*
 * The cloudinary package parses CLOUDINARY_URL the moment it is imported and
 * throws if the value is malformed — which would take the whole server down
 * over a typo in .env. So we validate the shape first and only import it when
 * the value looks right, falling back to disk storage otherwise.
 */
const rawCloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();
const looksValid = /^cloudinary:\/\/[^:]+:[^@]+@.+$/.test(rawCloudinaryUrl);

if (rawCloudinaryUrl && !looksValid) {
  console.warn('\n[upload] CLOUDINARY_URL is set but malformed — falling back to disk storage.');
  console.warn('[upload] Expected: cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
  console.warn('[upload] Check you did not paste the "CLOUDINARY_URL=" prefix twice.\n');
}

const USE_CLOUDINARY = looksValid;

let cloudinary = null;
if (USE_CLOUDINARY) {
  ({ v2: cloudinary } = await import('cloudinary'));
  cloudinary.config({ secure: true });
}

const maxMb = Number(process.env.MAX_UPLOAD_MB || 200);

/**
 * Keep the file in memory when heading to Cloudinary (we stream it straight
 * through), write it to disk otherwise.
 */
const storage = USE_CLOUDINARY
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        // Strip anything risky and keep the extension.
        const ext = path.extname(file.originalname).slice(0, 10);
        const base = path
          .basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9-_]/g, '_')
          .slice(0, 60);
        cb(null, `${Date.now()}_${base}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^(video|image)\//.test(file.mimetype);
    cb(ok ? null : new Error('Only video and image uploads are allowed'), ok);
  },
});

/** Push an in-memory buffer to Cloudinary and resolve with the result. */
function uploadToCloudinary(buffer, resourceType) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: 'projectvault' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

/*
 * POST /api/upload
 * Body: multipart/form-data with a single "file" field.
 * Returns: { url, name, size, duration, provider }
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file received' });

    const isVideo = req.file.mimetype.startsWith('video/');

    if (USE_CLOUDINARY) {
      const result = await uploadToCloudinary(req.file.buffer, isVideo ? 'video' : 'image');
      return res.status(201).json({
        url: result.secure_url,
        name: req.file.originalname,
        size: req.file.size,
        duration: Math.round(result.duration || 0),
        provider: 'cloudinary',
      });
    }

    const base = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`).replace(
      /\/$/,
      ''
    );
    return res.status(201).json({
      url: `${base}/uploads/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
      duration: 0, // the browser measures this before uploading
      provider: 'disk',
    });
  } catch (error) {
    return next(error);
  }
});

/** True when uploads are going to Cloudinary rather than local disk. */
export function isCloudinaryActive() {
  return USE_CLOUDINARY;
}

export default router;
