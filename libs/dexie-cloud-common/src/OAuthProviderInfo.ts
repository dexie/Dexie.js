/** Information about an OAuth provider available for authentication */
export interface OAuthProviderInfo {
  /** The type of OAuth provider */
  type: 'google' | 'github' | 'microsoft' | 'apple' | 'custom-oauth2';
  /** Provider identifier (e.g., 'google' or custom name) */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** URL to provider icon */
  iconUrl?: string;
  /** OAuth scopes requested from the provider */
  scopes?: string[];
}
