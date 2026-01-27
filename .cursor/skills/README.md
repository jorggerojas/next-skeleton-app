# Cursor Skills

These skills are read **automatically** by:

1. **MCPs** - Read directly from `.cursor/skills/`

## How do they work?

### In Cursor

- Agents automatically read `SKILL.md` files in `.cursor/skills/`
- They use the frontmatter description to decide when to apply each skill
- They follow the instructions in the skill content

## Structure

Each skill must have:

- A directory with the skill name
- A `SKILL.md` file with YAML frontmatter and markdown content

```txt
.cursor/skills/
├── components-ui/
│   └── SKILL.md
├── api-routes/
│   └── SKILL.md
└── ...
```

## Frontmatter

```yaml
---
name: skill-name
description: Description that helps the agent decide when to use this skill
scope: [related-skill1,related-skill2]
---
```

### Scope

The `scope` field is optional and lists related skills that should be considered when using this skill. When a skill has scope, the agent should check those related skills for additional context and rules.

Example: `components-ui` has `scope: [stores,testing]` because when creating components, you might need to understand how to use stores and how to write tests for them.

## Available Skills

- **api-routes** (scope: app-router): Create and work with Next.js Route Handlers in src/app/api/. Use when creating API endpoints or handling HTTP requests.
- **app-router** (scope: hooks, stores, components-ui): Work with Next.js App Router in src/app/. Use when creating pages, layouts, loading states, or error boundaries.
- **components-ui** (scope: stores, testing): Create and organize UI components in src/components/. Use when creating new custom components.
- **hierarchy** (scope: components-ui, hooks, stores, app-router): Define the components hierarchy and how to mix components.
- **hooks** (scope: testing): Create and use custom React hooks in src/hooks/.
- **providers** (scope: stores): Create, configure, and centralize React providers in src/providers/.
- **schemas** (scope: components-ui, hooks, app-router, testing): Define the form schemas with yup.
- **stores** (scope: testing): Create and manage Zustand stores for UI state in src/stores/.
- **testing**: Write and organize tests using Vitest, React Testing Library, and Playwright.
