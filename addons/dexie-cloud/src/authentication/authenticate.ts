import type {
  RefreshTokenRequest,
  TokenFinalResponse
} from 'dexie-cloud-common';
import { b64encode } from 'dreambase-library/dist/common/base64';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { UserLogin } from '../db/entities/UserLogin';
import { AuthPersistedContext } from './AuthPersistedContext';
import { otpFetchTokenCallback } from './otpFetchTokenCallback';

export interface AuthenticationDialog {
  prompt(msg: string): string | null | Promise<string | null>;
  alert(msg: string): any;
}

export const dummyAuthDialog: AuthenticationDialog = {
  prompt: async (msg) => prompt(msg),
  alert: async (msg) => alert(msg)
};

export type FetchTokenCallback = (tokenParams: {
  public_key: string;
  hints?: { userId?: string; email?: string; grant_type?: string };
}) => Promise<TokenFinalResponse>;

export async function loadAccessToken(
  db: DexieCloudDB
): Promise<string | undefined> {
  const {
    accessToken,
    accessTokenExpiration,
    refreshToken,
    refreshTokenExpiration,
    claims
  } = db.cloud.currentUser.value;
  if (!accessToken) return;
  const expTime = accessTokenExpiration?.getTime() ?? Infinity;
  if (expTime > Date.now()) {
    return accessToken;
  }
  if (!refreshToken) {
    throw new Error(`Refresh token missing`);
  }
  const refreshExpTime = refreshTokenExpiration?.getTime() ?? Infinity;
  if (refreshExpTime <= Date.now()) {
    throw new Error(`Refresh token has expired`);
  }
  const refreshedLogin = await refreshAccessToken(
    db.cloud.options!.databaseUrl,
    db.cloud.currentUser.value
  );
  await db.table('$logins').update(claims.sub, {
    accessToken: refreshedLogin.accessToken,
    accessTokenExpiration: refreshedLogin.accessTokenExpiration
  });
  return refreshedLogin.accessToken;
}

export async function authenticate(
  url: string,
  context: UserLogin,
  dlg: AuthenticationDialog,
  fetchToken: undefined | FetchTokenCallback,
  hints?: { userId?: string; email?: string; grant_type?: string }
): Promise<UserLogin> {
  if (
    context.accessToken &&
    context.accessTokenExpiration!.getTime() > Date.now()
  ) {
    return context;
  } else if (
    context.refreshToken &&
    (!context.refreshTokenExpiration ||
      context.refreshTokenExpiration.getTime() > Date.now())
  ) {
    return await refreshAccessToken(url, context);
  } else {
    return await userAuthenticate(
      url,
      context,
      dlg,
      fetchToken || otpFetchTokenCallback(dlg, url),
      hints
    );
  }
}

export async function refreshAccessToken(
  url: string,
  login: UserLogin
): Promise<UserLogin> {
  if (!login.refreshToken)
    throw new Error(`Cannot refresh token - refresh token is missing.`);
  const tokenRequest: RefreshTokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: login.refreshToken,
    scopes: ['ACCESS_DB'],
    signature: '',
    signing_algorithm: 'RSA256',
    time_stamp: Date.now()
  };
  const res = await fetch(`${url}/token`, {
    body: JSON.stringify(tokenRequest),
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors'
  });
  if (res.status !== 200)
    throw new Error(`RefreshToken: Status ${res.status} from ${url}/token`);
  const response: TokenFinalResponse = await res.json();
  login.accessToken = response.accessToken;
  login.accessTokenExpiration = response.accessTokenExpiration
    ? new Date(response.accessTokenExpiration)
    : undefined;
  return login;
}

async function userAuthenticate(
  url: string,
  context: UserLogin,
  dlg: AuthenticationDialog,
  fetchToken: FetchTokenCallback,
  hints?: { userId?: string; email?: string; grant_type?: string }
) {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' }
    },
    false, // Non-exportable...
    ['sign', 'verify']
  );
  context.nonExportablePrivateKey = privateKey; //...but storable!
  const publicKeySPKI = await crypto.subtle.exportKey('spki', publicKey);
  const publicKeyPEM = spkiToPEM(publicKeySPKI);
  context.publicKey = publicKey;

  const response2 = await fetchToken({
    public_key: publicKeyPEM,
    hints
  });

  if (response2.type !== 'tokens')
    throw new Error(
      `Unexpected response type from token endpoint: ${response2.type}`
    );

  context.accessToken = response2.accessToken;
  context.accessTokenExpiration = new Date(response2.accessTokenExpiration);
  context.refreshToken = response2.refreshToken;
  if (response2.refreshTokenExpiration) {
    context.refreshTokenExpiration = new Date(response2.refreshTokenExpiration);
  }
  context.userId = response2.claims.sub;
  context.email = response2.claims.email;
  context.name = response2.claims.name;
  context.claims = response2.claims;

  if (response2.alerts) {
    for (const a of response2.alerts) {
      dlg.alert(`${a.type}: ${a.message}`);
    }
  }
  return context;
}

function spkiToPEM(keydata: ArrayBuffer) {
  const keydataB64 = b64encode(keydata);
  const keydataB64Pem = formatAsPem(keydataB64);
  return keydataB64Pem;
}

function formatAsPem(str: string) {
  let finalString = '-----BEGIN PUBLIC KEY-----\n';

  while (str.length > 0) {
    finalString += str.substring(0, 64) + '\n';
    str = str.substring(64);
  }

  finalString = finalString + '-----END PUBLIC KEY-----';

  return finalString;
}
