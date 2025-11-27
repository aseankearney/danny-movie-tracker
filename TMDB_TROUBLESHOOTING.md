# TMDB Account Troubleshooting Guide

If you're getting a 403 error when trying to create a TMDB account, try these steps:

## Step 1: Basic Troubleshooting

1. **Clear Browser Cache and Cookies**
   - Clear all cookies and cache for themoviedb.org
   - Try again in an incognito/private browsing window

2. **Try a Different Browser**
   - If using Chrome, try Firefox or Safari
   - Sometimes browser extensions can interfere

3. **Check Your Email**
   - Make sure the email you're using isn't already registered
   - Try a different email address
   - Check your spam folder for verification emails

4. **Network Issues**
   - Try from a different network (mobile hotspot, different WiFi)
   - Some corporate/school networks block certain sites

## Step 2: Alternative Signup Methods

1. **Try the Mobile App**
   - Download the TMDB mobile app
   - Create an account through the app
   - Then access the website

2. **Use Social Login** (if available)
   - Some sites offer Google/Facebook login
   - Check if TMDB has this option

## Step 3: Contact TMDB Support

If nothing works:
- Email: support@themoviedb.org
- Forum: https://www.themoviedb.org/talk
- Twitter: @themoviedb

## Step 4: Alternative Solutions

### Option A: Use Mock Data for Testing
You can test the app with sample data while you work on getting an API key. The app structure is ready - you just need movie data.

### Option B: Manual Data Entry
For a small number of movies, you could manually add them to the database for testing.

## Getting Your TMDB API Key (Once Account is Created)

1. Log in to https://www.themoviedb.org
2. Go to Settings → API
3. Click "Request an API Key"
4. Select "Developer" (free)
5. Fill out the form (you can use "Personal" for use case)
6. Copy your API key
7. Add it to `.env.local`:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

## Quick Test

Once you have your API key set up, test it:
```bash
curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_API_KEY"
```

If this works, your API key is valid!

