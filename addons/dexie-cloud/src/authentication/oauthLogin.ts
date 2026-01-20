import { isOAuthResultMessage, OAuthResultMessage } from 'dexie-cloud-common';
import { OAuthError } from '../errors/OAuthError';

/** Options for OAuth login */
export interface OAuthLoginOptions {
  /** The Dexie Cloud database URL */
  databaseUrl: string;
  /** The OAuth provider name */
  provider: string;
  /** Optional redirect URI for non-popup flows */
  redirectUri?: string;
  /** Whether to use popup (default: true) */
  usePopup?: boolean;
}

/** Result from OAuth login */
export interface OAuthLoginResult {
  /** The Dexie Cloud authorization code */
  code: string;
  /** The provider that was used */
  provider: string;
  /** The state parameter */
  state: string;
}

/** Generate a random state string for CSRF protection */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Build the OAuth login URL */
function buildOAuthLoginUrl(options: OAuthLoginOptions, state: string): string {
  const url = new URL(`${options.databaseUrl}/oauth/login/${options.provider}`);
  url.searchParams.set('state', state);
  
  // Set the redirect URI for postMessage or custom scheme
  const redirectUri = options.redirectUri || 
    (typeof window !== 'undefined' ? window.location.origin : '');
  if (redirectUri) {
    url.searchParams.set('redirect_uri', redirectUri);
  }
  
  return url.toString();
}

/** Calculate centered popup position */
function getPopupPosition(width: number, height: number): { left: number; top: number } {
  const screenLeft = window.screenLeft ?? window.screenX;
  const screenTop = window.screenTop ?? window.screenY;
  const screenWidth = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const screenHeight = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;
  
  const left = screenLeft + (screenWidth - width) / 2;
  const top = screenTop + (screenHeight - height) / 2;
  
  return { left: Math.max(0, left), top: Math.max(0, top) };
}

/**
 * Initiates OAuth login flow using a popup window.
 * 
 * Opens a popup to the OAuth provider, listens for postMessage with the result,
 * and returns the Dexie Cloud authorization code.
 * 
 * @param options - OAuth login options
 * @returns Promise resolving to OAuthLoginResult
 * @throws OAuthError on failure
 */
export async function oauthLogin(options: OAuthLoginOptions): Promise<OAuthLoginResult> {
  const { databaseUrl, provider, usePopup = true } = options;
  
  if (!usePopup) {
    // For redirect flows, we can't return a promise - the page will navigate away
    throw new Error('Non-popup OAuth flow requires handleOAuthCallback after redirect');
  }

  const state = generateState();
  const loginUrl = buildOAuthLoginUrl(options, state);
  
  // Calculate popup dimensions and position
  const width = 500;
  const height = 600;
  const { left, top } = getPopupPosition(width, height);
  
  // Open popup window
  const popup = window.open(
    loginUrl,
    'dexie-cloud-oauth',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no`
  );
  
  if (!popup) {
    throw new OAuthError('popup_blocked', provider);
  }

  return new Promise<OAuthLoginResult>((resolve, reject) => {
    let resolved = false;
    
    // Listen for postMessage from the popup
    const handleMessage = (event: MessageEvent) => {
      // Validate origin - must be from the Dexie Cloud server
      const expectedOrigin = new URL(databaseUrl).origin;
      if (event.origin !== expectedOrigin) {
        return; // Ignore messages from other origins
      }

      // Check if this is our OAuth result message
      if (!isOAuthResultMessage(event.data)) {
        return;
      }

      const message: OAuthResultMessage = event.data;

      // Validate state to prevent CSRF
      if (message.state !== state) {
        console.warn('[dexie-cloud] OAuth state mismatch, ignoring message');
        return;
      }

      // Clean up
      cleanup();
      resolved = true;

      // Handle error from OAuth flow
      if (message.error) {
        const errorCode = mapOAuthError(message.error);
        reject(new OAuthError(errorCode, provider, message.error));
        return;
      }

      // Success - return the authorization code
      if (message.code) {
        resolve({
          code: message.code,
          provider: message.provider,
          state: message.state,
        });
      } else {
        reject(new OAuthError('provider_error', provider, 'No authorization code received'));
      }
    };

    // Check if popup was closed without completing
    const checkPopupClosed = setInterval(() => {
      if (popup.closed && !resolved) {
        cleanup();
        reject(new OAuthError('popup_closed', provider));
      }
    }, 500);

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(checkPopupClosed);
      try {
        if (!popup.closed) {
          popup.close();
        }
      } catch {
        // Ignore errors when closing popup
      }
    };

    // Start listening for messages
    window.addEventListener('message', handleMessage);
  });
}

/**
 * Initiates OAuth login via redirect (non-popup flow).
 * The page will navigate to the OAuth provider and redirect back to the app.
 * Use handleOAuthCallback on the callback page to complete the flow.
 */
export function startOAuthRedirect(options: OAuthLoginOptions): void {
  const state = generateState();
  
  // Store state in sessionStorage for validation on callback
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('dexie-cloud-oauth-state', state);
    sessionStorage.setItem('dexie-cloud-oauth-provider', options.provider);
  }
  
  const loginUrl = buildOAuthLoginUrl(options, state);
  window.location.href = loginUrl;
}

/** Map OAuth error strings to error codes */
function mapOAuthError(error: string): OAuthError['code'] {
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
