const TMDB_API_KEY = process.env.TMDB_API_KEY || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export interface TMDbLikeMovieResponse {
  imdbID: string
  Title: string
  Year: string
  Poster: string
  Type: string
  Plot?: string
  Response: string
  Error?: string
}

export interface MovieFromTMDb {
  id: string
  title: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  revenue: number
  year: number
}

async function fetchTMDb<T>(endpoint: string, params: Record<string, string | number>) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set. Please create a key at https://www.themoviedb.org/settings/api')
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  url.searchParams.set('language', 'en-US')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  const response = await fetch(url.toString(), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.statusText}`)
  }
  return (await response.json()) as T
}

interface TMDbSearchResult {
  id: number
  title: string
  release_date?: string
  overview?: string
  poster_path?: string | null
}

interface TMDbSearchResponse {
  results: TMDbSearchResult[]
}

interface TMDbMovieDetailsResponse {
  id: number
  imdb_id?: string
  title: string
  overview?: string
  release_date?: string
  poster_path?: string | null
}

function mapTMDbToMovieResponse(movie: TMDbMovieDetailsResponse): TMDbLikeMovieResponse {
  return {
    imdbID: movie.imdb_id || '',
    Title: movie.title || '',
    Year: movie.release_date ? movie.release_date.slice(0, 4) : '',
    Poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'N/A',
    Type: 'movie',
    Plot: movie.overview || '',
    Response: movie.title ? 'True' : 'False',
  }
}

async function getMovieDetailsById(tmdbId: number) {
  return fetchTMDb<TMDbMovieDetailsResponse>(`/movie/${tmdbId}`, {
    append_to_response: 'external_ids',
  })
}

export async function getMovieByTitleAndYear(title: string, year: number): Promise<TMDbLikeMovieResponse | null> {
  try {
    const data = await fetchTMDb<TMDbSearchResponse>('/search/movie', {
      query: title,
      year,
      include_adult: 'false',
    })

    if (!data.results || data.results.length === 0) {
      console.warn(`Movie not found: ${title} (${year})`)
      return null
    }

    const result = data.results.find(movie => movie.release_date?.startsWith(String(year))) || data.results[0]
    if (!result) {
      return null
    }

    const details = await getMovieDetailsById(result.id)
    return mapTMDbToMovieResponse(details)
  } catch (error) {
    console.error(`Error fetching movie ${title} (${year}) from TMDb:`, error)
    return null
  }
}

export async function getMovieByIMDbId(imdbId: string): Promise<TMDbLikeMovieResponse | null> {
  if (!imdbId || !imdbId.startsWith('tt')) {
    return null
  }

  try {
    const findResponse = await fetchTMDb<{ movie_results?: Array<{ id: number }> }>(`/find/${imdbId}`, {
      external_source: 'imdb_id',
    })

    const tmdbId = findResponse.movie_results?.[0]?.id
    if (!tmdbId) {
      return null
    }

    const details = await getMovieDetailsById(tmdbId)
    return mapTMDbToMovieResponse(details)
  } catch (error) {
    console.error(`Error fetching movie by IMDb ID ${imdbId} from TMDb:`, error)
    return null
  }
}

export function convertTMDbToMovie(movieData: TMDbLikeMovieResponse, year: number): MovieFromTMDb {
  return {
    id: movieData.imdbID,
    title: movieData.Title,
    release_date: movieData.Year,
    poster_path: movieData.Poster && movieData.Poster !== 'N/A' ? movieData.Poster : null,
    backdrop_path: null,
    overview: movieData.Plot || '',
    revenue: 0,
    year,
  }
}

