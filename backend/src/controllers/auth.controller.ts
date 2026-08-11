import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'comix_jwt_secret_key_2026';
const SALT_ROUNDS = 10;

function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, name, email, phone, password, isDeaf, isBlind, needsLargeText } = req.body;

    if (!username || !name || !email || !password) {
      res.status(400).json({ error: 'Логин, аты, email және құпиясөз міндетті' });
      return;
    }

    if (password.length < 5) {
      res.status(400).json({ error: 'Құпиясөз кемінде 5 таңбадан тұруы керек' });
      return;
    }

    // Check existing user by username or email
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Бұл логин немесе email тіркелген' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, name, email, phone, password_hash, role, is_deaf, is_blind, needs_large_text)
       VALUES ($1, $2, $3, $4, $5, 'user', $6, $7, $8)
       RETURNING id, username, name, email, phone, role, is_deaf, is_blind, needs_large_text, created_at`,
      [username, name, email, phone || null, passwordHash, isDeaf || false, isBlind || false, needsLargeText || false]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { login: loginInput, password } = req.body;

    if (!loginInput || !password) {
      res.status(400).json({ error: 'Логин мен құпиясөзді енгізіңіз' });
      return;
    }

    // Login by username or email
    const result = await pool.query(
      `SELECT id, username, name, email, phone, password_hash, role, is_deaf, is_blind, needs_large_text, created_at
       FROM users WHERE username = $1 OR email = $1`,
      [loginInput]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Логин немесе құпиясөз дұрыс емес' });
      return;
    }

    const user = result.rows[0];

    // pgcrypto crypt() creates hashes starting with $2a$, bcrypt.compare handles both $2a$ and $2b$
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'Логин немесе құпиясөз дұрыс емес' });
      return;
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(user.id, user.role);

    res.json({ user: safeUser, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      'SELECT id, username, name, email, phone, role, is_deaf, is_blind, needs_large_text, custom_prompt, theme, audio_enabled, high_contrast, haptic_enabled, audio_speed, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Пайдаланушы табылмады' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { 
      name, isDeaf, isBlind, needsLargeText, customPrompt,
      theme, audioEnabled, highContrast, hapticEnabled, audioSpeed 
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Аты-жөні міндетті түрде көрсетілуі керек' });
      return;
    }

    const result = await pool.query(
      `UPDATE users 
       SET name = $1, is_deaf = $2, is_blind = $3, needs_large_text = $4, 
           custom_prompt = $5,
           theme = $6, audio_enabled = $7, high_contrast = $8, haptic_enabled = $9, audio_speed = $10,
           updated_at = NOW() 
       WHERE id = $11 
       RETURNING id, username, name, email, phone, role, is_deaf, is_blind, needs_large_text, custom_prompt, theme, audio_enabled, high_contrast, haptic_enabled, audio_speed, created_at`,
      [
        name, isDeaf || false, isBlind || false, needsLargeText || false,
        customPrompt || null,
        theme || 'dark', 
        audioEnabled !== undefined ? audioEnabled : true, 
        highContrast || false, 
        hapticEnabled !== undefined ? hapticEnabled : true, 
        audioSpeed || '1',
        userId
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Пайдаланушы табылмады' });
      return;
    }

    res.json({ user: result.rows[0], success: true });
  } catch (error) {
    console.error('Update Profile error:', error);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
}
