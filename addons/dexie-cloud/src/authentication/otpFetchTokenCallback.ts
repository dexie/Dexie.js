import {
  OTPTokenRequest,
  TokenFinalResponse,
  TokenOtpSentResponse,
  TokenRequest,
  TokenResponse
} from 'dexie-cloud-common';
import { AuthenticationDialog, FetchTokenCallback } from './authenticate';

export function otpFetchTokenCallback(
  dlg: AuthenticationDialog,
  url: string
): FetchTokenCallback {
  return async function otpAuthenticate({ public_key, hints }) {
    let tokenRequest: TokenRequest;
    if (hints?.grant_type === 'demo') {
      const demo_user =
        hints?.userId ||
        hints?.email ||
        (await dlg.prompt('Enter userId of a demo user', "userId"));
      if (!demo_user) throw new Error(`No demo userId provided`);
      tokenRequest = {
        demo_user,
        grant_type: 'demo',
        scopes: ['ACCESS_DB'],
        public_key
      };
    } else {
      const email = hints?.email || (await dlg.prompt('Email', "email"));
      if (!email) throw new Error(`No email was given`);

      tokenRequest = {
        email,
        grant_type: 'otp',
        scopes: ['ACCESS_DB'],
        public_key
      };
    }
    const res1 = await fetch(`${url}/token`, {
      body: JSON.stringify(tokenRequest),
      method: 'post',
      headers: { 'Content-Type': 'application/json', mode: 'cors' }
    });
    if (res1.status !== 200)
      throw new Error(`Status ${res1.status} from ${url}/token`);
    const response: TokenResponse = await res1.json();
    if (response.type === 'tokens') {
      // Demo user request can get a "tokens" response right away
      return response;
    } else if (tokenRequest.grant_type === 'otp') {
      if (response.type !== 'otp-sent')
        throw new Error(`Unexpected response from ${url}/token`);
      const otp = await dlg.prompt('OTP', "otp"); // TODO: Fixthis!
      if (!otp) throw new Error('Invalid OTP');
      tokenRequest.otp = otp;
      tokenRequest.otp_id = response.otp_id;

      const res2 = await fetch(`${url}/token`, {
        body: JSON.stringify(tokenRequest),
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      if (res2.status !== 200)
        throw new Error(`OTP: Status ${res2.status} from ${url}/token`);
      const response2: TokenFinalResponse = await res2.json();
      return response2;
    } else {
      throw new Error(`Unexpected response from ${url}/token`);
    }
  };
}
