import { neon } from '@neondatabase/serverless'
import { MovieStatus } from '@/types/movie'

// Initialize Neon database client
const sql = neon(process.env.DATABASE_URL!)

// Initialize database schema
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS movie_statuses (
        movie_id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(20) NOT NULL CHECK (status IN ('Seen-Liked', 'Seen-Hated', 'Not Seen')),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Create index on status for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_movie_statuses_status ON movie_statuses(status)
    `
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export async function getMovieStatuses(): Promise<Record<string | number, MovieStatus>> {
  try {
    const rows = await sql`
      SELECT movie_id, status, updated_at
      FROM movie_statuses
    `
    
    const statuses: Record<string | number, MovieStatus> = {}
    for (const row of rows) {
      statuses[row.movie_id] = {
        movieId: row.movie_id,
        status: row.status as 'Seen-Liked' | 'Seen-Hated' | 'Not Seen',
        updatedAt: row.updated_at.toISOString(),
      }
    }
    return statuses
  } catch (error) {
    console.error('Error fetching movie statuses:', error)
    return {}
  }
}

export async function updateMovieStatus(
  movieId: string | number,
  status: 'Seen-Liked' | 'Seen-Hated' | 'Not Seen'
): Promise<void> {
  try {
    await sql`
      INSERT INTO movie_statuses (movie_id, status, updated_at)
      VALUES (${String(movieId)}, ${status}, CURRENT_TIMESTAMP)
      ON CONFLICT (movie_id)
      DO UPDATE SET 
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
    `
  } catch (error) {
    console.error('Error updating movie status:', error)
    throw error
  }
}

export async function getMovieStatus(
  movieId: string | number
): Promise<'Seen-Liked' | 'Seen-Hated' | 'Not Seen' | null> {
  try {
    const result = await sql`
      SELECT status
      FROM movie_statuses
      WHERE movie_id = ${String(movieId)}
      LIMIT 1
    `
    
    if (result.length === 0) {
      return null
    }
    
    return result[0].status as 'Seen-Liked' | 'Seen-Hated' | 'Not Seen'
  } catch (error) {
    console.error('Error fetching movie status:', error)
    return null
  }
}

