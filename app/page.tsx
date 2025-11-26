'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MovieWithStatus } from '@/types/movie'

export default function Home() {
  const [movies, setMovies] = useState<MovieWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moviesPerPage, setMoviesPerPage] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDebug, setShowDebug] = useState(false)
  const [updating, setUpdating] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalMovies, setTotalMovies] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    // Fetch initial batch of 20 movies
    fetchMovies(0, 20)
    
    // Then fetch the rest in the background
    fetchRemainingMovies(20)
  }, [])

  const fetchMovies = async (offset: number = 0, limit: number = 20) => {
    try {
      const response = await fetch(`/api/movies?offset=${offset}&limit=${limit}`)
      const data = await response.json()
      
      // Check if there's an error in the response
      if (data.error) {
        setError(data.message || data.error)
        setLoading(false)
        return
      }
      
      // Filter out movies that have already been marked
      const unmarkedMovies = data.movies.filter((m: MovieWithStatus) => m.status === null)
      
      if (offset === 0) {
        // Initial load - replace all movies
        setMovies(unmarkedMovies)
        setTotalMovies(data.total)
      } else {
        // Background load - append to existing movies
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMovies = unmarkedMovies.filter((m: MovieWithStatus) => !existingIds.has(m.id))
          return [...prev, ...newMovies]
        })
      }
      
      setHasMore(data.hasMore)
      setError(null)
      setLoading(false)
      setLoadingMore(false)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setError('Failed to fetch movies. Please check your connection and try again.')
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchRemainingMovies = async (startOffset: number) => {
    setLoadingMore(true)
    try {
      // Fetch remaining movies in batches of 50
      let offset = startOffset
      const batchSize = 50
      
      while (true) {
        const response = await fetch(`/api/movies?offset=${offset}&limit=${batchSize}`)
        const data = await response.json()
        
        if (data.error || !data.movies || data.movies.length === 0) {
          break
        }
        
        // Filter out movies that have already been marked
        const unmarkedMovies = data.movies.filter((m: MovieWithStatus) => m.status === null)
        
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMovies = unmarkedMovies.filter((m: MovieWithStatus) => !existingIds.has(m.id))
          return [...prev, ...newMovies]
        })
        
        if (!data.hasMore) {
          break
        }
        
        offset += batchSize
        
        // Small delay between batches to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Error fetching remaining movies:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleStatusUpdate = async (movieId: string | number, status: 'Seen-Liked' | 'Seen-Hated' | 'Not Seen') => {
    setUpdating(movieId)
    try {
      const response = await fetch(`/api/movies/${movieId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Update local state
        setMovies(prev => prev.map(m => 
          m.id === movieId ? { ...m, status } : m
        ))
        
        // Move to next set of movies after a short delay
        setTimeout(() => {
          // Filter out the movie that was just updated
          setMovies(prev => prev.filter(m => m.id !== movieId))
          
          // Move to next set if available
          if (currentIndex < movies.length - 1) {
            // Stay at current index (movies list will shift)
            setCurrentIndex(Math.max(0, currentIndex))
          } else {
            // Reset to beginning if we've gone through all movies
            setCurrentIndex(0)
          }
        }, 500)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const currentMovies = movies.slice(currentIndex, currentIndex + moviesPerPage)
  const hasMore = currentIndex + moviesPerPage < movies.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading movies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Error Loading Movies</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          {(error.includes('OMDB_API_KEY') || error.includes('API Key')) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <h2 className="font-semibold mb-2">Troubleshooting Steps:</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Get a free OMDb API key from <a href="http://www.omdbapi.com/apikey.aspx" className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">omdbapi.com</a></li>
                <li>Create a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> file in the project root</li>
                <li>Add: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">OMDB_API_KEY=your_key_here</code></li>
                <li>Restart your dev server</li>
              </ol>
            </div>
          )}
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              fetchMovies()
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No movies to display. All movies have been reviewed!</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Danny, have you seen these movies?
        </h1>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Debug Options</h2>
            <label className="block mb-2">
              Movies per page:
              <input
                type="number"
                min="1"
                max="10"
                value={moviesPerPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  setMoviesPerPage(Math.max(1, Math.min(10, value)))
                  setCurrentIndex(0)
                }}
                className="ml-2 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
              />
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {currentIndex + 1}-{Math.min(currentIndex + moviesPerPage, movies.length)} of {movies.length} movies
              {loadingMore && <span className="ml-2 text-blue-500">(Loading more in background...)</span>}
            </div>
          </div>
        )}

        {/* Debug Toggle */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Options
          </button>
          {loadingMore && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              ⏳ Loading more movies in the background...
            </div>
          )}
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="flex">
                {/* Poster */}
                <div className="flex-shrink-0">
                  {movie.poster_path && movie.poster_path !== 'N/A' ? (
                    <Image
                      src={movie.poster_path}
                      alt={movie.title}
                      width={100}
                      height={150}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-[100px] h-[150px] bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {movie.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {movie.year}
                  </p>

                  {/* Buttons */}
                  <div className="mt-auto space-y-2">
                    <button
                      onClick={() => handleStatusUpdate(movie.id, 'Seen-Liked')}
                      disabled={updating === movie.id}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating === movie.id ? (
                        'Updating...'
                      ) : (
                        <>
                          <span>👍</span>
                          <span>Seen It</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(movie.id, 'Seen-Hated')}
                      disabled={updating === movie.id}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating === movie.id ? (
                        'Updating...'
                      ) : (
                        <>
                          <span>👎</span>
                          <span>Seen It</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(movie.id, 'Not Seen')}
                      disabled={updating === movie.id}
                      className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === movie.id ? 'Updating...' : 'Never Seen It'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => setCurrentIndex(currentIndex + moviesPerPage)}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Load More ({movies.length - currentIndex - moviesPerPage} remaining)
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

