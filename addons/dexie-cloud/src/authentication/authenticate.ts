import type { TokenFinalResponse } from "dexie-cloud-common";
import { SyncableDB } from "../SyncableDB";
import { UserLogin } from "../types/UserLogin";
import { AuthPersistedContext } from "./AuthPersistedContext";
import { otpFetchTokenCallback } from "./otpFetchTokenCallback";

export interface AuthenticationDialog {
  prompt(msg: string): string | null | Promise<string | null>;
  alert(msg: string): any;
}

export const dummyAuthDialog: AuthenticationDialog = {
  prompt,
  alert,
};

export type FetchTokenCallback = (tokenParams: {
  public_key: string;
  hints?: { userId?: string; email?: string };
}) => Promise<TokenFinalResponse>;

export async function loadAccessToken(
  db: SyncableDB
): Promise<string | undefined> {
  const {
    accessToken,
    accessTokenExpiration,
    refreshToken,
    refreshTokenExpiration,
    claims,
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
    db.cloud.options.databaseUrl,
    db.cloud.currentUser.value
  );
  await db.table("$logins").update(claims.sub, {
    accessToken: refreshedLogin.accessToken,
    accessTokenExpiration: refreshedLogin.accessTokenExpiration,
  });
  return refreshedLogin.accessToken;
}

export async function authenticate(
  url: string,
  context: UserLogin,
  dlg: AuthenticationDialog,
  fetchToken: undefined | FetchTokenCallback
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
      fetchToken || otpFetchTokenCallback(dlg, url)
    );
  }
}

async function refreshAccessToken(
  url: string,
  login: UserLogin
): Promise<UserLogin> {
  throw new Error("Refresh token not implemented");
}

async function userAuthenticate(
  url: string,
  context: UserLogin,
  dlg: AuthenticationDialog,
  fetchToken: FetchTokenCallback
) {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    false, // Non-exportable...
    ["sign", "verify"]
  );
  context.nonExportablePrivateKey = privateKey; //...but storable!
  const publicKeySPKI = await crypto.subtle.exportKey("spki", publicKey);
  const publicKeyPEM = spkiToPEM(publicKeySPKI);
  context.publicKey = publicKey;

  const response2 = await fetchToken({
    public_key: publicKeyPEM,
    hints: {
      email: context.email || undefined,
      userId: context.userId || undefined,
    },
  });

  if (response2.type !== "tokens")
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
  context.lastLogin = new Date();

  if (response2.alerts) {
    for (const a of response2.alerts) {
      dlg.alert(`${a.type}: ${a.message}`);
    }
  }
  return context;
}

function spkiToPEM(keydata) {
  var keydataS = arrayBufferToString(keydata);
  var keydataB64 = window.btoa(keydataS);
  var keydataB64Pem = formatAsPem(keydataB64);
  return keydataB64Pem;
}

function arrayBufferToString(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

function formatAsPem(str) {
  var finalString = "-----BEGIN PUBLIC KEY-----\n";

  while (str.length > 0) {
    finalString += str.substring(0, 64) + "\n";
    str = str.substring(64);
  }

  finalString = finalString + "-----END PUBLIC KEY-----";

  return finalString;
}
