# Setup Instructions

## Step 1: Install Node.js (if not already installed)

Check if Node.js is installed:
```bash
node --version
npm --version
```

If not installed, download from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)

## Step 2: Get a TMDB API Key

1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API
4. Request an API key (it's free and instant for basic use)
5. Copy your API key

## Step 3: Install Dependencies

In the project directory, run:
```bash
npm install
```

## Step 4: Set Up Environment Variables

Create a `.env.local` file in the root directory:
```bash
TMDB_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you got from TMDB.

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Deploy to Vercel

### First, push to GitHub:

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub (go to github.com and click "New repository")

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Then deploy to Vercel:

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Add environment variable:
   - Name: `TMDB_API_KEY`
   - Value: (your TMDB API key)
5. Click "Deploy"

Your app will be live in a few minutes!

## Troubleshooting

- **"TMDB_API_KEY is not set"**: Make sure you created `.env.local` with your API key
- **Movies not loading**: Check that your TMDB API key is valid and has proper permissions
- **Build errors**: Make sure all dependencies are installed with `npm install`

