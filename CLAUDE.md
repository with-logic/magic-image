# CLAUDE.md

## What This Is

magic-image - A React component for generating new content imagery on the fly using LLMs

## Codebase Map

```
docs/              # Detailed documentation (see below)
```

## Commands

```bash
npm run pre-commit   # ALWAYS run before committing (formats, lints, typechecks)
```

## Commit Process

1. Stage changes: `git add .`
2. Run checks: `npm run pre-commit`
3. If checks pass, commit with format: `[LOG-XXXX] Description` or `[NO-TICKET] Description`

## When to Read Additional Docs

Before starting work, decide which docs are relevant and read them:

| Doc                    | Read when...                                       |
| ---------------------- | -------------------------------------------------- |
| `docs/testing.md`      | Writing or modifying tests                         |
| `docs/code-quality.md` | Need patterns for TypeScript, hooks, accessibility |

## Key Patterns (Quick Reference)

- **Styling**: Tailwind CSS with design tokens
- **Automated Testing**: react-testing-library for component and hook tests
- **Visual Testing**: storybook for visual testing and consistency

## Critical Rules

1. **Run `npm run pre-commit` before every commit** - formatting and linting are handled by tools, not Claude
2. **Read files before modifying them** - understand existing code first
3. **Use existing patterns** - search codebase for similar implementations
4. **Avoid over-engineering** - only make requested changes

## Required local review

This step needs read access to `with-logic/skills`, which is private to Logic. If
you do not have that access (Crew reports that it cannot reach
`with-logic/skills`), skip the local review. This is not a failed preparation: do
not ask the user about it, and say in the pull request that the local review was
skipped.

This section applies to local coding-agent sessions only. A hosted CI review
gets its instructions from the workflow. In hosted CI, do not run Crew and do not
treat missing Crew as a failed review. Run the local review before you open a
pull request. It does not replace the hosted review, which stays the merge
requirement.

Prepare each required local review in the existing coding-agent session with the
commands in [Shared local review](#shared-local-review). Then read the updated
project `review/SKILL.md`: `.agents/skills/review/SKILL.md` for Codex or
`.claude/skills/review/SKILL.md` for Claude Code. Follow its shared preparation
procedure to verify this agent's full roster, helper and source records, then
continue `/review` in this session. Refresh once per `/review` run.

Failed preparation stops required review. A timeout is a failed preparation. If
you cannot recover the preparation for any other reason, report the local review
as not run and ask the user before you open the pull request. A successful `npm install`, a
`no_agents` result, or another agent's install does not prove readiness. Do not
use stale or personal skills as a fallback. See
[Shared local review](#shared-local-review) for setup and recovery.

The shared procedure includes proposed PR title and body text from the separately
installed pull-request-description helper. This local step does not edit the PR
or change the code-review verdict. Keep `.crewrc` and its generated lock tracked
and downloaded copies ignored. Do not commit files under `.agents/skills/` or
`.claude/skills/` that Crew installed. As the agent, do not discard a
`.crewrc.lock` change. The pull request author commits it in the pull request
under review, or discards it after the review with `git restore .crewrc.lock`.
Do not refresh while reviewers run. Do not add a
script or workflow to this repository that downloads or selects review skills.

## Shared local review

Shared review skills and the PR-description helper come from `.crewrc` through
Crew. `npm install` does not run Crew.

Use a published [Crew release](https://crew.logic.inc/) with project manifests
(0.13+; 0.14.0 verified). Run `crew version` and check Git read access to
`with-logic/skills`. Enable the agent if needed with `crew agents enable codex`
or `crew agents enable claude-code`, then run this from the repository root with
a command timeout:

```sh
crew install --latest --json
```

A failure exits nonzero; fix the reported cause and run it again. For a
`no_agents` result, enable your agent with the command above. A zero exit does
not prove that your agent is ready. The preparation checks of each review confirm
it.

Commit `.crewrc` and its Crew-generated `.crewrc.lock`. Plain `crew install`
retains the locked revision; `--latest` can advance it. Each refresh installs the
current `main` of `with-logic/skills` before this repository reviews the lock
change; the lock then names the revision that ran. Commit a lock advance in the
pull request under review, so that reviewers see it. After a discard, the
installed copies are newer than the lock until the next `crew install`. If
`.crewrc.lock` conflicts with the base branch, keep the base branch's lock; the
next refresh can advance it again. Downloaded project skills
stay ignored; authored and personal skills remain owned by their authors.
