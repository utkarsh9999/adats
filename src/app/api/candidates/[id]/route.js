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
    
    console.log('=== PUT REQUEST START ===')
    console.log('PUT request - resolvedParams:', resolvedParams)
    console.log('PUT request - id:', id)
    console.log('PUT request - updateData:', updateData)
    
    // Validate ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid candidate ID' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    if (!updateData.full_name || !updateData.full_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      )
    }
    
    if (!updateData.email || !updateData.email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(updateData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Validate phone format (basic validation)
    if (updateData.phone && !/^[\d\s\-\+\(\)]+$/.test(updateData.phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone format' },
        { status: 400 }
      )
    }
    
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
    
    // Validate and sanitize each field
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        let value = updateData[field]
        
        // Sanitize string fields
        if (typeof value === 'string') {
          value = value.trim()
        }
        
        // Handle skills array
        if (field === 'skills') {
          if (Array.isArray(value) && value.length > 0) {
            // Filter out empty skills and trim
            const cleanSkills = value
              .filter(skill => skill && typeof skill === 'string')
              .map(skill => skill.trim())
              .filter(skill => skill.length > 0)
            value = JSON.stringify(cleanSkills)
          } else {
            value = null
          }
        }
        
        // Validate numeric fields
        if (field === 'ctc' || field === 'expected_ctc') {
          if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
            throw new Error(`Invalid ${field} format. Must be a number`)
          }
        }
        
        updateFields.push(`${field} = ?`)
        updateValues.push(value)
      }
    })
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(id)
    
    console.log('Update query fields:', updateFields)
    console.log('Update values:', updateValues)
    
    await executeQuery(
      `UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    console.log('Database update completed')
    
    // Get updated candidate
    const updatedCandidate = await executeQuery(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    )
    
    // Parse skills from comma-separated string to array (handle both JSON and string formats)
    let formattedCandidate
    try {
      const candidateData = updatedCandidate[0]
      
      if (!candidateData.skills) {
        formattedCandidate = { ...candidateData, skills: [] }
      } else if (Array.isArray(candidateData.skills)) {
        formattedCandidate = { ...candidateData, skills: candidateData.skills }
      } else if (typeof candidateData.skills === 'string') {
        try {
          const parsed = JSON.parse(candidateData.skills)
          formattedCandidate = { ...candidateData, skills: Array.isArray(parsed) ? parsed : [] }
        } catch {
          formattedCandidate = { 
            ...candidateData, 
            skills: candidateData.skills.split(',').filter(skill => skill.trim()) 
          }
        }
      } else {
        formattedCandidate = { ...candidateData, skills: [] }
      }
    } catch (error) {
      console.error('Error parsing skills in PUT response:', error)
      formattedCandidate = { ...updatedCandidate[0], skills: [] }
    }
    
    console.log('=== PUT REQUEST END (SUCCESS) ===')
    console.log('Updated candidate:', formattedCandidate)
    
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
      const candidateData = candidate[0]
      
      if (!candidateData.skills) {
        formattedCandidate = { ...candidateData, skills: [] }
      } else if (Array.isArray(candidateData.skills)) {
        formattedCandidate = { ...candidateData, skills: candidateData.skills }
      } else if (typeof candidateData.skills === 'string') {
        try {
          const parsed = JSON.parse(candidateData.skills)
          formattedCandidate = { ...candidateData, skills: Array.isArray(parsed) ? parsed : [] }
        } catch {
          formattedCandidate = { 
            ...candidateData, 
            skills: candidateData.skills.split(',').filter(skill => skill.trim()) 
          }
        }
      } else {
        formattedCandidate = { ...candidateData, skills: [] }
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
