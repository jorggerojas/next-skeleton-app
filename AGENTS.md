# Project

## Overview

Next.js starter/skeleton project with App Router. Pre-configured with modern tooling for linting, testing, and releases.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- bun

## Key Dependencies

- **State**: Zustand
- **Forms**: react-hook-form + Zod
- **Icons**: lucide-react
- **Toasts**: Sonner
- **Analytics**: react-gtm-module

## Development Commands

- `bun dev` - Start dev server
- `bun build` - Production build
- `bun lint` - Lint and fix with Biome
- `bun test` - Run Vitest unit tests
- `bun test:coverage` - Run tests with coverage
- `bun release:[minor|patch|major]` - Create release with standard-version (according to the type of release)

## Environment Setup

Copy `.env.example` to `.env.local` for local development. Use `.env.test` for test environment (CI).

## Key Features

- Biome for linting/formatting (replaces ESLint + Prettier)
- Vitest + Testing Library for unit tests
- Playwright for E2E tests
- Husky + commitlint for conventional commits
- standard-version for semantic releases
- GitHub Actions workflow for Playwright

## Development Principles & Patterns

- Follow conventional commits (enforced by commitlint)
- Run `bun lint` before committing (enforced by husky pre-commit)
- Use Zustand for global state, react-hook-form for form state
- Validate forms with Zod schemas
- No CSS modules, no CSS files, only `src/app/globals.css` and all the related styles will be placed as classNames with Tailwind.
- Server Components by default, use `"use client"` only when needed

## Extra notes

- USE APP ROUTER ALWAYS
- App Router structure: `src/app/`
- API routes: `src/app/api/`
- Global styles: `src/app/globals.css`
- Test setup: `src/tests/setup.tsx`

## TypeScript & Types

- **All types go in `src/types/`** - organize by domain or feature
- **Avoid `any` type at all costs** - use proper types, `unknown`, or generics
- **Use TypeScript strictly** - enable strict mode in `tsconfig.json`
- **Define interfaces for props** - never use inline object types for component props
- **Export types from type files** - import from `@/types/*` alias
