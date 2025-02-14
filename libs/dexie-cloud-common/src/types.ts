export type TokenRequest =
  | OTPTokenRequest1
  | OTPTokenRequest2
  | ClientCredentialsTokenRequest
  | RefreshTokenRequest
  | DemoTokenRequest;

export type OTPTokenRequest = OTPTokenRequest1 | OTPTokenRequest2;
export interface OTPTokenRequest1 {
  grant_type: 'otp';
  email: string;
  scopes: string[]; // TODO use CLIENT_SCOPE type.
}

export interface OTPTokenRequest2 {
  grant_type: 'otp';
  public_key?: string;
  scopes: string[]; // TODO use CLIENT_SCOPE type.
  otp_id: string;
  otp: string;
}

export interface ClientCredentialsTokenRequest {
  grant_type: 'client_credentials';
  client_id: string;
  client_secret: string;
  public_key?: string; // If a refresh token is requested. The web client calling the server-client should own corresponding private key.
  scopes: string[]; // TODO: Move TOKEN_SCOPE type to this lib and use it instead.
  claims?: {
    sub: string;
    email?: string;
    email_verified?: string;
    [customClaim: string]: any;
  };
  expires_in?: string; // timespan string compatible with https://github.com/vercel/ms
  not_before?: string; // timespan string compatible with https://github.com/vercel/ms
}

export interface RefreshTokenRequest {
  grant_type: 'refresh_token';
  scopes: string[]; // TODO use CLIENT_SCOPE type.
  public_key?: string; // Optional. Makes it possible to renew keypair. Given signature must still be generated using the old keypair.
  refresh_token: string;
  time_stamp: number;
  signing_algorithm: string; // "RSA256"
  signature: string; // Base64 signature of (refresh_token + time_stamp) using the private key that corresponds to the public_key sent when retrieving the refresh_token.
}

export interface DemoTokenRequest {
  grant_type: 'demo';
  scopes: ['ACCESS_DB'];
  demo_user: string; // Email of a demo user that must have been added using the dexie cloud CLI.
  public_key?: string;
}

export interface TokenFinalResponse {
  type: 'tokens';
  claims: {
    sub: string;
    license?: 'ok' | 'expired' | 'deactivated';
    [claimName: string]: any;
  };
  accessToken: string;
  accessTokenExpiration: number;
  refreshToken?: string;
  refreshTokenExpiration?: number | null;
  userType: 'demo' | 'eval' | 'prod' | 'client';
  evalDaysLeft?: number;
  userValidUntil?: number;
  alerts?: {
    type: 'warning' | 'info';
    messageCode: string;
    message: string;
    messageParams?: { [param: string]: string };
  }[];
  data?: any;
}

export interface TokenOtpSentResponse {
  type: 'otp-sent';
  otp_id: string;
}
export interface TokenOtpDetailsResponse {
  type: 'otp-details';
  otp: string;
  otp_id: string;
  data?: any;
}

export interface TokenErrorResponse {
  type: 'error';
  title: string;
  messageCode:
    | 'INVALID_OTP'
    | 'INVALID_EMAIL'
    | 'LICENSE_LIMIT_REACHED'
    | 'GENERIC_ERROR';
  message: string;
  messageParams?: { [param: string]: string };
}

/** Can be returned when grant_type="refresh_token" if the given time_stamp differs too much
 * from server time. Will happen if the client's clock differs too much from the server.
 * Client should then retry the token request using grant_type="refresh_token" again but
 * regenerate the signature from (server_time + refresh_token).
 */
export interface TokenResponseInvalidTimestamp {
  type: 'invalid-timestamp';
  server_time: number; // Allows client to adjust its timestamp by diffing server time with client and redo refresh_token request.
  message: string;
}

export type TokenResponse =
  | TokenFinalResponse
  | TokenOtpSentResponse
  | TokenOtpDetailsResponse
  | TokenErrorResponse
  | TokenResponseInvalidTimestamp;
  
export interface CreateDbResponse {
  url: string;
  clientId: string;
  clientSecret: string;
}

export interface WhitelistRequest {
  origin?: string;
  delete?: boolean;
}

export type WhitelistResponse = number | string[];

export type ClientsResponse = DXCClient[];

export interface DXCClient {
  id: string;
  email: string;
  emailVerified: boolean;
  scopes: string[]; // TODO: Use the CLIENT_SCOPE[] type.
}
