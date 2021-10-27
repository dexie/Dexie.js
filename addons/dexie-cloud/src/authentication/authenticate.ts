import type {
  RefreshTokenRequest,
  TokenFinalResponse,
} from 'dexie-cloud-common';
import { b64encode } from 'dreambase-library/dist/common/base64';
import { BehaviorSubject } from 'rxjs';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { UserLogin } from '../db/entities/UserLogin';
import { DXCAlert } from '../types/DXCAlert';
import {
  DXCMessageAlert,
  DXCUserInteraction,
} from '../types/DXCUserInteraction';
import { alertUser, interactWithUser } from './interactWithUser';

export type FetchTokenCallback = (tokenParams: {
  public_key: string;
  hints?: { userId?: string; email?: string; grant_type?: string };
}) => Promise<TokenFinalResponse>;

export async function loadAccessToken(
  db: DexieCloudDB
): Promise<string | undefined> {
  const currentUser = await db.getCurrentUser();
  const {
    accessToken,
    accessTokenExpiration,
    refreshToken,
    refreshTokenExpiration,
    claims,
  } = currentUser;
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
    currentUser
  );
  await db.table('$logins').update(claims.sub, {
    accessToken: refreshedLogin.accessToken,
    accessTokenExpiration: refreshedLogin.accessTokenExpiration,
  });
  return refreshedLogin.accessToken;
}

export async function authenticate(
  url: string,
  context: UserLogin,
  fetchToken: FetchTokenCallback,
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
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
    return await userAuthenticate(context, fetchToken, userInteraction, hints);
  }
}

export async function refreshAccessToken(
  url: string,
  login: UserLogin
): Promise<UserLogin> {
  if (!login.refreshToken)
    throw new Error(`Cannot refresh token - refresh token is missing.`);
  if (!login.nonExportablePrivateKey)
    throw new Error(
      `login.nonExportablePrivateKey is missing - cannot sign refresh token without a private key.`
    );

  const time_stamp = Date.now();
  const signing_algorithm = 'RSASSA-PKCS1-v1_5';
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(login.refreshToken + time_stamp);
  const binarySignature = await crypto.subtle.sign(
    signing_algorithm,
    login.nonExportablePrivateKey,
    data
  );
  const signature = b64encode(binarySignature);

  const tokenRequest: RefreshTokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: login.refreshToken,
    scopes: ['ACCESS_DB'],
    signature,
    signing_algorithm,
    time_stamp,
  };
  const res = await fetch(`${url}/token`, {
    body: JSON.stringify(tokenRequest),
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
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
  context: UserLogin,
  fetchToken: FetchTokenCallback,
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  hints?: { userId?: string; email?: string; grant_type?: string }
) {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    false, // Non-exportable...
    ['sign', 'verify']
  );
  context.nonExportablePrivateKey = privateKey; //...but storable!
  const publicKeySPKI = await crypto.subtle.exportKey('spki', publicKey);
  const publicKeyPEM = spkiToPEM(publicKeySPKI);
  context.publicKey = publicKey;

  try {
    const response2 = await fetchToken({
      public_key: publicKeyPEM,
      hints,
    });

    if (response2.type !== 'tokens')
      throw new Error(
        `Unexpected response type from token endpoint: ${response2.type}`
      );

    context.accessToken = response2.accessToken;
    context.accessTokenExpiration = new Date(response2.accessTokenExpiration);
    context.refreshToken = response2.refreshToken;
    if (response2.refreshTokenExpiration) {
      context.refreshTokenExpiration = new Date(
        response2.refreshTokenExpiration
      );
    }
    context.userId = response2.claims.sub;
    context.email = response2.claims.email;
    context.name = response2.claims.name;
    context.claims = response2.claims;

    if (response2.alerts && response2.alerts.length > 0) {
      await interactWithUser(userInteraction, {
        type: 'message-alert',
        title: 'Authentication Alert',
        fields: {},
        alerts: response2.alerts as DXCAlert[],
      });
    }
    return context;
  } catch (error) {
    await alertUser(userInteraction, 'Authentication Failed', {
      type: 'error',
      messageCode: 'GENERIC_ERROR',
      message: `We're having a problem authenticating right now.`,
      messageParams: {}
    }).catch(()=>{});
    throw error;
  }
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
