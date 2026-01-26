import { OAuthError } from '../errors/OAuthError';

/** Options for initiating OAuth redirect */
export interface OAuthRedirectOptions {
  /** The Dexie Cloud database URL */
  databaseUrl: string;
  /** The OAuth provider name */
  provider: string;
  /** Optional redirect URI override.
   * Defaults to window.location.href for web apps.
   * For Capacitor/native apps, use a custom URL scheme like 'myapp://'
   */
  redirectUri?: string;
}

/** Build the OAuth login URL */
function buildOAuthLoginUrl(options: OAuthRedirectOptions): string {
  const url = new URL(`${options.databaseUrl}/oauth/login/${options.provider}`);
  
  // Set the redirect URI - defaults to current page URL for web SPAs
  const redirectUri = options.redirectUri || 
    (typeof window !== 'undefined' ? window.location.href : '');
  if (redirectUri) {
    url.searchParams.set('redirect_uri', redirectUri);
  }
  
  return url.toString();
}

/**
 * Initiates OAuth login via full page redirect.
 * 
 * The page will navigate to the OAuth provider. After authentication,
 * the user is redirected back to the app with a `dxc-auth` query parameter
 * containing base64url-encoded JSON with the authorization code.
 * 
 * The dexie-cloud-addon automatically detects and processes this parameter
 * when db.cloud.configure() is called on page load.
 * 
 * @param options - OAuth redirect options
 * 
 * @example
 * ```typescript
 * // Initiate OAuth login
 * startOAuthRedirect({
 *   databaseUrl: 'https://mydb.dexie.cloud',
 *   provider: 'google'
 * });
 * // Page navigates away, user authenticates, then returns with auth code
 * ```
 */
export function startOAuthRedirect(options: OAuthRedirectOptions): void {
  if (typeof window === 'undefined') {
    throw new Error('OAuth redirect requires a browser environment');
  }
  
  const loginUrl = buildOAuthLoginUrl(options);
  window.location.href = loginUrl;
}

/** Map OAuth error strings to error codes */
export function mapOAuthError(error: string): OAuthError['code'] {
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('access_denied') || lowerError.includes('access denied')) {
    return 'access_denied';
  }
  if (lowerError.includes('email') && lowerError.includes('verif')) {
    return 'email_not_verified';
  }
  if (lowerError.includes('expired')) {
    return 'expired_code';
  }
  if (lowerError.includes('state')) {
    return 'invalid_state';
  }
  
  return 'provider_error';
}
