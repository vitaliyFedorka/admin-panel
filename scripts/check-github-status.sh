#!/bin/bash

# Script to check if GitHub Actions tests have passed
# This is used in Vercel's "Ignored Build Step" to prevent deployment if tests fail

# Debug: Print available environment variables (will be visible in Vercel logs)
echo "=== Debug Info ==="
echo "VERCEL_GIT_COMMIT_SHA: ${VERCEL_GIT_COMMIT_SHA:-not set}"
echo "VERCEL_GIT_REPO_SLUG: ${VERCEL_GIT_REPO_SLUG:-not set}"
echo "VERCEL_GIT_COMMIT_REF: ${VERCEL_GIT_COMMIT_REF:-not set}"
echo "VERCEL_GIT_COMMIT_REF_SLUG: ${VERCEL_GIT_COMMIT_REF_SLUG:-not set}"
echo "VERCEL_GIT_PULL_REQUEST_ID: ${VERCEL_GIT_PULL_REQUEST_ID:-not set}"
echo "VERCEL_ENV: ${VERCEL_ENV:-not set}"
echo "GITHUB_TOKEN: ${GITHUB_TOKEN:+set (hidden)}${GITHUB_TOKEN:-not set}"
echo "=================="

# Get the branch/PR info
BRANCH_OR_PR=${VERCEL_GIT_COMMIT_REF:-${VERCEL_GIT_COMMIT_REF_SLUG}}

# Check if this is a PR preview deployment
# Vercel sets VERCEL_GIT_PULL_REQUEST_ID for PR deployments
# Also check VERCEL_ENV - preview deployments have VERCEL_ENV=preview
VERCEL_ENV=${VERCEL_ENV:-unknown}
IS_PREVIEW=false

if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
  IS_PREVIEW=true
  echo "📦 PR Preview deployment detected (PR #$VERCEL_GIT_PULL_REQUEST_ID)"
  echo "⏳ Waiting for tests to pass before deploying preview..."
elif [ "$VERCEL_ENV" = "preview" ]; then
  IS_PREVIEW=true
  echo "📦 Preview deployment detected (VERCEL_ENV=preview, branch: $BRANCH_OR_PR)"
  echo "⏳ Waiting for tests to pass before deploying preview..."
elif [ -n "$BRANCH_OR_PR" ] && [ "$BRANCH_OR_PR" != "main" ] && [ "$BRANCH_OR_PR" != "develop" ]; then
  IS_PREVIEW=true
  echo "📦 Preview deployment detected (branch: $BRANCH_OR_PR)"
  echo "⏳ Waiting for tests to pass before deploying preview..."
fi

if [ "$IS_PREVIEW" = "false" ]; then
  echo "🔒 Production branch detected: ${BRANCH_OR_PR:-unknown}"
  echo "⏳ Checking GitHub Actions status before deployment..."
fi

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

# Configuration: Wait until tests finish (Vercel will timeout after ~60s, but we'll wait as long as possible)
WAIT_INTERVAL=5
ELAPSED_TIME=0

# Build API URL - try by commit SHA first, but also prepare branch-based query for PRs
API_URL_BY_SHA="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?head_sha=$COMMIT_SHA&per_page=1"
API_URL_BY_BRANCH=""
if [ -n "$BRANCH_OR_PR" ]; then
  API_URL_BY_BRANCH="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?branch=$BRANCH_OR_PR&per_page=1"
fi

echo "Checking GitHub Actions status for: $REPO_OWNER/$REPO_NAME @ $COMMIT_SHA"
if [ -n "$BRANCH_OR_PR" ]; then
  echo "Branch: $BRANCH_OR_PR"
fi
echo "⏳ Waiting for tests to complete (will wait until tests finish or Vercel timeout)..."

