import { Request, Response } from 'express';
import pool from '../config/database.js';

export async function getAllComics(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT id, title, description, cover_image, total_pages, language, created_at FROM comics WHERE is_published = true ORDER BY created_at DESC'
    );
    res.json({ comics: result.rows });
  } catch (error) {
    console.error('Get comics error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

export async function getAdminComics(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT id, title, description, cover_image, total_pages, language, is_published, created_at FROM comics ORDER BY created_at DESC'
    );
    res.json({ comics: result.rows });
  } catch (error) {
    console.error('Get admin comics error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

import fs from 'fs';
import path from 'path';

export async function deleteAdminComic(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    // Collect all file paths to delete
    const comicRes = await client.query('SELECT cover_image FROM comics WHERE id = $1', [id]);
    const pagesRes = await client.query('SELECT image_path, audio_path FROM comic_pages WHERE comic_id = $1', [id]);

    const filesToDelete: string[] = [];
    if (comicRes.rows[0]?.cover_image) filesToDelete.push(comicRes.rows[0].cover_image);
    for (const p of pagesRes.rows) {
      if (p.image_path) filesToDelete.push(p.image_path);
      if (p.audio_path) filesToDelete.push(p.audio_path);
    }

    // Delete DB records
    await client.query('DELETE FROM reading_progress WHERE comic_id = $1', [id]);
    await client.query('DELETE FROM comic_pages WHERE comic_id = $1', [id]);
    await client.query('DELETE FROM comics WHERE id = $1', [id]);

    await client.query('COMMIT');

    // Delete physical files asynchronously (silently handle errors)
    filesToDelete.forEach(filePath => {
      if (filePath.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), 'uploads', filePath.replace('/uploads/', ''));
        fs.unlink(fullPath, (err) => {
          if (err && err.code !== 'ENOENT') console.log('Delete file error:', err.message);
        });
      }
    });

    res.json({ success: true, message: 'Комикс өшірілді' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete comic error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  } finally {
    client.release();
  }
}

export async function createOrUpdateComicWithPages(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const files = req.files as Express.Multer.File[] || [];
    const isPublished = req.body.isPublished === 'true';
    const title = req.body.title || 'Жаңа Комикс';
    const description = req.body.description || '';
    const language = req.body.language || 'kk';
    const totalPages = parseInt(req.body.totalPages || '0', 10);
    const existingId = req.body.id ? parseInt(req.body.id, 10) : null;
    let coverImage = req.body.existingCover || null;

    const coverFile = files.find(f => f.fieldname === 'cover_image');
    if (coverFile) {
      coverImage = `/uploads/${coverFile.filename}`;
    }

    let comicId = existingId;

    if (comicId) {
      await client.query(
        'UPDATE comics SET title=$1, description=$2, cover_image=$3, total_pages=$4, language=$5, is_published=$6 WHERE id=$7',
        [title, description, coverImage, totalPages, language, isPublished, comicId]
      );
      await client.query('DELETE FROM comic_pages WHERE comic_id = $1', [comicId]);
    } else {
      const result = await client.query(
        'INSERT INTO comics (title, description, cover_image, total_pages, language, is_published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [title, description, coverImage, totalPages, language, isPublished]
      );
      comicId = result.rows[0].id;
    }

    // Now insert pages
    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      const text = req.body[`page_${i}_text`] || '';
      
      let imagePath = req.body[`page_${i}_existing_image`] || '';
      const imageFile = files.find(f => f.fieldname === `page_${i}_image`);
      if (imageFile) imagePath = `/uploads/${imageFile.filename}`;

      let audioPath = req.body[`page_${i}_existing_audio`] || null;
      const audioFile = files.find(f => f.fieldname === `page_${i}_audio`);
      if (audioFile) audioPath = `/uploads/${audioFile.filename}`;
      if (audioPath === 'null' || audioPath === '') audioPath = null;

      await client.query(
        'INSERT INTO comic_pages (comic_id, page_number, image_path, audio_path, description) VALUES ($1, $2, $3, $4, $5)',
        [comicId, pageNum, imagePath, audioPath, text]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, id: comicId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Save comic error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  } finally {
    client.release();
  }
}

export async function getComicById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const comicResult = await pool.query(
      'SELECT id, title, description, cover_image, total_pages, language, is_published, created_at FROM comics WHERE id = $1',
      [id]
    );

    if (comicResult.rows.length === 0) {
      res.status(404).json({ error: 'Комикс табылмады' });
      return;
    }

    const pagesResult = await pool.query(
      'SELECT id, page_number, image_path, audio_path, description FROM comic_pages WHERE comic_id = $1 ORDER BY page_number ASC',
      [id]
    );

    res.json({ comic: comicResult.rows[0], pages: pagesResult.rows });
  } catch (error) {
    console.error('Get comic error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

export async function getReadingProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT current_page, completed, updated_at FROM reading_progress WHERE user_id = $1 AND comic_id = $2',
      [userId, id]
    );

    if (result.rows.length === 0) {
      res.json({ currentPage: 1, completed: false });
      return;
    }

    res.json({
      currentPage: result.rows[0].current_page,
      completed: result.rows[0].completed,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

export async function updateReadingProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { currentPage, completed } = req.body;

    await pool.query(
      `INSERT INTO reading_progress (user_id, comic_id, current_page, completed, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, comic_id)
       DO UPDATE SET current_page = $3, completed = $4, updated_at = NOW()`,
      [userId, id, currentPage, completed || false]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}
