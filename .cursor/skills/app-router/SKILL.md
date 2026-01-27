---
name: app-router
description: Work with Next.js App Router in src/app/. Use when creating or modifying pages, layouts, loading states, error boundaries, or any route components in the App Router structure.
scope: [hooks,stores,components-ui]
---

# Next.js App Router

## Structure

This project uses **App Router** exclusively. All routes go in `src/app/`.

- Regular pages: `src/app/[folder]/page.tsx` → `/folder` route
- Dynamic routes: `src/app/[id]/page.tsx` → `/[id]` route
- Route groups: `src/app/(group)/page.tsx` → groups without affecting URL
- API routes: `src/app/api/[route]/route.ts` → `/api/[route]` endpoint
- Special files: `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`

## Creating Pages

### Basic Page

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About page</div>;
}
```

### Dynamic Route

```tsx
// src/app/users/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;
  
  return <div>User {id}</div>;
}
```

### Nested Dynamic Route

```tsx
// src/app/posts/[id]/[slug]/page.tsx
interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id, slug } = await params;
  
  return <div>Post {id} - {slug}</div>;
}
```

## Special Files

### layout.tsx

Root layout wraps all pages. Use for:

- Global providers
- Global styles
- Shared UI (header, footer)
- Metadata

```tsx
// src/app/layout.tsx
import "@/app/globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/providers";

export const metadata: Metadata = {
  title: "My App",
  description: "My App description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

### loading.tsx

Shows loading UI while page content loads:

```tsx
// src/app/users/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

### error.tsx

Handles errors in a route segment:

```tsx
// src/app/users/error.tsx
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### not-found.tsx

Custom 404 page:

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

## Data Fetching

### Server Components (Default)

By default, all components in App Router are Server Components. Fetch data directly:

```tsx
// src/app/posts/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  return res.json();
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

### Client Components

Use `"use client"` directive for interactive components:

```tsx
// src/app/counter/page.tsx
"use client";

import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

### Using Hooks in Client Components

Client components can use hooks for data fetching with React Query:

```tsx
// src/app/users/page.tsx
"use client";

import { useUsers } from "@/hooks/users";

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Metadata & SEO

### Static Metadata

```tsx
// src/app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our company",
  keywords: ["about", "company", "team"],
  openGraph: {
    title: "About Us",
    description: "Learn more about our company",
  },
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

### Dynamic Metadata

```tsx
// src/app/posts/[id]/page.tsx
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  return {
    title: post.title,
    description: post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160),
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

## Client-Side Navigation

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/contact");
  };

  return (
    <div>
      <Link href="/about">About</Link>
      <button onClick={handleNavigate}>Go to Contact</button>
    </div>
  );
}
```

## Route Groups

Organize routes without affecting URL structure:

```tsx
// src/app/(marketing)/about/page.tsx → /about
// src/app/(marketing)/pricing/page.tsx → /pricing
// src/app/(dashboard)/settings/page.tsx → /settings
```

## Parallel Routes

Render multiple pages in the same layout:

```tsx
// src/app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <>
      {children}
      {analytics}
      {team}
    </>
  );
}
```

## Important Notes

- **Always use App Router** - never Pages Router patterns
- **Server Components by default** - use `"use client"` only when needed
- **Use `next/navigation`** - not `next/router`
- **Params are Promises** - await `params` in async components
- **Metadata export** - use `metadata` or `generateMetadata` for SEO
- **Layouts are nested** - each segment can have its own layout
- **Loading states** - use `loading.tsx` for automatic loading UI
- **Error boundaries** - use `error.tsx` for error handling
- Global styles go in `src/app/globals.css`
- Use `AppProviders` in root layout for providers
