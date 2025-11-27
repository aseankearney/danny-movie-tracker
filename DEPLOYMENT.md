# Deployment Guide

This guide will walk you through deploying your movie tracker app to Vercel with Neon Postgres database.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Neon account (sign up at https://neon.tech)

## Step 1: Set Up Neon Database

1. **Create a Neon account**
   - Go to https://neon.tech
   - Sign up with GitHub (recommended) or email
   - Create a new project

2. **Get your connection string**
   - In your Neon dashboard, go to your project
   - Click on "Connection Details" or "Connection String"
   - Copy the connection string (it looks like: `postgresql://user:password@hostname/database?sslmode=require`)

3. **Initialize the database schema**
   - The schema will be created automatically when you first use the app
   - Or you can run the init script locally:
     ```bash
     DATABASE_URL=your_neon_connection_string npx tsx scripts/init-db.ts
     ```

## Step 2: Push Code to GitHub

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Movie tracker app"
   ```

2. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Name your repository (e.g., "danny-movie-tracker")
   - Choose public or private
   - **Don't** initialize with README (we already have one)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. **Import your repository**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

2. **Configure environment variables**:
   - In the "Environment Variables" section, add:
     - `TMDB_API_KEY` = your TMDb API key
     - `DATABASE_URL` = your Neon connection string
   - Click "Add" for each variable

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - Wait for deployment to complete (usually 1-2 minutes)

4. **Initialize database** (first time only):
   - After deployment, visit your app URL
   - The database schema will be created automatically on first API call
   - Or you can manually trigger it by visiting: `https://your-app.vercel.app/api/movies`

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL (shown after deployment)
2. The app should load and fetch movies from TMDb
3. Try marking a movie as "Seen It" or "Never Seen It" to test the database

## Troubleshooting

### Database Connection Issues

- Make sure your `DATABASE_URL` is set correctly in Vercel
- Check that your Neon database is active (not paused)
- Verify the connection string includes `?sslmode=require`

### API Key Issues

- Ensure `TMDB_API_KEY` is set in Vercel environment variables
- Check that the API key is valid

### Build Errors

- Check the Vercel build logs for specific errors
- Make sure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Updating Your Deployment

After making changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. Vercel will automatically redeploy your app

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

