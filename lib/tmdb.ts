// TMDB API helper functions
// Note: You'll need to get a free API key from https://www.themoviedb.org/settings/api

const TMDB_API_KEY = process.env.TMDB_API_KEY || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export interface TMDBMovie {
  id: number
  title: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  revenue: number
  year?: number
}

export async function getTopGrossingMoviesByYear(year: number): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set. Please get a free API key from https://www.themoviedb.org/settings/api')
  }

  try {
    // TMDB doesn't have a direct "top grossing by year" endpoint, so we'll use discover with sorting
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=${year}&sort_by=revenue.desc&page=1&region=US`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results.slice(0, 10) // Top 10
  } catch (error) {
    console.error(`Error fetching movies for year ${year}:`, error)
    return []
  }
}

export async function getAllTopGrossingMovies(startYear: number = 1989): Promise<TMDBMovie[]> {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)
  
  const allMovies: TMDBMovie[] = []
  
  // Fetch movies for each year (with some rate limiting consideration)
  for (const year of years) {
    const movies = await getTopGrossingMoviesByYear(year)
    allMovies.push(...movies.map(movie => ({ ...movie, year })))
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  return allMovies
}

