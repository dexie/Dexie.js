/** Error codes for server-side policy rejections.
 *
 * These are returned by the server as structured 403 JSON responses.
 * Use a switch statement on `code` to display translated or custom messages.
 */
export type PolicyErrorCode =
  | 'USER_NOT_REGISTERED'
  | 'EMAIL_NOT_ALLOWED'
  | 'NO_SEATS_AVAILABLE'
  | 'USER_NOT_ACCEPTED'
  | 'WEBHOOK_ERROR';

export interface PolicyErrorBody {
  code: PolicyErrorCode;
  message: string;
}

/** Thrown when the server rejects a user due to a policy rule.
 *
 * Unlike a generic 403, this error carries a machine-readable `code` so that
 * the addon can convert it into a DXCUserInteraction challenge rather than
 * simply throwing.
 */
export class PolicyRejectionError extends Error {
  readonly code: PolicyErrorCode;

  constructor(body: PolicyErrorBody) {
    super(body.message);
    this.code = body.code;
  }

  get name() {
    return 'PolicyRejectionError';
  }
}

/** Returns true when a plain fetch Response contains a structured PolicyError body. */
export function isPolicyErrorBody(value: unknown): value is PolicyErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).code === 'string' &&
    typeof (value as any).message === 'string'
  );
}
