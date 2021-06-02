import {
  OTPTokenRequest,
  TokenFinalResponse,
  TokenOtpSentResponse,
  TokenRequest,
  TokenResponse
} from "dexie-cloud-common";
import { AuthenticationDialog, FetchTokenCallback } from './authenticate';

export function otpFetchTokenCallback(dlg: AuthenticationDialog, url: string): FetchTokenCallback {
  return async function otpAuthenticate({ public_key, hints }) {
    const email = hints?.email || await dlg.prompt("Email"); // TODO: Fixthis!
    if (!email)
      throw new Error(`Invalid email was given`);

    const otpRequest: TokenRequest = /@demo.local$/.test(email) ? {
      demo_user: email.split('@')[0],
      grant_type: "demo",
      scopes: ["ACCESS_DB"]
    } : {
      email,
      grant_type: "otp",
      scopes: ["ACCESS_DB"],
      public_key,
    };
    const res1 = await fetch(`${url}/token`, {
      body: JSON.stringify(otpRequest),
      method: "post",
      headers: { "Content-Type": "application/json", mode: "cors" },
    });
    if (res1.status !== 200)
      throw new Error(`Status ${res1.status} from ${url}/token`);
    const response: TokenResponse = await res1.json();
    if (response.type === "tokens") {
      // Demo user request can get a "tokens" response right away
      return response;
    } else if (otpRequest.grant_type === "otp") {
      if (response.type !== "otp-sent")
        throw new Error(`Unexpected response from ${url}/token`);
      const otp = await dlg.prompt("OTP"); // TODO: Fixthis!
      if (!otp)
        throw new Error("Invalid OTP");
      otpRequest.otp = otp;
      otpRequest.otp_id = response.otp_id;

      const res2 = await fetch(`${url}/token`, {
        body: JSON.stringify(otpRequest),
        method: "post",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
      });
      if (res2.status !== 200)
        throw new Error(`OTP2: Status ${res2.status} from ${url}/token`);
      const response2: TokenFinalResponse = await res2.json();
      return response2;
    } else {
      throw new Error(`Unexpected response from ${url}/token`);
    }
  }
}
