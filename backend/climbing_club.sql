
-- Database schema voor klimzaal management systeem
-- climbing_club.sql

-- Tabel voor niet-leden (jaarlijkse abonnees)
CREATE TABLE IF NOT EXISTS non_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    date_naissance DATE,
    assurance_type VARCHAR(20) NOT NULL CHECK (assurance_type IN ('base', 'base+', 'base++')),
    niveau_escalade VARCHAR(20) NOT NULL CHECK (niveau_escalade IN ('debutant', 'intermediaire', 'avance')),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel voor bezoeken/sessies
CREATE TABLE IF NOT EXISTS visites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    date_visite DATETIME DEFAULT CURRENT_TIMESTAMP,
    montant DECIMAL(10,2) NOT NULL,
    type_paiement VARCHAR(20) NOT NULL CHECK (type_paiement IN ('carte', 'especes', 'cheque', 'virement')),
    statut VARCHAR(20) DEFAULT 'confirme' CHECK (statut IN ('confirme', 'annule', 'en_attente', 'rembourse')),
    notes TEXT,
    session_type VARCHAR(30) DEFAULT 'escalade',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES non_members(id) ON DELETE CASCADE
);

-- Tabel voor tarieven (optioneel, voor flexibiliteit)
CREATE TABLE IF NOT EXISTS tarifs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_client VARCHAR(30) NOT NULL, -- 'non-membre', 'membre', 'enfant', etc.
    assurance_type VARCHAR(20),
    montant DECIMAL(10,2) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index voor performance
CREATE INDEX IF NOT EXISTS idx_non_members_email ON non_members(email);
CREATE INDEX IF NOT EXISTS idx_non_members_nom_prenom ON non_members(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_non_members_actif ON non_members(actif);
CREATE INDEX IF NOT EXISTS idx_visites_member_date ON visites(member_id, date_visite);
CREATE INDEX IF NOT EXISTS idx_visites_date ON visites(date_visite);
CREATE INDEX IF NOT EXISTS idx_visites_statut ON visites(statut);

-- Triggers pour automatische timestamps
CREATE TRIGGER IF NOT EXISTS update_non_members_timestamp 
AFTER UPDATE ON non_members
BEGIN
    UPDATE non_members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Sample data voor testen
INSERT OR IGNORE INTO non_members (nom, prenom, email, telephone, assurance_type, niveau_escalade, notes) VALUES
('Dubois', 'Marie', 'marie.dubois@example.com', '0123456789', 'base+', 'avance', 'Grimpeuse expérimentée'),
('Martin', 'Pierre', 'pierre.martin@example.com', '0987654321', 'base++', 'intermediaire', ''),
('Leroy', 'Sophie', 'sophie.leroy@example.com', '0147258369', 'base', 'debutant', 'Première année d'escalade'),
('Bernard', 'Jean', 'jean.bernard@example.com', '0369258147', 'base+', 'avance', 'Pratique depuis 5 ans'),
('Petit', 'Anne', 'anne.petit@example.com', '0258147369', 'base++', 'intermediaire', 'Préfère le boulder');

-- Sample tarifs
INSERT OR IGNORE INTO tarifs (type_client, assurance_type, montant, description) VALUES
('non-membre', 'base', 15.00, 'Séance escalade - assurance base'),
('non-membre', 'base+', 18.00, 'Séance escalade - assurance base+'),
('non-membre', 'base++', 20.00, 'Séance escalade - assurance base++'),
('membre', NULL, 0.00, 'Membre avec abonnement annuel'),
('enfant', 'base', 10.00, 'Séance enfant - moins de 16 ans');

-- Sample visites pour testing
INSERT OR IGNORE INTO visites (member_id, montant, type_paiement, notes) VALUES
(1, 18.00, 'carte', 'Séance du samedi matin'),
(1, 18.00, 'carte', 'Séance du mercredi soir'),
(2, 20.00, 'especes', 'Première visite'),
(3, 15.00, 'carte', 'Cours débutant'),
(4, 18.00, 'virement', 'Séance technique');
