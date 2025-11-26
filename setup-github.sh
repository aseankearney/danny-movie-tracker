#!/bin/bash

# Setup script for pushing to GitHub

echo "🚀 Setting up GitHub repository..."

# Check if gh is authenticated
if ! gh auth status &>/dev/null; then
    echo "📝 GitHub CLI authentication required..."
    echo "Please follow these steps:"
    echo "1. Run: gh auth login"
    echo "2. Choose 'GitHub.com'"
    echo "3. Choose 'HTTPS'"
    echo "4. Authenticate via web browser"
    echo ""
    echo "Or create the repository manually at: https://github.com/new"
    exit 1
fi

# Get GitHub username
GITHUB_USER=$(gh api user --jq .login)
echo "✅ Authenticated as: $GITHUB_USER"

# Repository name
REPO_NAME="danny-movie-tracker"

# Check if repo already exists
if gh repo view "$GITHUB_USER/$REPO_NAME" &>/dev/null; then
    echo "📦 Repository already exists: $GITHUB_USER/$REPO_NAME"
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
    echo "🆕 Creating new repository: $REPO_NAME"
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
fi

echo ""
echo "✅ Setup complete!"
echo "Your repository is at: https://github.com/$GITHUB_USER/$REPO_NAME"

