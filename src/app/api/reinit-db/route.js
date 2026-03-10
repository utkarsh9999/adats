import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    console.log('Forcing database re-initialization...')
    await initializeDatabase()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database re-initialized successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database re-initialization failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
