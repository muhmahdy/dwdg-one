export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 413 | 429 | 500 | 502 | 503;

/** An error the client may see: a status and a short code, never a message from the database. */
export class HttpError extends Error {
  readonly status: HttpStatus;
  readonly code: string;
  /** For 429: seconds until the caller may try again. */
  readonly retryAfter: number | undefined;

  constructor(status: HttpStatus, code: string, retryAfter?: number) {
    super(code);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

/** A refusal or failure from the hub's API. `code` is the Postgres/PostgREST code when there is one (42501 = not allowed). */
export class GatewayError extends Error {
  readonly code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
  }
}
