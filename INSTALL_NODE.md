# Installing Node.js on macOS

You need Node.js (which includes npm) to run this project. Here are the easiest ways to install it:

## Option 1: Install Homebrew first (Recommended)

Homebrew is a package manager for macOS that makes installing software easy.

1. **Install Homebrew:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   
   Follow the prompts. This may take a few minutes.

2. **After Homebrew is installed, install Node.js:**
   ```bash
   brew install node
   ```

3. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

## Option 2: Download Node.js directly

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the instructions
4. Restart your terminal after installation

## Option 3: Use nvm (Node Version Manager)

If you want to manage multiple Node.js versions:

1. **Install nvm:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Restart your terminal, then install Node.js:**
   ```bash
   nvm install --lts
   nvm use --lts
   ```

## After Installation

Once Node.js is installed, come back to this directory and run:

```bash
npm install
npm run dev
```

