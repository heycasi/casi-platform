---
description: Commit and push changes to end work session
---

# End Work Session

You are helping the user wrap up their development session on the Casi Platform.

## Tasks to perform:

1. **Check git status** to see what changes were made:
   ```bash
   git status
   ```

2. **Show a summary** of changes:
   - List modified files
   - Show a brief diff overview if helpful

3. **Stage all changes**:
   ```bash
   git add .
   ```

4. **Create a commit** with a descriptive message:
   - Ask the user what they worked on if not obvious from the changes
   - Suggest a commit message based on the changes
   - Use the commit message format they prefer

5. **Push to remote**:
   ```bash
   git push
   ```

6. **Confirm completion**:
   - Show commit hash and message
   - Confirm changes are pushed
   - Remind them they can safely switch to the other machine

## Important:
- If there are no changes to commit, inform the user
- If push fails (e.g., need to pull first), guide them through resolution
- Be helpful with commit message suggestions but let user decide final message

Be concise - this should be a quick wrap-up process.
