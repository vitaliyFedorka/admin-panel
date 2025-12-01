#!/bin/bash

# Script to check if GitHub Actions tests have passed
# This is used in Vercel's "Ignored Build Step" to prevent deployment if tests fail

# Get the commit SHA
COMMIT_SHA=${VERCEL_GIT_COMMIT_SHA:-$GITHUB_SHA}

# If no commit SHA, allow build (for manual deployments)
if [ -z "$COMMIT_SHA" ]; then
  echo "No commit SHA found, allowing build"
  exit 0
fi

# Get repository info
REPO_OWNER=${GITHUB_REPOSITORY_OWNER:-$(echo $GITHUB_REPOSITORY | cut -d'/' -f1)}
REPO_NAME=${GITHUB_REPOSITORY##*/}

# If we don't have repo info, allow build
if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
  echo "Repository info not available, allowing build"
  exit 0
fi

# Check GitHub Actions status using GitHub API
# Note: This requires GITHUB_TOKEN to be set in Vercel environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN not set, allowing build (set it in Vercel env vars for protection)"
  exit 0
fi

# Get the workflow run status
WORKFLOW_RUNS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?head_sha=$COMMIT_SHA&per_page=1")

# Check if workflow exists and get its status
STATUS=$(echo $WORKFLOW_RUNS | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
CONCLUSION=$(echo $WORKFLOW_RUNS | grep -o '"conclusion":"[^"]*"' | head -1 | cut -d'"' -f4)

# If workflow is still running, don't deploy (wait for it)
if [ "$STATUS" = "in_progress" ] || [ "$STATUS" = "queued" ]; then
  echo "GitHub Actions workflow is still running, skipping build"
  exit 1
fi

# If workflow completed successfully, allow build
if [ "$CONCLUSION" = "success" ]; then
  echo "GitHub Actions tests passed, allowing build"
  exit 0
fi

# If workflow failed or was cancelled, prevent build
if [ "$CONCLUSION" = "failure" ] || [ "$CONCLUSION" = "cancelled" ]; then
  echo "GitHub Actions tests failed or were cancelled, preventing build"
  exit 1
fi

# Default: allow build if we can't determine status
echo "Could not determine workflow status, allowing build"
exit 0

