/** OAuth-specific error codes */
export type OAuthErrorCode =
  | 'access_denied'
  | 'invalid_state'
  | 'email_not_verified'
  | 'expired_code'
  | 'provider_error'
  | 'network_error';

/** User-friendly messages for OAuth error codes */
const ERROR_MESSAGES: Record<OAuthErrorCode, string> = {
  access_denied: 'Access was denied by the authentication provider.',
  invalid_state: 'The authentication response could not be verified. Please try again.',
  email_not_verified: 'Your email address must be verified before you can log in.',
  expired_code: 'The authentication code has expired. Please try again.',
  provider_error: 'An error occurred with the authentication provider.',
  network_error: 'A network error occurred during authentication. Please check your connection and try again.',
};

/** Error class for OAuth-specific errors */
export class OAuthError extends Error {
  readonly code: OAuthErrorCode;
  readonly provider?: string;

  constructor(code: OAuthErrorCode, provider?: string, customMessage?: string) {
    super(customMessage || ERROR_MESSAGES[code]);
    this.name = 'OAuthError';
    this.code = code;
    this.provider = provider;
  }

  /** Get user-friendly message for this error */
  get userMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message;
  }
}
