# Neon Database Setup Guide

## Quick Start

1. **Sign up for Neon** (free tier available)
   - Go to https://neon.tech
   - Sign up with GitHub (recommended) or email
   - Create a new project

2. **Get your connection string**
   - In Neon dashboard, go to your project
   - Click "Connection Details" or find "Connection String"
   - Copy the full connection string
   - It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

3. **Add to your `.env.local` file**:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

4. **Initialize the database** (optional - auto-creates on first use):
   ```bash
   npx tsx scripts/init-db.ts
   ```

That's it! The database will automatically create the necessary tables when you first use the app.

## For Vercel Deployment

When deploying to Vercel:

1. In Vercel dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your Neon connection string
3. Make sure to add it for all environments (Production, Preview, Development)

## Database Schema

The app creates a single table:

```sql
CREATE TABLE movie_statuses (
  movie_id VARCHAR(255) PRIMARY KEY,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Seen-Liked', 'Seen-Hated', 'Not Seen')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Neon Free Tier Limits

- 0.5 GB storage
- Unlimited projects
- Serverless (scales automatically)
- Perfect for this use case!

## Troubleshooting

**Connection errors?**
- Make sure `sslmode=require` is in your connection string
- Check that your Neon project is active (not paused)
- Verify the connection string is correct

**Schema errors?**
- The schema auto-creates on first API call
- Or run: `npx tsx scripts/init-db.ts`

