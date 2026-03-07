import { NextResponse } from 'next/server'

// POST /api/auth/login - Handle authentication
export async function POST(request) {
  try {
    const { username, password } = await request.json()
    
    // Validate credentials (in production, use database and hashing)
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          username,
          role: 'admin'
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
