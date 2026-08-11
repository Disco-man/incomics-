-- ============================================================
-- ComixAccess Database Schema
-- ============================================================

-- Enable pgcrypto for password hashing in seeds
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_deaf BOOLEAN DEFAULT false,
  is_blind BOOLEAN DEFAULT false,
  needs_large_text BOOLEAN DEFAULT false,
  custom_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comics table
CREATE TABLE IF NOT EXISTS comics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255),
  total_pages INTEGER NOT NULL,
  language VARCHAR(10) DEFAULT 'kk',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comic pages table
CREATE TABLE IF NOT EXISTS comic_pages (
  id SERIAL PRIMARY KEY,
  comic_id INTEGER REFERENCES comics(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  audio_path VARCHAR(255),
  description TEXT,
  UNIQUE(comic_id, page_number)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comic_id INTEGER REFERENCES comics(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, comic_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comic_id INTEGER REFERENCES comics(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, comic_id, page_number)
);

-- ============================================================
-- Seed: Default users
-- Admin: torgyn / 12345
-- User:  user1  / 12345
-- ============================================================

INSERT INTO users (username, name, email, password_hash, role, is_deaf, is_blind, needs_large_text)
VALUES
  (
    'torgyn',
    'Торғын (Админ)',
    'torgyn@comix.kz',
    crypt('12345', gen_salt('bf', 10)),
    'admin',
    false,
    false,
    false
  ),
  (
    'user1',
    'Қолданушы 1',
    'user1@comix.kz',
    crypt('12345', gen_salt('bf', 10)),
    'user',
    true,
    false,
    true
  )
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- Seed: Demo comic "Жаңа Дүние"
-- ============================================================

INSERT INTO comics (title, description, cover_image, total_pages, language, is_published)
VALUES (
  'Жаңа Дүние',
  'Аудио озвучка, сурет сипаттамасы, screen reader қолдауымен. Зағип және саңырау оқырмандарға бейімделген.',
  '/img/1.png',
  16,
  'kk',
  true
) ON CONFLICT DO NOTHING;

-- Insert comic pages for "Жаңа Дүние"
INSERT INTO comic_pages (comic_id, page_number, image_path, audio_path, description) VALUES
(1, 1,  '/img/1.png',  NULL,             'Бірінші бет: Жаңа күн таңы. Қала оянып келеді.'),
(1, 2,  '/img/2.png',  '/sounds/2.mp3',  'Екінші бет: Бас кейіпкер үйінен шығады.'),
(1, 3,  '/img/3.png',  '/sounds/3.mp3',  'Үшінші бет: Көшеде таңғаларлық бір нәрсені байқайды.'),
(1, 4,  '/img/4.png',  '/sounds/4.mp3',  'Төртінші бет: Ол жақынырақ барып қарайды.'),
(1, 5,  '/img/5.png',  '/sounds/5.mp3',  'Бесінші бет: Кенеттен жерасты дыбысы естіледі.'),
(1, 6,  '/img/6.png',  '/sounds/6.mp3',  'Алтыншы бет: Жерден жарық шығады.'),
(1, 7,  '/img/7.png',  '/sounds/7.mp3',  'Жетінші бет: Кейіпкер артқа шегінеді.'),
(1, 8,  '/img/8.png',  '/sounds/8.mp3',  'Сегізінші бет: Жарық күшейе түседі.'),
(1, 9,  '/img/9.png',  '/sounds/9.mp3',  'Тоғызыншы бет: Жерден бір зат шығады.'),
(1, 10, '/img/10.png', '/sounds/10.mp3', 'Оныншы бет: Зат ашылып, хабар береді.'),
(1, 11, '/img/11.png', '/sounds/11.mp3', 'Он бірінші бет: Кейіпкер таңданады.'),
(1, 12, '/img/12.png', '/sounds/12.mp3', 'Он екінші бет: Ол шешім қабылдайды.'),
(1, 13, '/img/13.png', '/sounds/13.mp3', 'Он үшінші бет: Жаңа сапарға аттанады.'),
(1, 14, '/img/14.png', '/sounds/14.mp3', 'Он төртінші бет: Алдымен бір кедергіге тап болады.'),
(1, 15, '/img/15.png', NULL,             'Он бесінші бет: Кедергіні жеңіп өтеді.'),
(1, 16, '/img/16.png', NULL,             'Он алтыншы бет: Жаңа дүниеге қадам басады — соңы.')
ON CONFLICT DO NOTHING;
