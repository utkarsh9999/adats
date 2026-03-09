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
        skills TEXT,
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
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

export default pool
