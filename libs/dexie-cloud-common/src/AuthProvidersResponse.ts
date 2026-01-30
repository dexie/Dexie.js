import { OAuthProviderInfo } from './OAuthProviderInfo.js';

/** Response from GET /auth-providers endpoint */
export interface AuthProvidersResponse {
  /** List of available OAuth providers */
  providers: OAuthProviderInfo[];
  /** Whether OTP (email) authentication is enabled */
  otpEnabled: boolean;
}
