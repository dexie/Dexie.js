import {
  AuthorizationCodeTokenRequest,
  DemoTokenRequest,
  OTPTokenRequest1,
  OTPTokenRequest2,
  TokenErrorResponse,
  TokenFinalResponse,
  TokenRequest,
  TokenResponse,
} from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { HttpError } from '../errors/HttpError';
import { FetchTokenCallback } from './authenticate';
import { exchangeOAuthCode } from './exchangeOAuthCode';
import { fetchAuthProviders } from './fetchAuthProviders';
import { alertUser, promptForEmail, promptForOTP, promptForProvider } from './interactWithUser';
import { startOAuthRedirect } from './oauthLogin';
import { OAuthRedirectError } from '../errors/OAuthRedirectError';

export function otpFetchTokenCallback(db: DexieCloudDB): FetchTokenCallback {
  const { userInteraction } = db.cloud;
  return async function otpAuthenticate({ public_key, hints }) {
    let tokenRequest: TokenRequest;
    const url = db.cloud.options?.databaseUrl;
    if (!url) throw new Error(`No database URL given.`);
    
    // Handle OAuth code exchange (from redirect/deep link flows)
    if (hints?.oauthCode && hints.provider) {
      return await exchangeOAuthCode({
        databaseUrl: url,
        code: hints.oauthCode,
        publicKey: public_key,
        scopes: ['ACCESS_DB'],
      });
    }
    
    // Handle OAuth provider login via redirect
    if (hints?.provider) {
      let resolvedRedirectUri: string | undefined = undefined;
      if (hints.redirectPath) {
        // If redirectPath is absolute, use as is. If relative, resolve against current location
        if (/^https?:\/\//i.test(hints.redirectPath)) {
          resolvedRedirectUri = hints.redirectPath;
        } else if (typeof window !== 'undefined' && window.location) {
          // Use URL constructor to resolve relative path
          resolvedRedirectUri = new URL(hints.redirectPath, window.location.href).toString();
        } else if (typeof location !== 'undefined' && location.href) {
          resolvedRedirectUri = new URL(hints.redirectPath, location.href).toString();
        }
      }
      initiateOAuthRedirect(db, hints.provider, resolvedRedirectUri);
      // This function never returns - page navigates away
      throw new OAuthRedirectError(hints.provider);
    }
    
    if (hints?.grant_type === 'demo') {
      const demo_user = await promptForEmail(
        userInteraction,
        'Enter a demo user email',
        hints?.email || hints?.userId
      );
      tokenRequest = {
        demo_user,
        grant_type: 'demo',
        scopes: ['ACCESS_DB'],
        public_key
      } satisfies DemoTokenRequest;
    } else if (hints?.otpId && hints.otp) {
      // User provided OTP ID and OTP code. This means that the OTP email
      // has already gone out and the user may have clicked a magic link
      // in the email with otp and otpId in query and the app has picked
      // up those values and passed them to db.cloud.login().
      tokenRequest = {
        grant_type: 'otp',
        otp_id: hints.otpId,
        otp: hints.otp,
        scopes: ['ACCESS_DB'],
        public_key,
      } satisfies OTPTokenRequest2;
    } else if (hints?.grant_type === 'otp' || hints?.email) {
      // User explicitly requested OTP flow - skip provider selection
      const email = hints?.email || await promptForEmail(
        userInteraction,
        'Enter email address'
      );
      if (/@demo.local$/.test(email)) {
        tokenRequest = {
          demo_user: email,
          grant_type: 'demo',
          scopes: ['ACCESS_DB'],
          public_key
        } satisfies DemoTokenRequest;
      } else {
        tokenRequest = {
          email,
          grant_type: 'otp',
          scopes: ['ACCESS_DB'],
        } satisfies OTPTokenRequest1;
      }
    } else {
      // Check for available auth providers (OAuth + OTP)
      const socialAuthEnabled = db.cloud.options?.socialAuth !== false;
      const authProviders = await fetchAuthProviders(url, socialAuthEnabled);
      
      // If we have OAuth providers available, prompt for selection
      if (authProviders.providers.length > 0) {
        const selection = await promptForProvider(
          userInteraction,
          authProviders.providers,
          authProviders.otpEnabled,
          'Sign in',
        );
        
        if (selection.type === 'provider') {
          // User selected an OAuth provider - initiate redirect
          initiateOAuthRedirect(db, selection.provider);
          // This function never returns - page navigates away
          throw new OAuthRedirectError(selection.provider);
        }
        // User chose OTP - continue with email prompt below
      }
      
      const email = await promptForEmail(
        userInteraction,
        'Enter email address',
        hints?.email
      );
      if (/@demo.local$/.test(email)) {
        tokenRequest = {
          demo_user: email,
          grant_type: 'demo',
          scopes: ['ACCESS_DB'],
          public_key
        } satisfies DemoTokenRequest;
      } else {
        tokenRequest = {
          email,
          grant_type: 'otp',
          scopes: ['ACCESS_DB'],
        } satisfies OTPTokenRequest1;
      }
    }
    const res1 = await fetch(`${url}/token`, {
      body: JSON.stringify(tokenRequest),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    });
    if (res1.status !== 200) {
      const errMsg = await res1.text();
      await alertUser(userInteraction, "Token request failed", {
        type: 'error',
        messageCode: 'GENERIC_ERROR',
        message: errMsg,
        messageParams: {}
      }).catch(()=>{});
      throw new HttpError(res1, errMsg);
    }
    const response: TokenResponse = await res1.json();
    if (response.type === 'tokens' || response.type === 'error') {
      // Demo user request can get a "tokens" response right away
      // Error can also be returned right away.
      return response;
    } else if (tokenRequest.grant_type === 'otp' && 'email' in tokenRequest) {
      if (response.type !== 'otp-sent')
        throw new Error(`Unexpected response from ${url}/token`);
      const otp = await promptForOTP(userInteraction, tokenRequest.email);
      const tokenRequest2 = {
        ...tokenRequest,
        otp: otp || '',
        otp_id: response.otp_id,
        public_key
      } satisfies OTPTokenRequest2;

      let res2 = await fetch(`${url}/token`, {
        body: JSON.stringify(tokenRequest2),
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      while (res2.status === 401) {
        const errorText = await res2.text();
        tokenRequest2.otp = await promptForOTP(userInteraction, tokenRequest.email, {
          type: 'error',
          messageCode: 'INVALID_OTP',
          message: errorText,
          messageParams: {}
        });
        res2 = await fetch(`${url}/token`, {
          body: JSON.stringify(tokenRequest2),
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });
      }
      if (res2.status !== 200) {
        const errMsg = await res2.text();
        throw new HttpError(res2, errMsg);
      }
      const response2: TokenFinalResponse | TokenErrorResponse = await res2.json();
      return response2;
    } else {
      throw new Error(`Unexpected response from ${url}/token`);
    }
  };
}

/**
 * Initiates OAuth login via full page redirect.
 * 
 * The page will navigate away to the OAuth provider. After authentication,
 * the user is redirected back with a dxc-auth query parameter that is
 * automatically detected by db.cloud.configure().
 */
function initiateOAuthRedirect(
  db: DexieCloudDB,
  provider: string,
  redirectUriOverride?: string
): void {
  const url = db.cloud.options?.databaseUrl;
  if (!url) throw new Error(`No database URL given.`);
  
  const redirectUri =
    redirectUriOverride ||
    db.cloud.options?.oauthRedirectUri ||
    (typeof location !== 'undefined' ? location.href : undefined);
  
  // CodeRabbit suggested to fail fast here, but the only situation where
  // redirectUri would be undefined is in non-browser environments, and
  // in those environments OAuth redirect does not make sense anyway
  // and will fail fast in startOAuthRedirect().
  
  // Start OAuth redirect flow - page navigates away
  startOAuthRedirect({
    databaseUrl: url,
    provider,
    redirectUri,
  });
}
