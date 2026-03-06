---
name: normalizers
description: Transform external API responses to internal data types. Use when receiving data from external APIs that need to be converted to project types.
scope: [api-routes, serializers]
---

# Normalizers

## Overview

Normalizers transform data from external API responses (verbose names) to our internal types (short, simple names). They handle field name mapping, data transformation, type conversion, and data validation for incoming responses.

**Full documentation**: See `src/lib/TRANSFORMATIONS.md` for complete field mappings and examples (create if integrating external APIs).

**Where to use**: Only in **Route Handlers** when the route calls an external API. Actions and hooks do not use normalizers (they call the internal API, which already returns internal format).

## Location

All normalizers go in `src/lib/normalizers/`. Use kebab-case for file names. Export from `src/lib/normalizers/index.ts`.

```
src/lib/normalizers/
├── user-normalizer.ts
├── index.ts
└── README.md
```

## Structure

```tsx
// src/lib/normalizers/user-normalizer.ts
import type { User } from "@/types/user";
import type { ExternalUser } from "@/types/external-user";

const normalizeRole = (role: string): User["role"] => {
  const roleMap: Record<string, User["role"]> = {
    admin: "admin",
    user: "user",
    guest: "guest",
  };
  return roleMap[role.toLowerCase()] || "user";
};

export const normalizeUser = (external: ExternalUser): User => {
  return {
    id: external._id,
    name: external.fullName,
    email: external.emailAddress,
    role: normalizeRole(external.userRole),
  };
};

export const normalizeUserList = (externals: ExternalUser[]): User[] => {
  return externals.map(normalizeUser);
};
```

## Usage in Route Handlers

```tsx
// src/app/api/users/route.ts
import { normalizeUserList } from "@/lib/normalizers";
import { externalClient } from "@/lib/api/external-client";
import type { ExternalUsersResponse } from "@/types/external-user";

const response = await externalClient.get<ExternalUsersResponse>("users?pageNumber=1&pageSize=10");
const users = normalizeUserList(response.data?.users ?? []);
return NextResponse.json({ users });
```

## Important Notes

- **Location**: `src/lib/normalizers/` (not `src/normalizers/`)
- **File naming**: Use kebab-case (e.g., `user-normalizer.ts`)
- **One-way transformation** - Normalizers only convert external → internal format
- **Use serializers for the opposite** - Internal → external (see serializers skill)
- **Keep normalizers pure** - No side effects, just data transformation
- **External types**: Define in `@/types/external-{resource}` (e.g. `ExternalUser`, `ExternalUsersResponse`)
