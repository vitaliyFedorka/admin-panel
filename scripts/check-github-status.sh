#!/bin/bash

# Script to check if GitHub Actions tests have passed
# This is used in Vercel's "Ignored Build Step" to prevent deployment if tests fail

# Debug: Print available environment variables (will be visible in Vercel logs)
echo "=== Debug Info ==="
echo "VERCEL_GIT_COMMIT_SHA: ${VERCEL_GIT_COMMIT_SHA:-not set}"
echo "VERCEL_GIT_REPO_SLUG: ${VERCEL_GIT_REPO_SLUG:-not set}"
echo "GITHUB_TOKEN: ${GITHUB_TOKEN:+set (hidden)}${GITHUB_TOKEN:-not set}"
echo "=================="

# Get the commit SHA
COMMIT_SHA=${VERCEL_GIT_COMMIT_SHA}

# If no commit SHA, allow build (for manual deployments)
if [ -z "$COMMIT_SHA" ]; then
  echo "No commit SHA found, allowing build"
  exit 0
fi

# Get repository info from Vercel environment
# VERCEL_GIT_REPO_SLUG format: "owner/repo"
REPO_SLUG=${VERCEL_GIT_REPO_SLUG}

if [ -z "$REPO_SLUG" ]; then
  echo "Repository slug not available, allowing build"
  exit 0
fi

REPO_OWNER=$(echo $REPO_SLUG | cut -d'/' -f1)
REPO_NAME=$(echo $REPO_SLUG | cut -d'/' -f2)

# If we don't have repo info, allow build
if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
  echo "Could not parse repository info, allowing build"
  exit 0
fi

# Check GitHub Actions status using GitHub API
# Note: This requires GITHUB_TOKEN to be set in Vercel environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN not set, allowing build (set it in Vercel env vars for protection)"
  exit 0
fi

# Configuration: Wait up to 45 seconds for workflow to complete
# (Vercel's Ignored Build Step timeout is ~60 seconds)
MAX_WAIT_TIME=45
WAIT_INTERVAL=5
ELAPSED_TIME=0

API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?head_sha=$COMMIT_SHA&per_page=1"

echo "Checking GitHub Actions status for: $REPO_OWNER/$REPO_NAME @ $COMMIT_SHA"

# Retry loop: Check workflow status and wait if needed
while [ $ELAPSED_TIME -lt $MAX_WAIT_TIME ]; do
  echo "Checking workflow status (${ELAPSED_TIME}s elapsed)..."
  
  WORKFLOW_RUNS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "$API_URL")
  
  # Check for API errors
  if echo "$WORKFLOW_RUNS" | grep -q '"message"'; then
    ERROR_MSG=$(echo "$WORKFLOW_RUNS" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "GitHub API error: $ERROR_MSG"
    echo "Allowing build (API error)"
    exit 0
  fi
  
  # Check if we got any workflow runs
  TOTAL_COUNT=$(echo "$WORKFLOW_RUNS" | grep -o '"total_count":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -z "$TOTAL_COUNT" ] || [ "$TOTAL_COUNT" = "0" ]; then
    echo "No workflow runs found for this commit, allowing build"
    exit 0
  fi
  
  # Check if workflow exists and get its status
  STATUS=$(echo "$WORKFLOW_RUNS" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
  CONCLUSION=$(echo "$WORKFLOW_RUNS" | grep -o '"conclusion":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  echo "Workflow status: $STATUS, conclusion: ${CONCLUSION:-none}"
  
  # If workflow completed successfully, allow build
  if [ "$CONCLUSION" = "success" ]; then
    echo "✅ GitHub Actions tests passed, allowing build"
    exit 0
  fi
  
  # If workflow failed or was cancelled, prevent build
  if [ "$CONCLUSION" = "failure" ] || [ "$CONCLUSION" = "cancelled" ]; then
    echo "❌ GitHub Actions tests failed or were cancelled, preventing build"
    exit 1
  fi
  
  # If workflow is still running, wait and retry
  if [ "$STATUS" = "in_progress" ] || [ "$STATUS" = "queued" ]; then
    echo "Workflow still running (${STATUS}), waiting ${WAIT_INTERVAL}s... (${ELAPSED_TIME}/${MAX_WAIT_TIME}s elapsed)"
    sleep $WAIT_INTERVAL
    ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
    continue
  fi
  
  # If status is "completed" but conclusion is not success/failure/cancelled, allow build
  if [ "$STATUS" = "completed" ]; then
    echo "Workflow completed with conclusion: ${CONCLUSION:-unknown}, allowing build"
    exit 0
  fi
  
  # Unknown status, wait and retry
  echo "Unknown workflow status: $STATUS, waiting ${WAIT_INTERVAL}s..."
  sleep $WAIT_INTERVAL
  ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
done

# Timeout reached - workflow still running
echo "⏱️  Timeout: Workflow still running after ${MAX_WAIT_TIME}s"
echo "⚠️  Skipping build. Tests may complete later - you can manually redeploy in Vercel once tests pass."
exit 1