# Retry loop: Check workflow status and wait until tests complete
# For main/develop branches, we wait until we get a conclusion (success or failure)
while true; do
  echo "Checking workflow status (${ELAPSED_TIME}s elapsed)..."
  
  # Make API call with timeout - try by commit SHA first
  WORKFLOW_RUNS=$(curl -s --max-time 10 -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "$API_URL_BY_SHA" 2>&1) || {
    echo "⚠️  Failed to call GitHub API (network error or timeout)"
    echo "Allowing build (API call failed)"
    exit 0
  }
  
  # Check for API errors
  if echo "$WORKFLOW_RUNS" | grep -q '"message"'; then
    ERROR_MSG=$(echo "$WORKFLOW_RUNS" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "GitHub API error: $ERROR_MSG"
    echo "Allowing build (API error)"
    exit 0
  fi
  
  # Check if curl returned an error
  if [ -z "$WORKFLOW_RUNS" ]; then
    echo "⚠️  Empty response from GitHub API"
    echo "Allowing build (empty API response)"
    exit 0
  fi
  
  # Check if we got any workflow runs
  TOTAL_COUNT=$(echo "$WORKFLOW_RUNS" | grep -o '"total_count":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -z "$TOTAL_COUNT" ] || [ "$TOTAL_COUNT" = "0" ]; then
    echo "No workflow runs found for commit SHA: $COMMIT_SHA"
    
    # If we have a branch name and it's a PR, try checking by branch name as well
    if [ -n "$API_URL_BY_BRANCH" ] && [ "$IS_PREVIEW" = "true" ] && [ $ELAPSED_TIME -ge 10 ]; then
      echo "Trying to find workflow by branch name: $BRANCH_OR_PR"
      WORKFLOW_RUNS_BY_BRANCH=$(curl -s --max-time 10 -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_URL_BY_BRANCH" 2>&1) || true
      
      if [ -n "$WORKFLOW_RUNS_BY_BRANCH" ] && ! echo "$WORKFLOW_RUNS_BY_BRANCH" | grep -q '"message"'; then
        TOTAL_COUNT_BY_BRANCH=$(echo "$WORKFLOW_RUNS_BY_BRANCH" | grep -o '"total_count":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$TOTAL_COUNT_BY_BRANCH" ] && [ "$TOTAL_COUNT_BY_BRANCH" != "0" ]; then
          echo "✅ Found workflow by branch name! Using that instead."
          WORKFLOW_RUNS="$WORKFLOW_RUNS_BY_BRANCH"
          TOTAL_COUNT="$TOTAL_COUNT_BY_BRANCH"
        fi
      fi
    fi
    
    # If still no workflow found, wait a bit to see if workflow starts
    if [ -z "$TOTAL_COUNT" ] || [ "$TOTAL_COUNT" = "0" ]; then
      # Wait longer for workflow to start - up to 50 seconds
      if [ $ELAPSED_TIME -lt 50 ]; then
        if [ "$IS_PREVIEW" = "true" ]; then
          echo "⏳ Waiting for workflow to start on preview... (${ELAPSED_TIME}s elapsed)"
        else
          echo "⏳ Waiting for workflow to start... (${ELAPSED_TIME}s elapsed)"
        fi
        sleep $WAIT_INTERVAL
        ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
        continue
      else
        echo "⚠️  No workflow found after waiting 50 seconds"
        echo "This might mean:"
        echo "  - Workflow hasn't started yet (GitHub Actions might be slow)"
        echo "  - Workflow is configured to run on different branches"
        echo "  - Commit SHA doesn't match workflow trigger"
        echo ""
        echo "💡 Check GitHub Actions to see if workflow is running"
        echo "💡 If workflow is running, Vercel will retry automatically once it completes"
        if [ "$IS_PREVIEW" = "true" ]; then
          echo "❌ Blocking preview deployment - workflow must run first"
        else
          echo "❌ Blocking deployment to ${BRANCH_OR_PR} - workflow must run first"
        fi
        exit 1
      fi
    fi
  fi
  
  # Check if workflow exists and get its status
  STATUS=$(echo "$WORKFLOW_RUNS" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
  CONCLUSION=$(echo "$WORKFLOW_RUNS" | grep -o '"conclusion":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  echo "Workflow status: $STATUS, conclusion: ${CONCLUSION:-none}"
  
  # Debug: Show raw response snippet for troubleshooting (only first time to avoid log spam)
  if [ $ELAPSED_TIME -eq 0 ]; then
    echo "API Response snippet: $(echo "$WORKFLOW_RUNS" | head -c 300)"
  fi
  
  # If workflow completed successfully, allow build
  if [ "$CONCLUSION" = "success" ]; then
    echo "✅ GitHub Actions tests passed, allowing build"
    exit 0
  fi
  
  # If workflow failed or was cancelled, prevent build
  # BUT: Only block if we're absolutely sure it failed (not if conclusion is empty/unknown)
  if [ -n "$CONCLUSION" ] && { [ "$CONCLUSION" = "failure" ] || [ "$CONCLUSION" = "cancelled" ]; }; then
    echo "❌ GitHub Actions tests failed or were cancelled (conclusion: $CONCLUSION)"
    echo "💡 Fix the failing tests and push again"
    echo "💡 Or check GitHub Actions logs to see what failed"
    if [ "$IS_PREVIEW" = "true" ]; then
      echo "❌ Blocking preview deployment - tests must pass"
    else
      echo "❌ Blocking deployment - tests must pass"
    fi
    exit 1
  fi
  
  # If conclusion is empty but status exists, wait for it to complete
  # We need a clear conclusion before allowing for all deployments
  if [ -z "$CONCLUSION" ] && [ -n "$STATUS" ]; then
    if [ "$IS_PREVIEW" = "true" ]; then
      echo "⚠️  Workflow found but conclusion is unclear (status: $STATUS) on preview"
      echo "🔄 Waiting for workflow to complete... (${ELAPSED_TIME}s elapsed)"
    else
      echo "⚠️  Workflow found but conclusion is unclear (status: $STATUS)"
      echo "🔄 Waiting for workflow to complete... (${ELAPSED_TIME}s elapsed)"
    fi
    sleep $WAIT_INTERVAL
    ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
    continue
  fi
  
  # If workflow is still running, wait and retry
  if [ "$STATUS" = "in_progress" ] || [ "$STATUS" = "queued" ] || [ "$STATUS" = "waiting" ]; then
    # Wait for tests to complete for ALL deployments (previews and production)
    if [ "$IS_PREVIEW" = "true" ]; then
      echo "⏳ Tests are running (status: ${STATUS}) on preview deployment"
      echo "🔄 Waiting for tests to complete... (${ELAPSED_TIME}s elapsed)"
    else
      echo "⏳ Tests are running (status: ${STATUS}) on ${BRANCH_OR_PR} branch"
      echo "🔄 Waiting for tests to complete... (${ELAPSED_TIME}s elapsed)"
    fi
    sleep $WAIT_INTERVAL
    ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
    continue
  fi
  
  # If status is "completed" but conclusion is not success/failure/cancelled
  if [ "$STATUS" = "completed" ]; then
    # For all deployments (previews and production), only allow if conclusion is "success"
    if [ "$CONCLUSION" != "success" ]; then
      if [ "$IS_PREVIEW" = "true" ]; then
        echo "❌ Workflow completed but conclusion is not 'success' (conclusion: ${CONCLUSION:-unknown})"
        echo "❌ Blocking preview deployment - tests must pass"
      else
        echo "❌ Workflow completed but conclusion is not 'success' (conclusion: ${CONCLUSION:-unknown})"
        echo "❌ Blocking deployment to ${BRANCH_OR_PR}"
      fi
      exit 1
    fi
    # Tests passed - allow build
    if [ "$IS_PREVIEW" = "true" ]; then
      echo "✅ Tests passed! Allowing preview deployment"
    else
      echo "✅ GitHub Actions tests passed, allowing build"
    fi
    exit 0
  fi
  
  # Unknown status, wait and retry for all deployments
  if [ "$IS_PREVIEW" = "true" ]; then
    echo "Unknown workflow status: $STATUS on preview, waiting ${WAIT_INTERVAL}s... (${ELAPSED_TIME}s elapsed)"
  else
    echo "Unknown workflow status: $STATUS, waiting ${WAIT_INTERVAL}s... (${ELAPSED_TIME}s elapsed)"
  fi
  sleep $WAIT_INTERVAL
  ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
  continue
done

