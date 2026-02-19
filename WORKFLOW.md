# Trip Tailor Git Workflow

# Before you start any work, do this once and never again for the rest of the semester:

- "git fetch origin --prune" this downloads the latest version from GitHub, prune removes references to other potentially bad local branches

- "git checkout main" - switch to main branch
- "git reset --hard origin/main" this forces your local main to match the GitHub main exactly, and gets rid of uncommitted changes. This is the most important line
- "git clean -fd" this gets rid of any untracked files that havent been committed for safety.

## Then run these:
- "git checkout dev"
- "git reset --hard origin/dev"
- "git clean -fd" 
- "git status" this should return this: On branch dev, Your branch is up to date with 'origin/dev', nothing to commit, working tree clean

# Once you have done all of those commands above. Do this for everyday use. 
## Do this every time before you make any changes:
- "git checkout dev" to make sure you are on the dev (working) branch
- "git pull origin dev" this pulls the latest updates from GitHub dev into your local dev.

## When you accomplish something and want to push, do this: 
- "git add ." this stages all files that have changed
- "git commit -m "Make it a clear description of what you changed"
- "git push origin dev" this pushes your changes to the working branch

# Do not push to main, I will handle all pull requests from dev to main to make sure everything looks good. Do not worry if you see dev is x commits ahead of main, that is normal.

# If you see any of these, stop and message Anderson, you can send a picture or copy the error from your terminal
- "refusing to merge unrelated histories"
- "your branch has diverged"
- anything mentioning force push
- anything about rewriting history
- any other errors