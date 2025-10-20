---
description: Sync repository and prepare for development work
---

# Start Work Session

You are helping the user start a new development session on the Casi Platform.

## Tasks to perform:

1. **Check git status** to see if there are any uncommitted changes
   - If there are uncommitted changes, warn the user and ask if they want to stash them before pulling

2. **Pull latest changes** from the remote repository:
   ```bash
   git pull
   ```

3. **Install/update dependencies** if needed:
   ```bash
   npm install
   ```

4. **Verify the environment** is ready:
   ```bash
   npm run verify:env
   ```

5. **Show a summary** of:
   - Latest commits pulled (if any)
   - Any dependency changes
   - Current branch
   - Environment status

6. **Confirm ready** - Tell the user they're ready to start developing!

## Important:
- If there are merge conflicts, help the user resolve them
- If dependencies fail to install, diagnose the issue
- If environment variables are missing, guide them to run `vercel env pull .env.local --environment=production`

Be concise and efficient - this should be a quick setup process.
