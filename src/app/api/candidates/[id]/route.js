import { NextResponse } from 'next/server'
import { executeQuery } from '../../../../lib/db'

// DELETE /api/candidates/[id] - Delete a candidate
export async function DELETE(request, { params }) {
  try {
    console.log('=== DELETE REQUEST START ===')
    
    // Await params to get the actual values
    const resolvedParams = await params
    console.log('DELETE request - resolvedParams:', resolvedParams)
    console.log('resolvedParams.id:', resolvedParams.id)
    console.log('typeof resolvedParams.id:', typeof resolvedParams.id)
    
    const id = parseInt(resolvedParams.id)
    console.log('Parsed ID:', id)
    console.log('typeof parsed ID:', typeof id)
    console.log('isNaN check:', isNaN(id))
    console.log('id <= 0 check:', id <= 0)
    
    if (isNaN(id) || id <= 0) {
      console.log('Invalid ID format or value - throwing error')
      console.log('=== DELETE REQUEST END (INVALID ID) ===')
      return NextResponse.json(
        { success: false, error: 'Invalid candidate ID' },
        { status: 400 }
      )
    }
    
    // Check if candidate exists
    console.log('Checking if candidate exists with ID:', id)
    const candidate = await executeQuery(
      'SELECT id FROM candidates WHERE id = ?',
      [id]
    )
    
    console.log('Found candidates:', candidate)
    console.log('Candidate count:', candidate.length)
    
    if (candidate.length === 0) {
      console.log('No candidate found with ID:', id)
      console.log('=== DELETE REQUEST END (NOT FOUND) ===')
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    // Delete candidate
    console.log('Deleting candidate with ID:', id)
    await executeQuery('DELETE FROM candidates WHERE id = ?', [id])
    console.log('Candidate deleted successfully')
    console.log('=== DELETE REQUEST END (SUCCESS) ===')
    
    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Candidate deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete candidate' },
      { status: 500 }
    )
  }
}

// PUT /api/candidates/[id] - Update a candidate
export async function PUT(request, { params }) {
  try {
    // Await params to get the actual values
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    const updateData = await request.json()
    
    console.log('PUT request - resolvedParams:', resolvedParams)
    console.log('PUT request - id:', id)
    console.log('PUT request - updateData:', updateData)
    
    // Check if candidate exists
    const candidate = await executeQuery(
      'SELECT id FROM candidates WHERE id = ?',
      [id]
    )
    
    if (candidate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    // Check for duplicate email (if email is being updated)
    if (updateData.email) {
      const existingCandidate = await executeQuery(
        'SELECT id FROM candidates WHERE email = ? AND id != ?',
        [updateData.email, id]
      )
      
      if (existingCandidate.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Candidate with this email already exists' },
          { status: 400 }
        )
      }
    }
    
    // Build dynamic update query
    const updateFields = []
    const updateValues = []
    
    const allowedFields = [
      'full_name', 'email', 'phone', 'skills', 'linkedin_url', 'resume',
      'candidate_status', 'location', 'current_company', 'current_job_title',
      'experience_years', 'notice_period', 'ctc', 'expected_ctc',
      'employment_type', 'notes'
    ]
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(field === 'skills' ? (updateData[field] && updateData[field].length > 0 ? JSON.stringify(updateData[field]) : null) : updateData[field])
      }
    })
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    updateValues.push(id)
    
    await executeQuery(
      `UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    // Get updated candidate
    const updatedCandidate = await executeQuery(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    )
    
    // Parse skills from comma-separated string to array (handle both JSON and string formats)
    let formattedCandidate
    try {
      const candidate = updatedCandidate[0]
      
      if (!candidate.skills) {
        formattedCandidate = { ...candidate, skills: [] }
      } else if (Array.isArray(candidate.skills)) {
        formattedCandidate = { ...candidate, skills: candidate.skills }
      } else if (typeof candidate.skills === 'string') {
        try {
          const parsed = JSON.parse(candidate.skills)
          formattedCandidate = { ...candidate, skills: Array.isArray(parsed) ? parsed : [] }
        } catch {
          formattedCandidate = { 
            ...candidate, 
            skills: candidate.skills.split(',').filter(skill => skill.trim()) 
          }
        }
      } else {
        formattedCandidate = { ...candidate, skills: [] }
      }
    } catch (error) {
      console.error('Error parsing skills:', error)
      formattedCandidate = { ...updatedCandidate[0], skills: [] }
    }
    
    return NextResponse.json({
      success: true,
      data: formattedCandidate,
      message: 'Candidate updated successfully'
    })
  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update candidate' },
      { status: 500 }
    )
  }
}

// GET /api/candidates/[id] - Get single candidate
export async function GET(request, { params }) {
  try {
    // Await params to get the actual values
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    console.log('GET request - resolvedParams:', resolvedParams)
    console.log('GET request - id:', id)
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid candidate ID' },
        { status: 400 }
      )
    }
    
    const candidate = await executeQuery(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    )
    
    if (candidate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    // Parse skills from comma-separated string to array (handle both JSON and string formats)
    let formattedCandidate
    try {
      const candidate = candidate[0]
      
      if (!candidate.skills) {
        formattedCandidate = { ...candidate, skills: [] }
      } else if (Array.isArray(candidate.skills)) {
        formattedCandidate = { ...candidate, skills: candidate.skills }
      } else if (typeof candidate.skills === 'string') {
        try {
          const parsed = JSON.parse(candidate.skills)
          formattedCandidate = { ...candidate, skills: Array.isArray(parsed) ? parsed : [] }
        } catch {
          formattedCandidate = { 
            ...candidate, 
            skills: candidate.skills.split(',').filter(skill => skill.trim()) 
          }
        }
      } else {
        formattedCandidate = { ...candidate, skills: [] }
      }
    } catch (error) {
      console.error('Error parsing skills:', error)
      formattedCandidate = { ...candidate[0], skills: [] }
    }
    
    return NextResponse.json({
      success: true,
      data: formattedCandidate
    })
  } catch (error) {
    console.error('Failed to fetch candidate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate' },
      { status: 500 }
    )
  }
}
