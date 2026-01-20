/** Token request for OAuth authorization code grant */
export interface AuthorizationCodeTokenRequest {
  grant_type: 'authorization_code';
  /** The Dexie Cloud authorization code received from OAuth callback */
  code: string;
  /** Client's public key for token encryption (PEM format) */
  public_key?: string;
  /** Requested scopes */
  scopes: string[];
}
