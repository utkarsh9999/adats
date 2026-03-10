import { NextResponse } from 'next/server'
import { executeQuery, initializeDatabase } from '@/lib/db'

function parseSkills(skills) {
  if (!skills) return []
  if (Array.isArray(skills)) return skills.filter(Boolean)
  if (typeof skills === 'string') {
    const trimmed = skills.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      // ignore
    }
    return trimmed
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
  if (typeof skills === 'object') {
    return Object.values(skills).filter(Boolean)
  }
  return []
}

export async function POST() {
  try {
    // Ensure base tables exist
    await initializeDatabase()

    const candidatesSkillsColumn = await executeQuery(
      "SHOW COLUMNS FROM candidates LIKE 'skills'"
    )
    if (!candidatesSkillsColumn || candidatesSkillsColumn.length === 0) {
      return NextResponse.json({
        success: true,
        processedCandidates: 0,
        insertedMappings: 0
      })
    }

    // Fetch all candidates with their stored skills column
    const candidates = await executeQuery('SELECT id, skills FROM candidates')

    let insertedMappings = 0
    let processedCandidates = 0

    for (const candidate of candidates) {
      const skillsArr = parseSkills(candidate.skills)
      if (skillsArr.length === 0) continue

      processedCandidates += 1

      for (const skillNameRaw of skillsArr) {
        const skillName = String(skillNameRaw).trim()
        if (!skillName) continue

        // Upsert skill
        const existing = await executeQuery('SELECT id FROM skills WHERE name = ?', [skillName])
        let skillId
        if (existing.length > 0) {
          skillId = existing[0].id
        } else {
          const ins = await executeQuery('INSERT INTO skills (name) VALUES (?)', [skillName])
          skillId = ins.insertId
        }

        // Insert mapping (ignore duplicates)
        const res = await executeQuery(
          'INSERT IGNORE INTO candidate_skills (candidate_id, skill_id) VALUES (?, ?)',
          [candidate.id, skillId]
        )
        if (res && typeof res.affectedRows === 'number') {
          insertedMappings += res.affectedRows
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCandidates,
      insertedMappings
    })
  } catch (error) {
    console.error('migrate-candidate-skills error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
