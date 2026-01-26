import type {
  AuthorizationCodeTokenRequest,
  TokenFinalResponse,
  TokenErrorResponse,
} from 'dexie-cloud-common';
import { OAuthError } from '../errors/OAuthError';
import { TokenErrorResponseError } from './TokenErrorResponseError';

/** Options for exchanging an OAuth code */
export interface ExchangeOAuthCodeOptions {
  /** The Dexie Cloud database URL */
  databaseUrl: string;
  /** The Dexie Cloud authorization code from OAuth callback */
  code: string;
  /** The client's public key in PEM format */
  publicKey: string;
  /** Requested scopes (defaults to ['ACCESS_DB']) */
  scopes?: string[];
}

/**
 * Exchanges a Dexie Cloud authorization code for access and refresh tokens.
 * 
 * This is called after the OAuth callback delivers the authorization code
 * via postMessage (popup flow) or redirect.
 * 
 * @param options - Exchange options
 * @returns Promise resolving to TokenFinalResponse
 * @throws OAuthError or TokenErrorResponseError on failure
 */
export async function exchangeOAuthCode(
  options: ExchangeOAuthCodeOptions
): Promise<TokenFinalResponse> {
  const { databaseUrl, code, publicKey, scopes = ['ACCESS_DB'] } = options;

  const tokenRequest: AuthorizationCodeTokenRequest = {
    grant_type: 'authorization_code',
    code,
    public_key: publicKey,
    scopes,
  };

  try {
    const res = await fetch(`${databaseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequest),
      mode: 'cors',
    });

    if (!res.ok) {
      // Read body once as text to avoid stream consumption issues
      const bodyText = await res.text().catch(() => res.statusText);
      
      if (res.status === 400 || res.status === 401) {
        // Try to parse error response as JSON
        try {
          const errorResponse: TokenErrorResponse = JSON.parse(bodyText);
          if (errorResponse.type === 'error') {
            // Check for specific error codes
            if (errorResponse.messageCode === 'INVALID_OTP') {
              // In the context of OAuth, this likely means expired code
              throw new OAuthError('expired_code', undefined, errorResponse.message);
            }
            throw new TokenErrorResponseError(errorResponse);
          }
        } catch (e) {
          if (e instanceof OAuthError || e instanceof TokenErrorResponseError) {
            throw e;
          }
          // Fall through to generic error
        }
      }
      
      throw new OAuthError('provider_error', undefined, `Token exchange failed: ${res.status} ${bodyText}`);
    }

    const response: TokenFinalResponse | TokenErrorResponse = await res.json();

    if (response.type === 'error') {
      throw new TokenErrorResponseError(response);
    }

    if (response.type !== 'tokens') {
      throw new OAuthError('provider_error', undefined, `Unexpected response type: ${(response as any).type}`);
    }

    return response;
  } catch (error) {
    if (error instanceof OAuthError || error instanceof TokenErrorResponseError) {
      throw error;
    }
    
    if (error instanceof TypeError) {
      // Network error
      throw new OAuthError('network_error');
    }
    
    throw error;
  }
}
