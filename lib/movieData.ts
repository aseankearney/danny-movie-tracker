// Alternative movie data source using a curated list
// This can work without an API key for testing/development

export interface MovieData {
  id: string
  title: string
  year: number
  poster?: string
  imdbId?: string
}

// Top 10 grossing movies in the US by year (1989-2023)
// This is a curated list - you can expand this or use an API
const TOP_GROSSING_MOVIES: Record<number, MovieData[]> = {
  1989: [
    { id: 'batman-1989', title: 'Batman', year: 1989, imdbId: 'tt0096895' },
    { id: 'indiana-jones-1989', title: 'Indiana Jones and the Last Crusade', year: 1989, imdbId: 'tt0097576' },
    { id: 'lethal-weapon-2', title: 'Lethal Weapon 2', year: 1989, imdbId: 'tt0097733' },
    { id: 'honey-i-shrunk', title: 'Honey, I Shrunk the Kids', year: 1989, imdbId: 'tt0097523' },
    { id: 'ghostbusters-2', title: 'Ghostbusters II', year: 1989, imdbId: 'tt0097428' },
    { id: 'the-little-mermaid', title: 'The Little Mermaid', year: 1989, imdbId: 'tt0097757' },
    { id: 'back-to-future-2', title: 'Back to the Future Part II', year: 1989, imdbId: 'tt0096874' },
    { id: 'dead-poets-society', title: 'Dead Poets Society', year: 1989, imdbId: 'tt0097165' },
    { id: 'parenthood', title: 'Parenthood', year: 1989, imdbId: 'tt0098067' },
    { id: 'license-to-kill', title: 'Licence to Kill', year: 1989, imdbId: 'tt0097742' },
  ],
  // Add more years as needed - this is just an example
}

export function getTopGrossingMoviesByYear(year: number): MovieData[] {
  return TOP_GROSSING_MOVIES[year] || []
}

export function getAllTopGrossingMovies(startYear: number = 1989, endYear?: number): MovieData[] {
  const currentYear = endYear || new Date().getFullYear()
  const allMovies: MovieData[] = []
  
  for (let year = startYear; year <= currentYear; year++) {
    const movies = getTopGrossingMoviesByYear(year)
    allMovies.push(...movies)
  }
  
  return allMovies
}

