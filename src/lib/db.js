import mysql from 'mysql2/promise'

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false // Hostinger MySQL typically doesn't require SSL
}

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Test connection
export async function testConnection() {
  try {
    console.log('Testing database connection with config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      ssl: dbConfig.ssl ? 'enabled' : 'disabled'
    })
    
    const connection = await pool.getConnection()
    console.log('Database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    console.error('Connection error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    })
    return false
  }
}

// Execute query with error handling
export async function executeQuery(query, params = []) {
  try {
    console.log('Executing query:', query)
    console.log('Query params:', params)
    
    const [results] = await pool.execute(query, params)
    console.log('Query executed successfully, results:', results)
    return results
  } catch (error) {
    console.error('Query execution failed:', error)
    console.error('Query error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      query: query,
      params: params
    })
    throw error
  }
}

// Initialize candidates table
export async function initializeDatabase() {
  try {
    console.log('Initializing database...')
    
    // Test connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error('Database connection failed')
    }
    
    // Create candidates table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        linkedin_url TEXT,
        resume TEXT,
        candidate_status ENUM('new', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected') DEFAULT 'new',
        location VARCHAR(255),
        current_company VARCHAR(255),
        current_job_title VARCHAR(255),
        experience_years VARCHAR(50),
        notice_period VARCHAR(50),
        ctc VARCHAR(50),
        expected_ctc VARCHAR(50),
        employment_type ENUM('full_time', 'contract', 'internship'),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    await executeQuery(createTableQuery)

    // Drop legacy candidates.skills column if it exists (we now use normalized skill tables)
    const candidatesSkillsColumn = await executeQuery(
      "SHOW COLUMNS FROM candidates LIKE 'skills'"
    )
    if (candidatesSkillsColumn && candidatesSkillsColumn.length > 0) {
      await executeQuery('ALTER TABLE candidates DROP COLUMN skills')
    }
    
    // Create skills tables - separate queries to avoid syntax errors
    const createSkillsTableQuery = `
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    await executeQuery(createSkillsTableQuery)

    // Self-heal existing/old schemas: ensure `skills.name` exists
    const skillsNameColumn = await executeQuery(
      "SHOW COLUMNS FROM skills LIKE 'name'"
    )
    if (!skillsNameColumn || skillsNameColumn.length === 0) {
      await executeQuery(
        "ALTER TABLE skills ADD COLUMN name VARCHAR(100) NOT NULL"
      )
      // Add unique constraint if missing (ignore error if it already exists)
      try {
        await executeQuery(
          'ALTER TABLE skills ADD UNIQUE KEY skills_name_unique (name)'
        )
      } catch (e) {
        // ignore
      }
    }

    // Normalize legacy schemas: migrate `skill_name` -> `name` then drop `skill_name`
    const skillsSkillNameColumn = await executeQuery(
      "SHOW COLUMNS FROM skills LIKE 'skill_name'"
    )
    if (skillsSkillNameColumn && skillsSkillNameColumn.length > 0) {
      // Populate name from skill_name where name is missing
      await executeQuery(
        "UPDATE skills SET name = skill_name WHERE (name IS NULL OR name = '') AND skill_name IS NOT NULL AND skill_name <> ''"
      )
      // Best-effort drop legacy column
      try {
        await executeQuery('ALTER TABLE skills DROP COLUMN skill_name')
      } catch (e) {
        // ignore
      }
    }

    // Deduplicate skills by name (keep the smallest id), and repoint candidate_skills
    const duplicateSkills = await executeQuery(
      'SELECT name, MIN(id) AS keep_id, COUNT(*) AS cnt FROM skills GROUP BY name HAVING cnt > 1'
    )
    for (const dup of duplicateSkills) {
      const keepId = dup.keep_id

      const duplicateIds = await executeQuery(
        'SELECT id FROM skills WHERE name = ? AND id <> ?',
        [dup.name, keepId]
      )
      const idsToDelete = duplicateIds.map(r => r.id)
      if (idsToDelete.length === 0) continue

      // Repoint mappings
      await executeQuery(
        `UPDATE candidate_skills SET skill_id = ? WHERE skill_id IN (${idsToDelete.map(() => '?').join(',')})`,
        [keepId, ...idsToDelete]
      )

      // Remove duplicate skill rows
      await executeQuery(
        `DELETE FROM skills WHERE id IN (${idsToDelete.map(() => '?').join(',')})`,
        idsToDelete
      )
    }

    // Ensure unique constraint exists on skills.name so duplicates cannot be re-inserted
    const skillsNameUniqueIndex = await executeQuery(
      "SHOW INDEX FROM skills WHERE Key_name = 'skills_name_unique'"
    )
    if (!skillsNameUniqueIndex || skillsNameUniqueIndex.length === 0) {
      try {
        await executeQuery('ALTER TABLE skills ADD UNIQUE KEY skills_name_unique (name)')
      } catch (e) {
        // ignore
      }
    }
    
    const createCandidateSkillsTableQuery = `
      CREATE TABLE IF NOT EXISTS candidate_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        skill_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE KEY unique_candidate_skill (candidate_id, skill_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    await executeQuery(createCandidateSkillsTableQuery)

    const candidateSkillsSkillIdColumn = await executeQuery(
      "SHOW COLUMNS FROM candidate_skills LIKE 'skill_id'"
    )
    if (!candidateSkillsSkillIdColumn || candidateSkillsSkillIdColumn.length === 0) {
      const candidateSkillsSklIdColumn = await executeQuery(
        "SHOW COLUMNS FROM candidate_skills LIKE 'skl_id'"
      )
      if (candidateSkillsSklIdColumn && candidateSkillsSklIdColumn.length > 0) {
        await executeQuery(
          'ALTER TABLE candidate_skills CHANGE COLUMN skl_id skill_id INT NOT NULL'
        )
      }
    }
    
    const insertSkillsDataQuery = `
      INSERT IGNORE INTO skills (name) VALUES
      ('Java'), ('C#'), ('SQL'), ('Python'), ('Endur (Openlink)'), ('Allegro'), ('RightAngle'), 
      ('TriplePoint (ION)'), ('Aspect CTRM'), ('Enuit'), ('Brady CTRM'), ('ETRM'), ('CTRM'), 
      ('Physical Trading'), ('Derivatives Trading'), ('Risk Management'), ('Market Risk (VaR)'), ('Credit Risk'), 
      ('PnL Reporting'), ('Trade Lifecycle Management'), ('Hedging Strategies'), ('Deal Modeling'), ('AVS / JVS (Endur)'), 
      ('OpenJVS'), ('Report Builder'), ('Interfaces & Integration'), ('Data Migration'), ('System Implementation'), ('UAT Support')
    `
    
    await executeQuery(insertSkillsDataQuery)
    
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

export default pool
