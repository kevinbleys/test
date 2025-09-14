-- Enhanced database setup for new features
-- Add these to your existing database

-- Table for tracking ALL access attempts (success + failures)
CREATE TABLE IF NOT EXISTS access_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    type TEXT NOT NULL, -- 'member_success', 'member_fail', 'non_member'  
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'membre_non_existant', 'membre_pas_encore_paye', 'pending', 'paid', 'cancelled'
    details TEXT, -- JSON string with additional info (age, level, amount, etc.)
    session_id TEXT, -- To track full sessions
    ip_address TEXT,
    user_agent TEXT
);

-- Table for returning visitors database (non-members who came before)
CREATE TABLE IF NOT EXISTS returning_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    dateNaissance TEXT NOT NULL,
    email TEXT,
    telephone TEXT,
    last_level TEXT, -- Their last chosen level
    last_tarif INTEGER, -- Their last calculated tarif
    first_visit TEXT NOT NULL DEFAULT (datetime('now')),
    last_visit TEXT NOT NULL DEFAULT (datetime('now')),
    visit_count INTEGER DEFAULT 1,
    UNIQUE(nom, prenom, dateNaissance) -- Prevent duplicates
);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_access_attempts_timestamp ON access_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_attempts_type ON access_attempts(type);
CREATE INDEX IF NOT EXISTS idx_returning_visitors_search ON returning_visitors(nom, prenom, dateNaissance);