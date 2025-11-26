import { NextRequest, NextResponse } from 'next/server'
import { updateMovieStatus, initDatabase } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if database URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL is not set' },
        { status: 500 }
      )
    }

    // Initialize database schema if needed
    try {
      await initDatabase()
    } catch (error) {
      console.error('Database initialization error:', error)
    }

    const movieId = params.id // Keep as string to support IMDb IDs
    const body = await request.json()
    const { status } = body

    if (!status || (status !== 'Seen-Liked' && status !== 'Seen-Hated' && status !== 'Not Seen')) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "Seen-Liked", "Seen-Hated", or "Not Seen"' },
        { status: 400 }
      )
    }

    await updateMovieStatus(movieId, status)

    return NextResponse.json({ success: true, movieId, status })
  } catch (error) {
    console.error('Error updating movie status:', error)
    return NextResponse.json(
      { error: 'Failed to update movie status' },
      { status: 500 }
    )
  }
}

