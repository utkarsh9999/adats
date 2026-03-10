-- Create skills master table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create candidate_skills mapping table
CREATE TABLE IF NOT EXISTS candidate_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_candidate_skill (candidate_id, skill_id)
);

-- Insert initial skills data
INSERT IGNORE INTO skills (name) VALUES
('Java'), ('C#'), ('SQL'), ('Python'), ('Endur (Openlink)'), ('Allegro'), ('RightAngle'), 
('TriplePoint (ION)'), ('Aspect CTRM'), ('Enuit'), ('Brady CTRM'), ('ETRM'), ('CTRM'), 
('Physical Trading'), ('Derivatives Trading'), ('Risk Management'), ('Market Risk (VaR)'), ('Credit Risk'), 
('PnL Reporting'), ('Trade Lifecycle Management'), ('Hedging Strategies'), ('Deal Modeling'), ('AVS / JVS (Endur)'), 
('OpenJVS'), ('Report Builder'), ('Interfaces & Integration'), ('Data Migration'), ('System Implementation'), ('UAT Support');
