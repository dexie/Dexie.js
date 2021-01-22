
export interface TokenFinalResponse {
  type: "tokens";
  accessToken: string;
  refreshToken?: string;
}

export interface TokenOtpSentResponse {
  type: "otp-sent";
  otp_id: string;
}

export type TokenResponse = TokenFinalResponse | TokenOtpSentResponse;

export interface CreateDbResponse {
  url: string;
  clientId: string;
  clientSecret: string;
}
