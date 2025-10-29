-- Bible translations table
CREATE TABLE IF NOT EXISTS bible_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(100) NOT NULL,
    year INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bible verses table
CREATE TABLE IF NOT EXISTS bible_verses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book VARCHAR(100) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    translation VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book, chapter, verse, translation)
);

-- Bible books table
CREATE TABLE IF NOT EXISTS bible_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    abbreviation VARCHAR(10),
    testament VARCHAR(20) NOT NULL CHECK (testament IN ('old', 'new')),
    chapter_count INTEGER NOT NULL,
    book_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_bible_verses_book ON bible_verses(book);
CREATE INDEX idx_bible_verses_translation ON bible_verses(translation);
CREATE INDEX idx_bible_verses_lookup ON bible_verses(book, chapter, verse, translation);
CREATE INDEX idx_bible_books_testament ON bible_books(testament);
CREATE INDEX idx_bible_books_order ON bible_books(book_order);

-- Insert Bible translations
INSERT INTO bible_translations (code, name, language, year, is_active) VALUES
('NKJV', 'New King James Version', 'English', 1982, true),
('NIV', 'New International Version', 'English', 2011, true),
('KJV', 'King James Version', 'English', 1611, true),
('ESV', 'English Standard Version', 'English', 2001, true),
('NLT', 'New Living Translation', 'English', 1996, true);

-- Insert some Bible books
INSERT INTO bible_books (name, abbreviation, testament, chapter_count, book_order) VALUES
('Genesis', 'Gen', 'old', 50, 1),
('Exodus', 'Exo', 'old', 40, 2),
('Psalms', 'Psa', 'old', 150, 19),
('Proverbs', 'Pro', 'old', 31, 20),
('Matthew', 'Mat', 'new', 28, 40),
('John', 'Jhn', 'new', 21, 43),
('Romans', 'Rom', 'new', 16, 45),
('Philippians', 'Php', 'new', 4, 50),
('Hebrews', 'Heb', 'new', 13, 58),
('Revelation', 'Rev', 'new', 22, 66);

-- Insert sample verse (Philippians 4:13)
INSERT INTO bible_verses (book, chapter, verse, translation, text) VALUES
('Philippians', 4, 13, 'NKJV', 'I can do all things through Christ who strengthens me.');
