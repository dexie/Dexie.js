import { OAuthError } from '../errors/OAuthError';

/** Parsed OAuth callback parameters from dxc-auth query parameter */
export interface OAuthCallbackParams {
  /** The Dexie Cloud authorization code */
  code: string;
  /** The OAuth provider that was used */
  provider: string;
  /** The state parameter */
  state: string;
}

/** Decoded dxc-auth payload structure */
interface DxcAuthPayload {
  code?: string;
  provider: string;
  state: string;
  error?: string;
}

/**
 * Decodes a base64url-encoded string to a regular string.
 * Base64url uses - instead of + and _ instead of /, and may omit padding.
 */
function decodeBase64Url(encoded: string): string {
  // Add padding if needed
  const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4);
  // Convert base64url to base64
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

/**
 * Parses OAuth callback parameters from the dxc-auth query parameter.
 * 
 * The dxc-auth parameter contains base64url-encoded JSON with the following structure:
 * - On success: { "code": "...", "provider": "...", "state": "..." }
 * - On error: { "error": "...", "provider": "...", "state": "..." }
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
  const encoded = parsed.searchParams.get('dxc-auth');

  if (!encoded) {
    return null; // Not an OAuth callback URL
  }

  let payload: DxcAuthPayload;
  try {
    const json = decodeBase64Url(encoded);
    payload = JSON.parse(json);
  } catch (e) {
    console.warn('[dexie-cloud] Failed to parse dxc-auth parameter:', e);
    return null;
  }

  const { code, provider, state, error } = payload;

  // Check for error first
  if (error) {
    if (error.toLowerCase().includes('access_denied') || error.toLowerCase().includes('access denied')) {
      throw new OAuthError('access_denied', provider, error);
    }
    if (error.toLowerCase().includes('email') && error.toLowerCase().includes('verif')) {
      throw new OAuthError('email_not_verified', provider, error);
    }
    
    throw new OAuthError('provider_error', provider, error);
  }

  // Validate required fields for success case
  if (!code || !provider || !state) {
    console.warn('[dexie-cloud] Invalid dxc-auth payload: missing required fields');
    return null;
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
    return false; // Fail closed - reject if we cannot validate CSRF protection
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
 * Cleans up the dxc-auth query parameter from the URL.
 * Call this after successfully handling the callback to clean up the browser URL.
 */
export function cleanupOAuthUrl(): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  
  if (!url.searchParams.has('dxc-auth')) {
    return;
  }

  url.searchParams.delete('dxc-auth');
  const cleanUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
  window.history.replaceState(null, '', cleanUrl);
}

/**
 * Complete handler for OAuth callback.
 * 
 * Parses the dxc-auth query parameter, validates state, and returns the parameters
 * needed to complete the login flow.
 * 
 * Note: For web SPAs using full page redirect, the dexie-cloud-addon automatically
 * detects and processes the dxc-auth parameter when db.cloud.configure() is called.
 * This function is primarily useful for Capacitor/native apps handling deep links.
 * 
 * @param url - The callback URL (defaults to window.location.href)
 * @returns OAuthCallbackParams if valid callback, null otherwise
 * @throws OAuthError on validation failure or if callback contains an error
 * 
 * @example
 * ```typescript
 * // Capacitor deep link handler:
 * App.addListener('appUrlOpen', async ({ url }) => {
 *   const callback = handleOAuthCallback(url);
 *   if (callback) {
 *     await db.cloud.login({ oauthCode: callback.code, provider: callback.provider });
 *   }
 * });
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
