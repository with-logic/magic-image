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
