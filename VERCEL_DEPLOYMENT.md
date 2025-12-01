# Vercel Deployment Configuration

## Prevent Deployment on Test Failures

Since Vercel doesn't have a built-in "wait for checks" option, we need to use Vercel's **"Ignored Build Step"** feature.

## Setup Instructions

### Step 1: Add GitHub Token to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add a new environment variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Create a GitHub Personal Access Token with `repo` scope
     - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
     - Generate new token with `repo` scope
     - Copy the token and paste it as the value
   - **Environment**: Production, Preview, Development (select all)

### Step 2: Configure Ignored Build Step in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Scroll down to **"Ignored Build Step"**
3. Add this command:

```bash
bash scripts/check-github-status.sh
```

Or if you prefer a simpler inline version:

```bash
# Check if GitHub Actions workflow has passed
COMMIT_SHA=$VERCEL_GIT_COMMIT_SHA
REPO=$(echo $VERCEL_GIT_REPO_SLUG | cut -d'/' -f2)
OWNER=$(echo $VERCEL_GIT_REPO_SLUG | cut -d'/' -f1)

if [ -z "$GITHUB_TOKEN" ] || [ -z "$COMMIT_SHA" ]; then
  echo "Missing required env vars, allowing build"
  exit 0
fi

STATUS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runs?head_sha=$COMMIT_SHA&per_page=1" \
  | grep -o '"conclusion":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$STATUS" = "success" ]; then
  echo "Tests passed, allowing build"
  exit 0
else
  echo "Tests failed or not completed, skipping build"
  exit 1
fi
```

### How It Works

- **Exit code 0** = Allow build (tests passed)
- **Exit code 1** = Skip build (tests failed or still running)

Vercel will:
- ✅ Run the script before building
- ✅ Only deploy if script returns exit code 0
- ✅ Skip deployment if script returns exit code 1

## Alternative: Simpler Approach (No API Token Needed)

If you don't want to use GitHub API, you can use a simpler approach that relies on branch protection:

1. In Vercel Dashboard → Settings → Git → **"Ignored Build Step"**
2. Add this command:

```bash
# Only deploy from main/develop branches after manual merge
# This ensures PR checks have passed before merge
[ "$VERCEL_GIT_COMMIT_REF" = "main" ] || [ "$VERCEL_GIT_COMMIT_REF" = "develop" ]
```

This is less strict but works if you:
- Use branch protection rules in GitHub
- Require PR checks to pass before merging
- Only deploy from protected branches

## Recommended: Use Branch Protection + Ignored Build Step

1. **GitHub**: Enable branch protection for `main` and `develop`
   - Require status checks to pass
   - Require the "Tests" workflow to pass
   
2. **Vercel**: Use the simple branch check in "Ignored Build Step"

This ensures:
- Tests must pass before PR can be merged (GitHub protection)
- Only merged code gets deployed (Vercel check)
