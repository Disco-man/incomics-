import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { 
  getAllComics, getComicById, getReadingProgress, updateReadingProgress, 
  getAdminComics, createOrUpdateComicWithPages, deleteAdminComic
} from '../controllers/comic.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const upload = multer({ storage });

const router = Router();

// GET /api/comics/admin/list — list ALL comics (draft + published)
router.get('/admin/list', authMiddleware, adminMiddleware, getAdminComics);

// POST /api/comics/admin/save — create or update comic with pages using FormData
router.post('/admin/save', authMiddleware, adminMiddleware, upload.any(), createOrUpdateComicWithPages);

// DELETE /api/comics/admin/:id — delete comic completely
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteAdminComic);

// GET /api/comics — list all comics (public)
router.get('/', getAllComics);

// GET /api/comics/:id — get comic with pages (public)
router.get('/:id', getComicById);

// GET /api/comics/:id/progress — reading progress (protected)
router.get('/:id/progress', authMiddleware, getReadingProgress);

// PUT /api/comics/:id/progress — update reading progress (protected)
router.put('/:id/progress', authMiddleware, updateReadingProgress);

export default router;
