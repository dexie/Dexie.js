import { IPersistedContext } from "dexie-syncable/api";
import type { OTPTokenRequest, TokenFinalResponse, TokenOtpSentResponse } from "dexie-cloud-common";

export async function authenticate(url: string, context: IPersistedContext) {
  if (context.accessToken && context.accessTokenExpiration > Date.now()) {
    return context.accessToken;
  } else if (
    context.refreshToken &&
    context.refreshTokenExpiration > Date.now()
  ) {
    return await refreshAccessToken(url, context);
  } else {
    return await otpAuthenticate(url, context);
  }
}

async function refreshAccessToken(url: string, context: IPersistedContext) {
  console.error("Refresh not implemented");
  return await otpAuthenticate(url, context);
}

async function otpAuthenticate(url: string, context: IPersistedContext) {
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
  context.privateKey = privateKey; //...but storable!

  const email = prompt("Email"); // TODO: Fixthis!
  if (!email) throw new Error(`Invalid email was given`);
  const publicKeySPKI = await crypto.subtle.exportKey("spki", publicKey);
  const publicKeyPEM = spkiToPEM(publicKeySPKI);
  context.publicKey = publicKey;

  const otpRequest: OTPTokenRequest = {
    email,
    grant_type: "otp",
    scopes: ["ACCESS_DB"],
    public_key: publicKeyPEM,
  };
  const res1 = await fetch(`${url}/token`, {
    body: JSON.stringify(otpRequest),
    method: "post",
    headers: { "Content-Type": "application/json",
    mode: "cors"
  },
  });
  if (res1.status !== 200) throw new Error(`Status ${res1.status} from ${url}/token`);
  const response: TokenOtpSentResponse = await res1.json();
  if (response.type !== "otp-sent") throw new Error(`Unexpected response from ${url}/token`);
  const otp = prompt("OTP"); // TODO: Fixthis!
  if (!otp) throw new Error("Invalid OTP");
  otpRequest.otp = otp;
  otpRequest.otp_id = response.otp_id;
  
  const res2 = await fetch(`${url}/token`, {
    body: JSON.stringify(otpRequest),
    method: "post",
    headers: {"Content-Type": "application/json"},
    mode: "cors"
  });
  if (res2.status !== 200) throw new Error(`OTP2: Status ${res2.status} from ${url}/token`);
  const response2: TokenFinalResponse = await res2.json();
  if (response2.type !== "tokens") throw new Error(`Unexpected response type from token endpoint: ${response2.type}`);
  
  context.accessToken = response2.accessToken;
  context.accessTokenExpiration = response2.accessTokenExpiration;
  context.refreshToken = response2.refreshToken;
  context.refreshTokenExpiration = response2.refreshTokenExpiration;
  await context.save();
  if (response2.alerts) {
    for (const a of response2.alerts) {
      alert(`${a.type}: ${a.message}`);
    }
  }
  return context.accessToken;
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
