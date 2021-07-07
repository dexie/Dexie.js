import {
  TokenFinalResponse,
  TokenRequest,
  TokenResponse,
} from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { FetchTokenCallback } from './authenticate';
import { promptForEmail, promptForOTP } from './interactWithUser';

export function otpFetchTokenCallback(db: DexieCloudDB): FetchTokenCallback {
  const { userInteraction } = db.cloud;
  return async function otpAuthenticate({ public_key, hints }) {
    let tokenRequest: TokenRequest;
    const url = db.cloud.options?.databaseUrl;
    if (!url) throw new Error(`No database URL given.`);
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
        public_key,
      };
    } else {
      const email = await promptForEmail(
        userInteraction,
        'Enter email address',
        hints?.email
      );
      tokenRequest = {
        email,
        grant_type: 'otp',
        scopes: ['ACCESS_DB'],
        public_key,
      };
    }
    const res1 = await fetch(`${url}/token`, {
      body: JSON.stringify(tokenRequest),
      method: 'post',
      headers: { 'Content-Type': 'application/json', mode: 'cors' },
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
      const otp = await promptForOTP(userInteraction, tokenRequest.email);
      tokenRequest.otp = otp || '';
      tokenRequest.otp_id = response.otp_id;

      const res2 = await fetch(`${url}/token`, {
        body: JSON.stringify(tokenRequest),
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
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
