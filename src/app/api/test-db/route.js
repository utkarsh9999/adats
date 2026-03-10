import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:3001/api/candidates')
    const data = await response.json()
    return NextResponse.json({ 
      message: 'Database and API test',
      candidatesCount: data.data?.length || 0,
      success: data.success || false
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      message: 'Failed to connect to API'
    }, { status: 500 })
  }
}
