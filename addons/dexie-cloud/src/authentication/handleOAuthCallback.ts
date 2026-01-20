import { OAuthError } from '../errors/OAuthError';

/** Parsed OAuth callback parameters */
export interface OAuthCallbackParams {
  /** The Dexie Cloud authorization code */
  code: string;
  /** The OAuth provider that was used */
  provider: string;
  /** The state parameter for CSRF validation */
  state: string;
}

/**
 * Parses OAuth callback parameters from the current URL.
 * 
 * Use this on your OAuth callback page (for redirect/deep link flows)
 * to extract the authorization code and complete the login.
 * 
 * @param url - The URL to parse (defaults to window.location.href)
 * @returns OAuthCallbackParams if valid callback, null otherwise
 * @throws OAuthError if there's an error in the callback
 */
export function parseOAuthCallback(url?: string): OAuthCallbackParams | null {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  if (!targetUrl) {
    return null;
  }

  const parsed = new URL(targetUrl);
  const params = parsed.searchParams;

  // Check for error first
  const error = params.get('error');
  if (error) {
    const errorDescription = params.get('error_description') || error;
    const provider = params.get('provider') || 'unknown';
    
    if (error === 'access_denied') {
      throw new OAuthError('access_denied', provider, errorDescription);
    }
    if (errorDescription.toLowerCase().includes('email') && 
        errorDescription.toLowerCase().includes('verif')) {
      throw new OAuthError('email_not_verified', provider, errorDescription);
    }
    
    throw new OAuthError('provider_error', provider, errorDescription);
  }

  // Check for required parameters
  const code = params.get('code');
  const provider = params.get('provider');
  const state = params.get('state');

  if (!code || !provider || !state) {
    return null; // Not an OAuth callback URL
  }

  return { code, provider, state };
}

/**
 * Validates the OAuth state parameter against the stored state.
 * 
 * @param receivedState - The state from the callback URL
 * @returns true if valid, false otherwise
 */
export function validateOAuthState(receivedState: string): boolean {
  if (typeof sessionStorage === 'undefined') {
    console.warn('[dexie-cloud] sessionStorage not available, cannot validate OAuth state');
    return true; // Skip validation if sessionStorage not available
  }

  const storedState = sessionStorage.getItem('dexie-cloud-oauth-state');
  
  if (!storedState) {
    console.warn('[dexie-cloud] No stored OAuth state found');
    return false;
  }

  // Clear the stored state after validation attempt
  sessionStorage.removeItem('dexie-cloud-oauth-state');
  
  return storedState === receivedState;
}

/**
 * Gets the OAuth provider from sessionStorage (for redirect flows).
 */
export function getStoredOAuthProvider(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  
  const provider = sessionStorage.getItem('dexie-cloud-oauth-provider');
  sessionStorage.removeItem('dexie-cloud-oauth-provider');
  return provider;
}

/**
 * Cleans up OAuth-related query parameters from the URL.
 * Call this after successfully handling the callback to clean up the browser URL.
 */
export function cleanupOAuthUrl(): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  // Remove OAuth-related parameters
  const oauthParams = ['code', 'provider', 'state', 'error', 'error_description'];
  let hasOAuthParams = false;
  
  for (const param of oauthParams) {
    if (params.has(param)) {
      params.delete(param);
      hasOAuthParams = true;
    }
  }

  if (hasOAuthParams) {
    const cleanUrl = url.pathname + (params.toString() ? `?${params.toString()}` : '') + url.hash;
    window.history.replaceState({}, '', cleanUrl);
  }
}

/**
 * Complete handler for OAuth callback pages.
 * 
 * Parses the callback URL, validates state, and returns the parameters
 * needed to complete the login flow.
 * 
 * @param url - The callback URL (defaults to window.location.href)
 * @returns OAuthCallbackParams if valid callback, null otherwise
 * @throws OAuthError on validation failure or if callback contains an error
 * 
 * @example
 * ```typescript
 * // On your OAuth callback page:
 * const callback = handleOAuthCallback();
 * if (callback) {
 *   await db.cloud.login({ oauthCode: callback.code, provider: callback.provider });
 *   cleanupOAuthUrl();
 * }
 * ```
 */
export function handleOAuthCallback(url?: string): OAuthCallbackParams | null {
  const params = parseOAuthCallback(url);
  
  if (!params) {
    return null;
  }

  // Validate state for CSRF protection
  if (!validateOAuthState(params.state)) {
    throw new OAuthError('invalid_state', params.provider);
  }

  return params;
}
