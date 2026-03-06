---
name: git
description: Local git operations — commit, push, pull, branch, status, stash, log, diff
triggers:
  - "git commit"
  - "git push"
  - "git pull"
  - "git branch"
  - "git status"
  - "git stash"
  - "git log"
  - "git diff"
---

# Git Operations

Use `git` CLI directly for local version control.

## Common Commands

| Action | Command |
|--------|---------|
| Status | `git status` |
| Add all | `git add -A` |
| Add specific | `git add <file>` |
| Commit | `git commit -m "message"` |
| Push | `git push` |
| Push to branch | `git push -u origin <branch>` |
| Pull | `git pull` |
| Branch list | `git branch -a` |
| New branch | `git checkout -b <branch>` |
| Switch branch | `git checkout <branch>` |
| Stash | `git stash` |
| Stash pop | `git stash pop` |
| Log | `git log --oneline -10` |
| Diff | `git diff` |
| Diff staged | `git diff --cached` |

## Notes

- Always run `git status` first to see current state
- Use `git add -A` for committing all changes
- Include meaningful commit messages
