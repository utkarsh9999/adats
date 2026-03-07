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
    
    // Parse skills from comma-separated string to array (handle both JSON and string formats)
    const formattedCandidates = candidates.map(candidate => {
      try {
        if (!candidate.skills) {
          return { ...candidate, skills: [] }
        }
        
        // If it's already an array (JSON parsed), return as is
        if (Array.isArray(candidate.skills)) {
          return { ...candidate, skills: candidate.skills }
        }
        
        // If it's a string, split it
        if (typeof candidate.skills === 'string') {
          // Try to parse as JSON first (for old data)
          try {
            const parsed = JSON.parse(candidate.skills)
            return { ...candidate, skills: Array.isArray(parsed) ? parsed : [] }
          } catch {
            // If JSON parsing fails, treat as comma-separated string
            return { 
              ...candidate, 
              skills: candidate.skills.split(',').filter(skill => skill.trim()) 
            }
          }
        }
        
        // Fallback to empty array
        return { ...candidate, skills: [] }
      } catch (error) {
        console.error('Error parsing skills for candidate:', candidate.id, error)
        return { ...candidate, skills: [] }
      }
    })
    
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
      skills: candidateData.skills && candidateData.skills.length > 0 ? JSON.stringify(candidateData.skills) : null,
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
    console.log('Skills being inserted:', insertData.skills)
    console.log('Skills type:', typeof insertData.skills)
    
    // Insert new candidate
    const result = await executeQuery(
      `INSERT INTO candidates (
        full_name, email, phone, skills, linkedin_url, resume, 
        candidate_status, location, current_company, current_job_title,
        experience_years, notice_period, ctc, expected_ctc, 
        employment_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertData.full_name,
        insertData.email,
        insertData.phone,
        insertData.skills,
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
    
    // Get the created candidate
    const newCandidate = await executeQuery(
      'SELECT * FROM candidates WHERE id = ?',
      [result.insertId]
    )
    
    // Parse skills from database (handle both JSON and string formats)
    let skillsArray = []
    if (newCandidate[0].skills) {
      // If it's already an array, use it directly
      if (Array.isArray(newCandidate[0].skills)) {
        skillsArray = newCandidate[0].skills
      }
      // If it's a string, try to parse as JSON first, then split
      else if (typeof newCandidate[0].skills === 'string') {
        try {
          // Try JSON parse first
          const parsed = JSON.parse(newCandidate[0].skills)
          skillsArray = Array.isArray(parsed) ? parsed : []
        } catch {
          // If JSON parse fails, treat as comma-separated string
          skillsArray = newCandidate[0].skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        }
      }
      // If it's an object, convert to array
      else if (typeof newCandidate[0].skills === 'object') {
        skillsArray = Object.values(newCandidate[0].skills).filter(skill => skill)
      }
      // Fallback: convert to string and handle
      else {
        const stringSkills = String(newCandidate[0].skills)
        if (stringSkills) {
          try {
            const parsed = JSON.parse(stringSkills)
            skillsArray = Array.isArray(parsed) ? parsed : []
          } catch {
            skillsArray = stringSkills.split(',').map(skill => skill.trim()).filter(skill => skill)
          }
        }
      }
    }
    
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
