import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connection
    const result = await executeQuery('SELECT 1 as test')
    
    // Test if skills table exists
    const skillsTable = await executeQuery('SHOW TABLES LIKE "skills"')
    
    // Test if candidate_skills table exists
    const candidateSkillsTable = await executeQuery('SHOW TABLES LIKE "candidate_skills"')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database test completed',
      connection: result.length > 0,
      skillsTable: skillsTable.length > 0,
      candidateSkillsTable: candidateSkillsTable.length > 0
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
