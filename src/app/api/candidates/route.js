import { NextResponse } from 'next/server'
import { executeQuery, initializeDatabase } from '../../../lib/db'

// Initialize database on first request
let initialized = false
async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase()
    initialized = true
  }
}

// Process skills array and create mappings
async function processSkillsArray(candidateId, skills) {
  try {
    console.log('Processing skills for candidate:', candidateId, 'Skills:', skills)
    
    for (const skill of skills) {
      // Check if skill exists in skills table
      let skillRow = await executeQuery(
        'SELECT id FROM skills WHERE name = ?',
        [skill]
      )
      
      let skillId
      
      if (skillRow.length === 0) {
        // Create new skill if it doesn't exist
        console.log('Creating new skill:', skill)
        const newSkill = await executeQuery(
          'INSERT INTO skills (name) VALUES (?)',
          [skill]
        )
        skillId = newSkill.insertId
      } else {
        // Use existing skill
        skillId = skillRow[0].id
      }
      
      // Create mapping between candidate and skill
      console.log('Creating mapping: candidate', candidateId, 'skill', skillId)
      await executeQuery(
        'INSERT INTO candidate_skills (candidate_id, skill_id) VALUES (?, ?)',
        [candidateId, skillId]
      )
    }
    
    console.log('Skills processing completed for candidate:', candidateId)
  } catch (error) {
    console.error('Error processing skills:', error)
    throw error
  }
}

// GET /api/candidates - Get all candidates
export async function GET() {
  try {
    console.log('GET /api/candidates - Starting fetch')
    await ensureInitialized()
    console.log('Database initialized successfully')
    
    const candidates = await executeQuery(
      'SELECT * FROM candidates ORDER BY created_at DESC'
    )
    console.log('Raw candidates from database:', candidates)
    
    // Always return skills from normalized mapping table
    const formattedCandidates = await Promise.all(candidates.map(async candidate => {
      try {
        const candidateSkills = await executeQuery(
          'SELECT s.name FROM candidate_skills cs JOIN skills s ON cs.skill_id = s.id WHERE cs.candidate_id = ?',
          [candidate.id]
        )
        const skillsArray = candidateSkills.map(skill => skill.name)
        return { ...candidate, skills: skillsArray }
      } catch (error) {
        console.error('Error loading skills for candidate:', candidate.id, error)
        return { ...candidate, skills: [] }
      }
    }))
    
    console.log('Formatted candidates:', formattedCandidates)
    
    return NextResponse.json({
      success: true,
      data: formattedCandidates
    })
  } catch (error) {
    console.error('Failed to fetch candidates - Full error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch candidates: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST /api/candidates - Create new candidate
export async function POST(request) {
  try {
    await ensureInitialized()
    
    const candidateData = await request.json()
    console.log('Received candidate data:', candidateData)
    
    // Validate required fields
    if (!candidateData.full_name || !candidateData.email) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { success: false, error: 'Full name and email are required' },
        { status: 400 }
      )
    }
    
    // Check for duplicate email
    console.log('Checking for duplicate email:', candidateData.email)
    const existingCandidate = await executeQuery(
      'SELECT id FROM candidates WHERE email = ?',
      [candidateData.email]
    )
    
    if (existingCandidate.length > 0) {
      console.log('Duplicate email found:', candidateData.email)
      return NextResponse.json(
        { success: false, error: 'Candidate with this email already exists' },
        { status: 400 }
      )
    }
    
    // Prepare data for insertion
    const insertData = {
      full_name: candidateData.full_name,
      email: candidateData.email,
      phone: candidateData.phone || null,
      linkedin_url: candidateData.linkedin_url || null,
      resume: candidateData.resume || null,
      candidate_status: candidateData.candidate_status || 'new',
      location: candidateData.location || null,
      current_company: candidateData.current_company || null,
      current_job_title: candidateData.current_job_title || null,
      experience_years: candidateData.experience_years || null,
      notice_period: candidateData.notice_period || null,
      ctc: candidateData.ctc || null,
      expected_ctc: candidateData.expected_ctc || null,
      employment_type: candidateData.employment_type || null,
      notes: candidateData.notes || null
    }
    
    console.log('Inserting candidate with data:', insertData)
    // Insert new candidate
    const result = await executeQuery(
      `INSERT INTO candidates (
        full_name, email, phone, linkedin_url, resume, 
        candidate_status, location, current_company, current_job_title,
        experience_years, notice_period, ctc, expected_ctc, 
        employment_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertData.full_name,
        insertData.email,
        insertData.phone,
        insertData.linkedin_url,
        insertData.resume,
        insertData.candidate_status,
        insertData.location,
        insertData.current_company,
        insertData.current_job_title,
        insertData.experience_years,
        insertData.notice_period,
        insertData.ctc,
        insertData.expected_ctc,
        insertData.employment_type,
        insertData.notes
      ]
    )
    
    console.log('Insert result:', result)
    
    // Process skills array and create mappings
    if (candidateData.skills && Array.isArray(candidateData.skills) && candidateData.skills.length > 0) {
      console.log('Processing skills array for new candidate:', result.insertId)
      await processSkillsArray(result.insertId, candidateData.skills)
    }
    
    // Get the created candidate
    const newCandidate = await executeQuery(
      'SELECT * FROM candidates WHERE id = ?',
      [result.insertId]
    )
    
    const candidateSkills = await executeQuery(
      'SELECT s.name FROM candidate_skills cs JOIN skills s ON cs.skill_id = s.id WHERE cs.candidate_id = ?',
      [result.insertId]
    )
    const skillsArray = candidateSkills.map(s => s.name)
    
    const formattedCandidate = {
      ...newCandidate[0],
      skills: skillsArray
    }
    
    console.log('Created candidate:', formattedCandidate)
    
    return NextResponse.json({
      success: true,
      data: formattedCandidate,
      message: 'Candidate created successfully'
    })
  } catch (error) {
    console.error('Failed to create candidate - Full error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create candidate: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
