---
name: serializers
description: Create and use serializers to transform internal data types to external API format. Use when sending data to external APIs that require different field names or structure.
scope: [api-routes, normalizers]
---

# Serializers

## Overview

Serializers transform data from our internal types (short, simple names) to the format expected by external APIs (verbose names). They handle field name mapping, data transformation, and type conversion for outgoing requests.

**Full documentation**: See `src/lib/TRANSFORMATIONS.md` for complete field mappings and examples (create if integrating external APIs).

**Where to use**: Only in **Route Handlers** when the route sends data to an external API. Actions and hooks do not use serializers (they send internal format to the internal API).

## Location

All serializers go in `src/lib/serializers/`. Use kebab-case for file names. Export from `src/lib/serializers/index.ts`.

```text
src/lib/serializers/
├── user-serializer.ts
├── index.ts
└── README.md
```

## Structure

```tsx
// src/lib/serializers/user-serializer.ts
import type { User, CreateUserBody, UpdateUserBody } from "@/types/user";

export interface ExternalUserDTO {
  _id: string;
  fullName: string;
  emailAddress: string;
  userRole: string;
}

export interface CreateUserDTO {
  fullName: string;
  emailAddress: string;
  userRole: string;
}

const serializeRole = (role: User["role"]): string => role.toLowerCase();

export const serializeUser = (user: User): ExternalUserDTO => {
  return {
    _id: user.id,
    fullName: user.name,
    emailAddress: user.email,
    userRole: serializeRole(user.role),
  };
};

export const serializeCreateUser = (data: CreateUserBody): CreateUserDTO => {
  return {
    fullName: data.name,
    emailAddress: data.email,
    userRole: serializeRole(data.role),
  };
};
```

## Usage in Route Handlers

```tsx
// src/app/api/users/route.ts
import { serializeCreateUser } from "@/lib/serializers";
import { normalizeUser } from "@/lib/normalizers";
import { externalClient } from "@/lib/api/external-client";
import type { CreateUserBody } from "@/types/user";
import type { ExternalUserResponse } from "@/types/external-user";

const serializedData = serializeCreateUser(body);
const response = await externalClient.post<ExternalUserResponse>("users", serializedData);
const user = response.data?.data ? normalizeUser(response.data.data) : null;
return NextResponse.json({ user }, { status: 201 });
```

## Important Notes

- **Location**: `src/lib/serializers/` (not `src/serializers/`)
- **File naming**: Use kebab-case (e.g., `user-serializer.ts`)
- **One-way transformation** - Serializers only convert internal → external format
- **Use normalizers for the opposite** - External → internal (see normalizers skill)
- **Keep serializers pure** - No side effects, just data transformation
- **Internal types**: Define in `@/types/{resource}` (e.g. `User`, `CreateUserBody`, `UpdateUserBody`)
