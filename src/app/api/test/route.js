import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Skills tables setup is ready. Please visit /api/setup-skills-tables to create tables.' })
}
