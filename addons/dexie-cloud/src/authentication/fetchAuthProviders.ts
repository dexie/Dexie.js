import type { AuthProvidersResponse } from 'dexie-cloud-common';

/** Default response when OAuth is disabled or unavailable */
const OTP_ONLY_RESPONSE: AuthProvidersResponse = {
  providers: [],
  otpEnabled: true,
};

/**
 * Fetches available authentication providers from the Dexie Cloud server.
 * 
 * @param databaseUrl - The Dexie Cloud database URL
 * @param socialAuthEnabled - Whether social auth is enabled in client config (default: true)
 * @returns Promise resolving to AuthProvidersResponse
 * 
 * Handles failures gracefully:
 * - 404 → Returns OTP-only (old server version)
 * - Network error → Returns OTP-only
 * - socialAuthEnabled: false → Returns OTP-only without fetching
 */
export async function fetchAuthProviders(
  databaseUrl: string,
  socialAuthEnabled: boolean = true
): Promise<AuthProvidersResponse> {
  // If social auth is disabled, return OTP-only without fetching
  if (!socialAuthEnabled) {
    return OTP_ONLY_RESPONSE;
  }

  try {
    const res = await fetch(`${databaseUrl}/auth-providers`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors',
    });

    if (res.status === 404) {
      // Old server version without OAuth support
      console.debug('[dexie-cloud] Server does not support /auth-providers endpoint. Using OTP-only authentication.');
      return OTP_ONLY_RESPONSE;
    }

    if (!res.ok) {
      console.warn(`[dexie-cloud] Failed to fetch auth providers: ${res.status} ${res.statusText}`);
      return OTP_ONLY_RESPONSE;
    }

    return await res.json();
  } catch (error) {
    // Network error or other failure - fall back to OTP
    console.debug('[dexie-cloud] Could not fetch auth providers, falling back to OTP:', error);
    return OTP_ONLY_RESPONSE;
  }
}
