import { DXCUserInteraction } from "../../types/DXCUserInteraction";

export interface UserLogin {
  userId?: string;
  name?: string;
  email?: string;
  claims: {
    [claimName: string]: any;
  }
  lastLogin: Date;
  accessToken?: string;
  accessTokenExpiration?: Date;
  refreshToken?: string;
  refreshTokenExpiration?: Date;
  nonExportablePrivateKey?: CryptoKey;
  publicKey?: CryptoKey;
  isLoggedIn?: boolean;
  interaction?: DXCUserInteraction;
}
