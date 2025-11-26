// Script to initialize the database schema
// Run with: npx tsx scripts/init-db.ts

import { initDatabase } from '../lib/db'

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set')
    console.error('Please set it in your .env.local file')
    process.exit(1)
  }

  try {
    console.log('Initializing database schema...')
    await initDatabase()
    console.log('✅ Database schema initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

main()

