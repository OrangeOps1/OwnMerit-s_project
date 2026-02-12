# Team Collaboration Guide

This guide defines how the team works on GitHub during the hackathon.

## Workflow (Issues -> Branches -> PRs)

1. Lead creates GitHub issues for each task.
2. Each teammate picks one issue and assigns themselves.
3. Teammate creates a branch from `main` using the issue number.
4. Teammate opens a PR linked to the issue.
5. Another teammate reviews quickly before merge.
6. Merge to `main` and close the issue.

## Branch naming

Use this format:

- `feat/<issue-number>-<short-title>`
- `fix/<issue-number>-<short-title>`
- `docs/<issue-number>-<short-title>`

Examples:

- `feat/12-submission-upload`
- `fix/18-admin-approve-endpoint`
- `docs/25-update-api-contract`

## Commit style

Keep commits small and focused:

- `feat(api): add activity create endpoint`
- `fix(admin): prevent approving missing submission`
- `docs(readme): add setup troubleshooting`

## Pull request checklist

Before opening PR:

- Branch is up to date with `main`
- Feature works locally
- No secrets committed (`.env`, API keys)
- API/documentation updated if behavior changed

PR should include:

- What changed
- Why it changed
- How to test
- Linked issue (example: `Closes #12`)

## Issue template suggestion

Use this structure when creating issues:

- **Title:** clear and short
- **Goal:** expected outcome
- **Scope:** what to include / exclude
- **Acceptance criteria:** testable checklist
- **Owner:** teammate name

Example acceptance criteria:

- User can submit proof text
- User can upload proof image URL
- Submission status defaults to `pending`

## Daily sync (lightweight)

During hackathon, do quick syncs every 45-60 minutes:

- What is done
- What is blocked
- What is next

If blocked for more than 15 minutes, ask in team chat and move to another issue.

## Merge strategy

- Prefer squash merge for clean history
- Delete branch after merge
- Never force-push to `main`
