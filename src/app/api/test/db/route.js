import { NextResponse } from 'next/server'
import { testConnection, executeQuery } from '../../../lib/db'

// GET /api/test/db - Test database connection
export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    // Test a simple query
    const result = await executeQuery('SELECT 1 as test')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testResult: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed: ' + error.message,
        details: error.stack
      },
      { status: 500 }
    )
  }
}
