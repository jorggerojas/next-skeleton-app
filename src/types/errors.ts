export type UserID = ReturnType<typeof crypto.randomUUID>;
export interface ErrorTracer {
  init: () => void;
  trace(error: Error | string, context: Record<string, unknown>): void;
  destroy: () => void;
  setUser: (userID: UserID | null) => void;
}
