# Danny's Movie Tracker

A web application to track movies that Danny has seen. The app fetches the top 10 grossing films in the United States from every year starting with 1989 until the current year, and presents them for review.

## Features

- Fetches top 10 grossing movies per year (1989 - current year)
- Displays movies with posters from OMDb
- Simple "Seen It" / "Nope" interface
- Configurable number of movies displayed at once (default: 3)
- Database storage for movie status tracking
- Clean, modern UI with dark mode support

## Setup

### Prerequisites

- Node.js 18+ installed
- A free OMDb API key from [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
- A free Neon Postgres database from [https://neon.tech](https://neon.tech)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a Neon database:
   - Sign up at https://neon.tech
   - Create a new project
   - Copy your connection string from the dashboard

3. Create a `.env.local` file in the root directory:
```
OMDB_API_KEY=your_omdb_api_key_here
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

4. Initialize the database schema (optional - will auto-create on first use):
```bash
npx tsx scripts/init-db.ts
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database

The app uses **Neon Postgres** (serverless PostgreSQL) for storing movie statuses. The database schema is automatically created on first use, or you can initialize it manually using the script above.

## Deployment to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `OMDB_API_KEY` = your OMDb API key
   - `DATABASE_URL` = your Neon connection string
4. Deploy!

## Usage

- Click "Show Debug Options" to change the number of movies displayed at once
- Click "Seen It" to mark a movie as seen
- Click "Nope" to mark a movie as not seen
- The app automatically moves to the next set of movies after marking

