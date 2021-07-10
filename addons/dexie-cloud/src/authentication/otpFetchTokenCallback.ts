import {
  TokenFinalResponse,
  TokenRequest,
  TokenResponse,
} from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { HttpError } from '../errors/HttpError';
import { FetchTokenCallback } from './authenticate';
import { alertUser, promptForEmail, promptForOTP } from './interactWithUser';

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
    if (response.type === 'tokens') {
      // Demo user request can get a "tokens" response right away
      return response;
    } else if (tokenRequest.grant_type === 'otp') {
      if (response.type !== 'otp-sent')
        throw new Error(`Unexpected response from ${url}/token`);
      const otp = await promptForOTP(userInteraction, tokenRequest.email);
      tokenRequest.otp = otp || '';
      tokenRequest.otp_id = response.otp_id;

      let res2 = await fetch(`${url}/token`, {
        body: JSON.stringify(tokenRequest),
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      while (res2.status === 401) {
        const errorText = await res2.text();
        tokenRequest.otp = await promptForOTP(userInteraction, tokenRequest.email, {
          type: 'error',
          messageCode: 'INVALID_OTP',
          message: errorText,
          messageParams: {}
        });
        res2 = await fetch(`${url}/token`, {
          body: JSON.stringify(tokenRequest),
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });
      }
      if (res2.status !== 200) {
        const errMsg = await res2.text();
        await alertUser(userInteraction, "OTP Authentication Failed", {
          type: 'error',
          messageCode: 'GENERIC_ERROR',
          message: errMsg,
          messageParams: {}
        }).catch(()=>{});
        throw new HttpError(res2, errMsg);
      }
      const response2: TokenFinalResponse = await res2.json();
      return response2;
    } else {
      throw new Error(`Unexpected response from ${url}/token`);
    }
  };
}
