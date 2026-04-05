# SKILL.md - GitHub Automation

## Description
Auto-issue triaging, PR review, and repo management.

## Commands
- "Triage issues in [repo]"
- "Review PR [number]"
- "Detect stale repos"

## Execution
1. List open issues, apply labels via issueLabels API
2. PR review: check diff, run tests, post comment
3. Stale detection: check last commit date
4. Release: create tag, build changelog, publish