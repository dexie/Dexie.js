import Dexie from 'dexie';
import type {
  RefreshTokenRequest,
  TokenErrorResponse,
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
import { TokenErrorResponseError } from './TokenErrorResponseError';
import { alertUser, interactWithUser } from './interactWithUser';
import { InvalidLicenseError } from '../InvalidLicenseError';
import { LoginHints } from '../DexieCloudAPI';
import { OAuthRedirectError } from '../errors/OAuthRedirectError';

export type FetchTokenCallback = (tokenParams: {
  public_key: string;
  hints?: LoginHints;
}) => Promise<TokenFinalResponse | TokenErrorResponse>;

export async function loadAccessToken(
  db: DexieCloudDB
): Promise<UserLogin | null> {
  const currentUser = await db.getCurrentUser();
  const {
    accessToken,
    accessTokenExpiration,
    refreshToken,
    refreshTokenExpiration,
    claims,
  } = currentUser;
  if (!accessToken) return null;
  const expTime = accessTokenExpiration?.getTime() ?? Infinity;
  if (expTime > Date.now() && (currentUser.license?.status || 'ok') === 'ok') {
    return currentUser;
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
    claims: refreshedLogin.claims,
    license: refreshedLogin.license,
    data: refreshedLogin.data,
  });
  return refreshedLogin;
}

export async function authenticate(
  url: string,
  context: UserLogin,
  fetchToken: FetchTokenCallback,
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  hints?: LoginHints
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
  const response: TokenFinalResponse | TokenErrorResponse = await res.json();
  if (response.type === 'error') {
    throw new TokenErrorResponseError(response);
  }
  login.accessToken = response.accessToken;
  login.accessTokenExpiration = response.accessTokenExpiration
    ? new Date(response.accessTokenExpiration)
    : undefined;
  login.claims = response.claims;
  login.license = {
    type: response.userType,
    status: response.claims.license || 'ok',
  }
  if (response.evalDaysLeft != null) {
    login.license.evalDaysLeft = response.evalDaysLeft;
  }
  if (response.userValidUntil != null) {
    login.license.validUntil = new Date(response.userValidUntil);
  }
  if (response.data) {
    login.data = response.data;
  }
  return login;
}

async function userAuthenticate(
  context: UserLogin,
  fetchToken: FetchTokenCallback,
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  hints?: LoginHints
) {
  if (!crypto.subtle) {
    if (typeof location !== 'undefined' && location.protocol === 'http:') {
      throw new Error(`Dexie Cloud Addon needs to use WebCrypto, but your browser has disabled it due to being served from an insecure location. Please serve it from https or http://localhost:<port> (See https://stackoverflow.com/questions/46670556/how-to-enable-crypto-subtle-for-unsecure-origins-in-chrome/46671627#46671627)`);
    } else {
      throw new Error(`This browser does not support WebCrypto.`);
    }
  }
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
  if (!privateKey || !publicKey)
    throw new Error(`Could not generate RSA keypair`); // Typings suggest these can be undefined...
  context.nonExportablePrivateKey = privateKey; //...but storable!
  const publicKeySPKI = await crypto.subtle.exportKey('spki', publicKey);
  const publicKeyPEM = spkiToPEM(publicKeySPKI);
  context.publicKey = publicKey;

  try {
    const response2 = await fetchToken({
      public_key: publicKeyPEM,
      hints,
    });

    if (response2.type === 'error') {
      throw new TokenErrorResponseError(response2);
    }

    if (response2.type !== 'tokens')
      throw new Error(
        `Unexpected response type from token endpoint: ${(response2 as any).type}`
      );

    /*const licenseStatus = response2.claims.license || 'ok';
    if (licenseStatus !== 'ok') {
      throw new InvalidLicenseError(licenseStatus);
    }*/

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
    context.license = {
      type: response2.userType,
      status: response2.claims.license || 'ok',
    }
    context.data = response2.data;
    if (response2.evalDaysLeft != null) {
      context.license.evalDaysLeft = response2.evalDaysLeft;
    }
    if (response2.userValidUntil != null) {
      context.license.validUntil = new Date(response2.userValidUntil);
    }

    if (response2.alerts && response2.alerts.length > 0) {
      await interactWithUser(userInteraction, {
        type: 'message-alert',
        title: 'Authentication Alert',
        fields: {},
        alerts: response2.alerts as DXCAlert[],
      });
    }
    return context;
  } catch (error: any) {
    // OAuth redirect is not an error - page is navigating away
    if (error instanceof OAuthRedirectError || error?.name === 'OAuthRedirectError') {
      throw error; // Re-throw without logging
    }
    if (error instanceof TokenErrorResponseError) {
      await alertUser(userInteraction, error.title, {
        type: 'error',
        messageCode: error.messageCode,
        message: error.message,
        messageParams: {},
      });
      throw error;
    }
    let message = `We're having a problem authenticating right now.`;
    console.error (`Error authenticating`, error);
    if (error instanceof TypeError) {
      const isOffline = typeof navigator !== undefined && !navigator.onLine;
      if (isOffline) {
        message = `You seem to be offline. Please connect to the internet and try again.`;
      } else if (Dexie.debug || (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'))) {
        // The audience is most likely the developer. Suggest to whitelist the localhost origin:
        message = `Could not connect to server. Please verify that your origin '${location.origin}' is whitelisted using \`npx dexie-cloud whitelist\``;
      } else {
        message = `Could not connect to server. Please verify the connection.`;
      }
      await alertUser(userInteraction, 'Authentication Failed', {
        type: 'error',
        messageCode: 'GENERIC_ERROR',
        message,
        messageParams: {},
      }).catch(() => {});  
    }

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
