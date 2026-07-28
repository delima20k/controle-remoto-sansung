export type AppErrorCode =
  | "unauthenticated"
  | "permission-denied"
  | "invalid-argument"
  | "failed-precondition"
  | "not-found"
  | "resource-exhausted"
  | "unavailable"
  | "internal";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly publicMessage: string;
  readonly details: Record<string, unknown>;

  constructor(code: AppErrorCode, publicMessage: string, details: Record<string, unknown> = {}) {
    super(publicMessage);
    this.name = "AppError";
    this.code = code;
    this.publicMessage = publicMessage;
    this.details = details;
  }
}
