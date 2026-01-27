---
name: api-routes
description: Create and work with Next.js Route Handlers in src/app/api/. Use when creating API endpoints, handling HTTP requests, or working with server-side API logic in App Router.
scope: [app-router]
---

# Next.js Route Handlers (App Router)

## Structure

Route handlers go in `src/app/api/` and automatically become endpoints.

- `src/app/api/users/route.ts` → `/api/users`
- `src/app/api/users/[id]/route.ts` → `/api/users/[id]`
- `src/app/api/posts/[id]/comments/route.ts` → `/api/posts/[id]/comments`

## Basic Route Handler

```tsx
// src/app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}
```

## HTTP Methods

Handle different HTTP methods by exporting named functions:

```tsx
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/users
export async function GET() {
  const users = await fetchUsers();
  return NextResponse.json({ data: users });
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const user = await createUser({ name, email });
  return NextResponse.json({ data: user }, { status: 201 });
}
```

## Dynamic Routes

```tsx
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  
  const user = await fetchUser(id);
  
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: user });
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  const user = await updateUser(id, body);
  return NextResponse.json({ data: user });
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  
  await deleteUser(id);
  return new NextResponse(null, { status: 204 });
}
```

## Request Body

```tsx
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email } = body;

  // Validate
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Process
  const user = await createUser({ name, email });

  return NextResponse.json({ data: user }, { status: 201 });
}
```

## Query Parameters

```tsx
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || "10";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  const results = await search(query, Number(limit));

  return NextResponse.json({ data: results });
}
```

## Headers

```tsx
// src/app/api/protected/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  // Validate token...

  return NextResponse.json({ data: "Protected data" });
}
```

## Cookies

```tsx
// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Authenticate user...
  const token = await authenticate(email, password);

  const response = NextResponse.json({ success: true });
  
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  return NextResponse.json({ success: true });
}
```

## Error Handling

```tsx
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await fetchUser(id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Streaming Response

```tsx
// src/app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`data: ${i}\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## Response Helpers

```tsx
import { NextResponse } from "next/server";

// JSON response
NextResponse.json({ data: "value" });

// JSON with status
NextResponse.json({ error: "Not found" }, { status: 404 });

// Redirect
NextResponse.redirect(new URL("/login", request.url));

// Rewrite
NextResponse.rewrite(new URL("/api/v2/users", request.url));

// No content
new NextResponse(null, { status: 204 });

// Custom headers
NextResponse.json(
  { data: "value" },
  {
    headers: {
      "X-Custom-Header": "value",
    },
  }
);
```

## Important Notes

- **File must be named `route.ts`** - not `page.tsx`
- **Export named functions** - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`
- **Params are Promises** - await `context.params` to get dynamic route params
- **Use `NextRequest`** for typed request object
- **Use `NextResponse`** for response helpers
- **No default export** - only named HTTP method exports
- **Access query params** via `request.nextUrl.searchParams`
- **Access body** via `await request.json()`
- **Access headers** via `request.headers.get("name")`
- Route handlers are server-side only
- Can't have `route.ts` and `page.tsx` in same folder
