// Re-export from db.ts for backward compatibility
// This file now uses Neon Postgres instead of JSON files
export {
  getMovieStatuses,
  updateMovieStatus,
  getMovieStatus,
  initDatabase,
} from './db'

