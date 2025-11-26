// OMDb API helper functions
// Get a free API key from http://www.omdbapi.com/apikey.aspx

const OMDB_API_KEY = process.env.OMDB_API_KEY || ''
const OMDB_BASE_URL = 'https://www.omdbapi.com'

export interface OMDbMovieResponse {
  imdbID: string
  Title: string
  Year: string
  Poster: string
  Type: string
  Plot?: string
  Response: string
  Error?: string
}

export interface MovieFromOMDb {
  id: string
  title: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  revenue: number
  year: number
}

export async function getMovieByTitleAndYear(title: string, year: number): Promise<OMDbMovieResponse | null> {
  if (!OMDB_API_KEY) {
    throw new Error('OMDB_API_KEY is not set. Please get a free API key from http://www.omdbapi.com/apikey.aspx')
  }

  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}&type=movie`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`OMDb API error: ${response.statusText}`)
    }

    const data: OMDbMovieResponse = await response.json()
    if (data.Response === 'False') {
      console.warn(`Movie not found: ${title} (${year}) - ${data.Error}`)
      return null
    }
    return data
  } catch (error) {
    console.error(`Error fetching movie ${title} (${year}):`, error)
    return null
  }
}

export async function getMovieByIMDbId(imdbId: string): Promise<OMDbMovieResponse | null> {
  if (!OMDB_API_KEY) {
    throw new Error('OMDB_API_KEY is not set. Please get a free API key from http://www.omdbapi.com/apikey.aspx')
  }

  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}&type=movie`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`OMDb API error: ${response.statusText}`)
    }

    const data: OMDbMovieResponse = await response.json()
    if (data.Response === 'False') {
      return null
    }
    return data
  } catch (error) {
    console.error(`Error fetching movie by IMDb ID ${imdbId}:`, error)
    return null
  }
}

export function convertOMDbToMovie(omdbData: OMDbMovieResponse, year: number): MovieFromOMDb {
  return {
    id: omdbData.imdbID,
    title: omdbData.Title,
    release_date: omdbData.Year,
    poster_path: omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
    backdrop_path: null, // OMDb doesn't provide backdrop
    overview: omdbData.Plot || '',
    revenue: 0, // OMDb doesn't provide revenue data
    year: year,
  }
}

