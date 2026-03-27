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
import {
  PolicyRejectionError,
  isPolicyErrorBody,
} from '../errors/PolicyRejectionError';
import { FetchTokenCallback } from './authenticate';
import { exchangeOAuthCode } from './exchangeOAuthCode';
import { fetchAuthProviders } from './fetchAuthProviders';
import {
  alertUser,
  promptForEmail,
  promptForOTP,
  promptForProvider,
} from './interactWithUser';
import { startOAuthRedirect } from './oauthLogin';
import { OAuthRedirectError } from '../errors/OAuthRedirectError';
import { DXCAlert } from '../types/DXCAlert';

export function otpFetchTokenCallback(db: DexieCloudDB): FetchTokenCallback {
  const { userInteraction } = db.cloud;

  /**
   * Core authentication function.
   *
   * @param public_key - RSA public key PEM for the session
   * @param hints      - Optional login hints from the caller
   * @param policyAlert - When set, a previous attempt was rejected by a server
   *                      policy rule. The alert is injected into the first
   *                      interactive prompt so the user sees why they were
   *                      rejected without changing any other flow logic.
   */
  async function otpAuthenticate(
    { public_key, hints }: { public_key: string; hints?: any },
    policyAlert?: DXCAlert
  ): Promise<TokenFinalResponse | TokenErrorResponse> {
    let tokenRequest: TokenRequest;
    const url = db.cloud.options?.databaseUrl;
    if (!url) throw new Error(`No database URL given.`);
    const intent = hints?.intent as 'login' | 'register' | undefined;

    // ── Non-interactive paths ──────────────────────────────────────────────
    // These paths POST directly without prompting the user. If a policyAlert
    // exists (from a previous rejected attempt), show it with a message-alert
    // before proceeding so the user understands what happened.

    // Handle OAuth code exchange (from redirect/deep link flows)
    if (hints?.oauthCode && hints.provider) {
      if (policyAlert) {
        // Coming back from OAuth redirect with a pre-existing policy error
        // is only possible if the error was already shown. Just proceed.
      }
      try {
        return await exchangeOAuthCode({
          databaseUrl: url,
          code: hints.oauthCode,
          publicKey: public_key,
          scopes: ['ACCESS_DB'],
          intent,
        });
      } catch (err) {
        if (err instanceof PolicyRejectionError) {
          return await otpAuthenticate(
            { public_key, hints: undefined },
            toPolicyAlert(err)
          );
        }
        throw err;
      }
    }

    // Handle OAuth provider login via redirect (programmatic, no interaction)
    if (hints?.provider) {
      if (policyAlert) {
        // A previous OAuth attempt was rejected. Fall through to the
        // interactive flow — policyAlert will be shown inside the prompt.
        return await otpAuthenticate(
          { public_key, hints: undefined },
          policyAlert
        );
      }
      let resolvedRedirectUri: string | undefined = undefined;
      if (hints.redirectPath) {
        if (/^https?:\/\//i.test(hints.redirectPath)) {
          resolvedRedirectUri = hints.redirectPath;
        } else if (typeof window !== 'undefined' && window.location) {
          resolvedRedirectUri = new URL(
            hints.redirectPath,
            window.location.href
          ).toString();
        } else if (typeof location !== 'undefined' && location.href) {
          resolvedRedirectUri = new URL(
            hints.redirectPath,
            location.href
          ).toString();
        }
      }
      initiateOAuthRedirect(db, hints.provider, resolvedRedirectUri);
      throw new OAuthRedirectError(hints.provider);
    }

    // ── Interactive paths ──────────────────────────────────────────────────
    // policyAlert (if set) is injected into the first prompt so the user sees
    // it alongside the normal auth UI — no separate error screen needed.

    if (hints?.grant_type === 'demo') {
      const demo_user = await promptForEmail(
        userInteraction,
        'Enter a demo user email',
        hints?.email || hints?.userId,
        policyAlert
      );
      tokenRequest = {
        demo_user,
        grant_type: 'demo',
        scopes: ['ACCESS_DB'],
        public_key,
      } satisfies DemoTokenRequest;
    } else if (hints?.otpId && hints.otp) {
      // Magic-link flow: OTP already supplied by the caller (e.g. from email).
      // No interaction — show alert as a plain message if there is one.
      if (policyAlert) {
        await alertUser(userInteraction, 'Access Denied', policyAlert);
        return await otpAuthenticate(
          { public_key, hints: undefined },
          policyAlert
        );
      }
      tokenRequest = {
        grant_type: 'otp',
        otp_id: hints.otpId,
        otp: hints.otp,
        scopes: ['ACCESS_DB'],
        public_key,
      } satisfies OTPTokenRequest2;
    } else if (hints?.grant_type === 'otp' || hints?.email) {
      // Caller explicitly requested OTP — skip provider selection.
      const email =
        hints?.email ||
        (await promptForEmail(
          userInteraction,
          'Enter email address',
          undefined,
          policyAlert
        ));
      if (/@demo.local$/.test(email)) {
        tokenRequest = {
          demo_user: email,
          grant_type: 'demo',
          scopes: ['ACCESS_DB'],
          public_key,
        } satisfies DemoTokenRequest;
      } else {
        tokenRequest = {
          email,
          grant_type: 'otp',
          scopes: ['ACCESS_DB'],
          ...(intent !== undefined ? { intent } : {}),
        } satisfies OTPTokenRequest1;
      }
    } else {
      // Default path: check for OAuth providers, then fall back to OTP.
      const socialAuthEnabled = db.cloud.options?.socialAuth !== false;
      const authProviders = await fetchAuthProviders(url, socialAuthEnabled);

      if (authProviders.providers.length > 0) {
        const providerAlerts = policyAlert ? [policyAlert] : [];
        const selection = await promptForProvider(
          userInteraction,
          authProviders.providers,
          authProviders.otpEnabled,
          'Sign in',
          providerAlerts
        );

        if (selection.type === 'provider') {
          initiateOAuthRedirect(db, selection.provider);
          throw new OAuthRedirectError(selection.provider);
        }
        // User chose OTP — fall through to email prompt (no policyAlert here;
        // it was already shown in the provider prompt above).
      }

      const email = await promptForEmail(
        userInteraction,
        'Enter email address',
        hints?.email,
        // Show policyAlert in email prompt only if there were no providers
        // (otherwise it was already shown in the provider selection above).
        authProviders.providers.length === 0 ? policyAlert : undefined
      );
      if (/@demo.local$/.test(email)) {
        tokenRequest = {
          demo_user: email,
          grant_type: 'demo',
          scopes: ['ACCESS_DB'],
          public_key,
        } satisfies DemoTokenRequest;
      } else {
        tokenRequest = {
          email,
          grant_type: 'otp',
          scopes: ['ACCESS_DB'],
          ...(intent !== undefined ? { intent } : {}),
        } satisfies OTPTokenRequest1;
      }
    }

    // ── POST /token (step 1) ───────────────────────────────────────────────
    const res1 = await fetch(`${url}/token`, {
      body: JSON.stringify(tokenRequest),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    });

    if (res1.status !== 200) {
      const alert = await tryParsePolicyAlert(res1);
      if (alert) {
        // Policy rejection — restart the flow with the error injected.
        return await otpAuthenticate({ public_key, hints: undefined }, alert);
      }
      const errMsg = await res1.text();
      await alertUser(userInteraction, 'Token request failed', {
        type: 'error',
        messageCode: 'GENERIC_ERROR',
        message: errMsg,
        messageParams: {},
      }).catch(() => {});
      throw new HttpError(res1, errMsg);
    }

    const response: TokenResponse = await res1.json();
    if (response.type === 'tokens' || response.type === 'error') {
      return response;
    } else if (tokenRequest.grant_type === 'otp' && 'email' in tokenRequest) {
      if (response.type !== 'otp-sent')
        throw new Error(`Unexpected response from ${url}/token`);

      const otp = await promptForOTP(userInteraction, tokenRequest.email);
      const tokenRequest2 = {
        ...tokenRequest,
        otp: otp || '',
        otp_id: response.otp_id,
        public_key,
      } satisfies OTPTokenRequest2;

      // ── POST /token (step 2: OTP verification) ─────────────────────────
      let res2 = await fetch(`${url}/token`, {
        body: JSON.stringify(tokenRequest2),
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      while (res2.status === 401) {
        const errorText = await res2.text();
        tokenRequest2.otp = await promptForOTP(
          userInteraction,
          tokenRequest.email,
          {
            type: 'error',
            messageCode: 'INVALID_OTP',
            message: errorText,
            messageParams: {},
          }
        );
        res2 = await fetch(`${url}/token`, {
          body: JSON.stringify(tokenRequest2),
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });
      }

      if (res2.status !== 200) {
        const alert = await tryParsePolicyAlert(res2);
        if (alert) {
          return await otpAuthenticate({ public_key, hints: undefined }, alert);
        }
        const errMsg = await res2.text();
        throw new HttpError(res2, errMsg);
      }

      const response2: TokenFinalResponse | TokenErrorResponse =
        await res2.json();
      return response2;
    } else {
      throw new Error(`Unexpected response from ${url}/token`);
    }
  }

  return ({ public_key, hints }) => otpAuthenticate({ public_key, hints });
}

/**
 * Initiates OAuth login via full page redirect.
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

  startOAuthRedirect({
    databaseUrl: url,
    provider,
    redirectUri,
  });
}

/**
 * Converts a PolicyRejectionError to a DXCAlert for injection into prompts.
 */
function toPolicyAlert(err: PolicyRejectionError): DXCAlert {
  return {
    type: 'error',
    messageCode: err.code,
    message: err.message,
    messageParams: {},
  };
}

/**
 * Tries to parse a failed Response as a structured PolicyError body.
 * Returns a DXCAlert if it is one, otherwise returns null.
 * Safe to call: reads body via clone() so the original Response is untouched.
 */
async function tryParsePolicyAlert(res: Response): Promise<DXCAlert | null> {
  if (res.status !== 403) return null;
  try {
    const body = await res.clone().json();
    if (isPolicyErrorBody(body)) {
      return toPolicyAlert(new PolicyRejectionError(body));
    }
  } catch {
    // Not JSON
  }
  return null;
}
