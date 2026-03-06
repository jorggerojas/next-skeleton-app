import axios from "axios";
import { errorTracer } from "@/lib/observability/error";

const OPTIONAL_TRACE_STATUSES = [401, 403, 404] as const;

export function shouldTraceApiError(
  error: unknown,
  context: { status?: number },
  opts?: { alsoTrace401403404?: boolean },
): boolean {
  let status: number | undefined;

  if (axios.isAxiosError(error)) {
    if (!error.response) return true;
    status = error.response.status;
  } else {
    status = context?.status;
  }

  if (status == null) return true;

  if (status >= 500) return true;
  if (
    opts?.alsoTrace401403404 &&
    OPTIONAL_TRACE_STATUSES.includes(
      status as (typeof OPTIONAL_TRACE_STATUSES)[number],
    )
  )
    return true;

  return false;
}

export function toError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.errors ??
      error.response?.data?.message ??
      error.message;
    return new Error(String(msg), { cause: error });
  }
  if (error instanceof Error) return error;
  return new Error(fallbackMessage, { cause: error });
}

export function traceApiError(
  error: unknown,
  context: {
    source: string;
    status?: number;
    url?: string;
    method?: string;
    [k: string]: unknown;
  },
  opts?: { alsoTrace401403404?: boolean },
): void {
  if (!shouldTraceApiError(error, context, opts)) return;

  const err = toError(error, "Unknown API error");

  errorTracer.trace(err, context);
}
