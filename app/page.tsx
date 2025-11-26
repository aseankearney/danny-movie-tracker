'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MovieWithStatus } from '@/types/movie'

export default function Home() {
  const [movies, setMovies] = useState<MovieWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moviesPerPage, setMoviesPerPage] = useState(1)
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
      // Fetch remaining untagged movies in batches of 50
      let offset = startOffset
      const batchSize = 50
      
      while (true) {
        const response = await fetch(`/api/movies?offset=${offset}&limit=${batchSize}`)
        const data = await response.json()
        
        if (data.error || !data.movies || data.movies.length === 0) {
          break
        }
        
        // API already filters to only return untagged movies, but double-check
        const unmarkedMovies = data.movies.filter((m: MovieWithStatus) => m.status === null)
        
        if (unmarkedMovies.length === 0) {
          // No more untagged movies
          break
        }
        
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
        // Remove the movie from the list immediately (since it's now tagged)
        setMovies(prev => prev.filter(m => m.id !== movieId))
        
        // Move to next movie after a short delay
        setTimeout(() => {
          // If we've gone through all movies, try to fetch more untagged movies
          if (currentIndex >= movies.length - 1) {
            // Reset to beginning and fetch more if available
            setCurrentIndex(0)
            // Try to fetch more untagged movies
            fetchRemainingMovies(movies.length)
          } else {
            // Stay at current index (the list has shifted, so we're already on the next movie)
            // No need to change currentIndex since we removed the current movie
          }
        }, 300)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const currentMovies = movies.slice(currentIndex, currentIndex + moviesPerPage)
  const hasMoreMovies = currentIndex + moviesPerPage < movies.length

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
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8 text-gray-900 dark:text-white px-2">
          Danny, have you seen these movies?
        </h1>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-2">Debug Options</h2>
            <label className="block mb-2 text-sm sm:text-base">
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
                className="ml-2 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-base"
              />
            </label>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Showing {currentIndex + 1}-{Math.min(currentIndex + moviesPerPage, movies.length)} of {movies.length} movies
              {loadingMore && <span className="ml-2 text-blue-500">(Loading more in background...)</span>}
            </div>
          </div>
        )}

        {/* Debug Toggle */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline touch-manipulation"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Options
          </button>
          {loadingMore && (
            <div className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
              ⏳ Loading more movies in the background...
            </div>
          )}
        </div>

        {/* Movies - Single column for mobile, optimized for iPhone */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {currentMovies.map((movie) => (
            <div
              key={movie.id}
              className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Mobile-optimized layout: Poster on top, content below */}
              <div className="flex flex-col sm:flex-row">
                {/* Poster - Larger on mobile */}
                <div className="flex-shrink-0 w-full sm:w-[120px] flex justify-center sm:justify-start bg-gray-100 dark:bg-gray-700">
                  {movie.poster_path && movie.poster_path !== 'N/A' ? (
                    <Image
                      src={movie.poster_path}
                      alt={movie.title}
                      width={150}
                      height={225}
                      className="object-cover w-full sm:w-[120px] h-auto"
                    />
                  ) : (
                    <div className="w-full sm:w-[120px] h-[225px] sm:h-[180px] bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white text-center sm:text-left">
                    {movie.title}
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4 text-center sm:text-left">
                    {movie.year}
                  </p>

                  {/* Buttons - Larger touch targets for mobile */}
                  <div className="mt-auto space-y-3">
                    <button
                      onClick={() => handleStatusUpdate(movie.id, 'Seen-Liked')}
                      disabled={updating === movie.id}
                      className="w-full px-6 py-4 sm:py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg font-semibold text-lg sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                    >
                      {updating === movie.id ? (
                        'Updating...'
                      ) : (
                        <>
                          <span className="text-2xl">👍</span>
                          <span>Seen It</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(movie.id, 'Seen-Hated')}
                      disabled={updating === movie.id}
                      className="w-full px-6 py-4 sm:py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg font-semibold text-lg sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                    >
                      {updating === movie.id ? (
                        'Updating...'
                      ) : (
                        <>
                          <span className="text-2xl">👎</span>
                          <span>Seen It</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(movie.id, 'Not Seen')}
                      disabled={updating === movie.id}
                      className="w-full px-6 py-4 sm:py-3 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white rounded-lg font-semibold text-lg sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
        {hasMoreMovies && (
          <div className="text-center">
            <button
              onClick={() => setCurrentIndex(currentIndex + moviesPerPage)}
              className="px-6 py-3 sm:py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-semibold text-base sm:text-sm touch-manipulation"
            >
              Load More ({movies.length - currentIndex - moviesPerPage} remaining)
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

