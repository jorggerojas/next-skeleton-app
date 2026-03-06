---
name: error-tracer
description: Trace all errors and send it to the error tracer manager (could be different ones) in one simple implementation. This tracer can manage ui, render, ux, api calls, flows, etc.
scope: [api-routes,skills,components-ui,hierarchy,hooks,normalizers,app-router,providers,schemas,serializers,stores,testing]
---

# error-tracer

## Context & architecture

- **`ErrorTracer`** (`src/lib/observability/error/ErrorTracer.ts`): Central tracer. Holds adapters, injects `env` and `timestamp`, applies rate limit (e.g. max 10/min), dedup (same source+message+stack within 5s), and throttle. Call `trace(error, context)` only where the error originates.
- **Adapters**: Implement the `ErrorTracer` interface (`init`, `trace`, `destroy`). Each adapter sends to one backend (Bugsnag, Sentry, console). The tracer loops over them; one call can hit all configured adapters. **Sentry** is used exclusively via `ErrorTracer` — its auto-capture is disabled; only events from `SentryAdapter` reach Sentry.
- **`traceApiError`** (`src/lib/observability/trace-api-error.ts`): Helper for Route Handlers. Decides *whether* to trace (e.g. 5xx always, 401/403/404 only when `alsoTrace401403404`), normalizes the error, then calls `errorTracer.trace`. Use this in Route Handlers instead of calling `errorTracer` directly for API failures.
- **Do not trace** in: `getApiErrorMessage`, server actions, or any layer that only forwards errors. That would duplicate or misattribute the same failure.
- **DO NOT DUPLICATE TRACING**, if you're tracing API route errors and they're returning expected errors to client components, DO NOT TRACE THEM AGAIN.

## Instructions

- Trace **only at source**: Route Handlers (external/upstream errors), ErrorBoundary (render), `unhandledrejection` (unhandled promise rejections).
- Do **not** trace in: `getApiErrorMessage`, server actions, or forwarding layers.
- In Route Handlers use `traceApiError` from `@/lib/observability/trace-api-error`; use `alsoTrace401403404: true` only when 401/403/404 are relevant (e.g. PUT update).
- Prefer rich, stable context: `source`, `handler`, `id`, `status`, `componentStack`; avoid empty or generic keys.

---

## Examples

### 1. Route Handler – external request fails (5xx or network)

```ts
// src/app/api/users/[id]/route.ts
import { traceApiError } from "@/lib/observability/trace-api-error";

try {
  const response = await externalClient.get(`users/${id}`);
  // ...
} catch (error) {
  traceApiError(error, {
    source: "api/users/[id]",
    handler: "handleGet",
    id,
  });
  return NextResponse.json({ error: "Failed" }, { status: 500 });
}
```

### 2. Route Handler – optional 401/403/404 (e.g. PUT update)

When the *response body* indicates 401/403/404 (not an axios throw), pass a synthetic error and `alsoTrace401403404: true`:

```ts
if (putError) {
  const is5xx = putError.status >= 500;
  if (is5xx) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  traceApiError(
    new Error(putError.message, { cause: putError }),
    {
      source: "api/users/[id]",
      handler: "handlePut",
      id,
      status: putError.status,
    },
    { alsoTrace401403404: true },
  );
  return NextResponse.json({ ... }, { status: putError.status });
}
```

### 3. ErrorBoundary – render errors

```ts
// src/components/custom/ErrorBoundary/ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
  this.setState({ errorInfo });
  errorTracer.trace(error, {
    source: "ErrorBoundary",
    componentStack: errorInfo.componentStack,
  });
}
```

### 4. Unhandled promise rejections

```ts
// src/app/layout.tsx (client component) or a root client wrapper
"use client";

useEffect(() => {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const err =
      reason instanceof Error
        ? reason
        : new Error(String(reason ?? "Unhandled rejection"), { cause: reason });
    errorTracer.trace(err, { source: "unhandledrejection" });
  };
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
  return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
}, []);
```

### 5. What *not* to do

- Do **not** call `errorTracer.trace` or `traceApiError` inside `getApiErrorMessage` (it only formats messages).
- Do **not** trace in server actions; the failure is already reported at the Route Handler or will surface as a rejected promise / UI error.
- Do **not** trace in every catch block that only rethrows or forwards; trace only at the single place where the error is first handled for observability.

---

## How to create adapters

**Implement the interface** (`src/types/errors.ts`): `init()`, `trace(error, context)`, `destroy()`.

**Create the adapter file** under `src/lib/observability/error/adapters/`, e.g. `my-service-adapter.ts`:

```ts
import type { ErrorTracer } from "@/types/errors";

export class MyServiceAdapter implements ErrorTracer {
  init(): void {
    // Initialize SDK (e.g. API key, options).
  }

  trace(error: Error | string, context: Record<string, unknown>): void {
    const err = typeof error === "string" ? new Error(error) : error;
    // Send to your service.
  }

  destroy(): void {
    // Teardown SDK.
  }
}
```

**Register in ErrorTracer** (`src/lib/observability/error/ErrorTracer.ts`): add env check and push the adapter.

## Important notes

- **Trace only at source**: Route Handlers (external errors), ErrorBoundary (render), unhandledrejection (promises). Do **not** trace in getApiErrorMessage, server actions, or forwarding layers.
- Use **`traceApiError`** from `@/lib/observability/trace-api-error` in Route Handlers; use **`alsoTrace401403404: true`** only when 401/403/404 matter (e.g. PUT update).
- **Adapters**: Implement `ErrorTracer` (`init`, `trace`, `destroy`), then register in `ErrorTracer.ts` behind an env flag.
- **Context**: Include `source` and stable identifiers (handler, id, status, componentStack). The tracer adds `env` and `timestamp`.
