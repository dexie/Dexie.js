/**
 * Error thrown when initiating an OAuth redirect.
 * 
 * This is not a real error - it's used to signal that the page is
 * navigating away to an OAuth provider. It should be caught and
 * silently ignored at the appropriate level.
 */
export class OAuthRedirectError extends Error {
  readonly provider: string;
  
  constructor(provider: string) {
    super(`OAuth redirect initiated for provider: ${provider}`);
    this.name = 'OAuthRedirectError';
    this.provider = provider;
  }
}
