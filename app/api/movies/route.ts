import { NextResponse } from 'next/server'
import { getAllTopGrossingMovies } from '@/lib/topGrossingMovies'
import { getMovieByIMDbId, getMovieByTitleAndYear, convertOMDbToMovie } from '@/lib/omdb'
import { getMovieStatuses, initDatabase } from '@/lib/database'
import { MovieWithStatus } from '@/types/movie'

export async function GET(request: Request) {
  try {
    // Check if OMDb API key is set
    const omdbApiKey = process.env.OMDB_API_KEY
    
    if (!omdbApiKey) {
      return NextResponse.json(
        { 
          error: 'OMDB_API_KEY is not set',
          message: 'Please set OMDB_API_KEY in your .env.local file. See README.md for instructions.',
          troubleshooting: [
            '1. Get a free API key from http://www.omdbapi.com/apikey.aspx',
            '2. Create a .env.local file in the project root',
            '3. Add: OMDB_API_KEY=your_key_here',
            '4. Restart your dev server'
          ]
        },
        { status: 500 }
      )
    }

    // Check if Neon database URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: 'DATABASE_URL is not set',
          message: 'Please set DATABASE_URL (Neon Postgres connection string) in your .env.local file.',
        },
        { status: 500 }
      )
    }

    // Initialize database schema if needed
    try {
      await initDatabase()
    } catch (error) {
      console.error('Database initialization error:', error)
      // Continue anyway - table might already exist
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // Get statuses from database FIRST to filter out tagged movies early
    const statuses = await getMovieStatuses()
    
    // Get the curated list of top grossing movies
    const topGrossingMovies = getAllTopGrossingMovies(1989)
    
    if (topGrossingMovies.length === 0) {
      return NextResponse.json(
        { 
          error: 'No movies found',
          message: 'No top grossing movies data available.',
        },
        { status: 500 }
      )
    }
    
    // Filter out movies that are already tagged BEFORE fetching from OMDb
    // This saves API calls and ensures we only work with untagged movies
    const untaggedMovieList = topGrossingMovies.filter(movie => {
      const movieId = movie.imdbId || `movie-${movie.year}-${movie.title.replace(/\s+/g, '-').toLowerCase()}`
      return !statuses[movieId] || statuses[movieId].status === null
    })
    
    // Apply pagination to the untagged movies list
    const paginatedMovies = limit 
      ? untaggedMovieList.slice(offset, offset + limit)
      : untaggedMovieList.slice(offset)
    
    // Fetch movie details from OMDb for each untagged movie
    const movies: MovieWithStatus[] = []
    
    for (const movie of paginatedMovies) {
      let omdbData = null
      
      // Try IMDb ID first if available, then fall back to title/year
      if (movie.imdbId) {
        omdbData = await getMovieByIMDbId(movie.imdbId)
      }
      
      // If IMDb ID lookup failed, try title and year
      if (!omdbData) {
        omdbData = await getMovieByTitleAndYear(movie.title, movie.year)
      }
      
      if (omdbData) {
        const convertedMovie = convertOMDbToMovie(omdbData, movie.year)
        movies.push({
          ...convertedMovie,
          status: null, // These are all untagged
        } as MovieWithStatus)
      } else {
        // If OMDb lookup fails, create a basic movie entry
        movies.push({
          id: movie.imdbId || `movie-${movie.year}-${movie.title.replace(/\s+/g, '-').toLowerCase()}`,
          title: movie.title,
          release_date: movie.year.toString(),
          poster_path: null,
          backdrop_path: null,
          overview: '',
          revenue: 0,
          year: movie.year,
          status: null,
        } as MovieWithStatus)
      }
      
      // Small delay to avoid rate limiting (OMDb free tier has limits)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Calculate pagination info based on untagged movies
    const totalUntagged = untaggedMovieList.length
    const hasMore = offset + (limit || paginatedMovies.length) < totalUntagged
    
    return NextResponse.json({
      movies: movies, // All movies here are already untagged
      total: totalUntagged,
      offset,
      limit: limit || paginatedMovies.length,
      hasMore: hasMore
    })
  } catch (error: any) {
    console.error('Error fetching movies:', error)
    
    // Provide helpful error messages
    if (error.message?.includes('OMDB_API_KEY')) {
      return NextResponse.json(
        { 
          error: 'API Key Error',
          message: error.message,
          troubleshooting: [
            '1. Get a free API key from http://www.omdbapi.com/apikey.aspx',
            '2. Add it to .env.local as: OMDB_API_KEY=your_key_here',
            '3. Restart your dev server after adding the key'
          ]
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch movies',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

