import { DXCUserInteraction } from "../../types/DXCUserInteraction";

export interface UserLogin {
  userId?: string;
  name?: string;
  email?: string;
  claims: {
    [claimName: string]: any;
  }
  license?: {
    type: 'demo' | 'eval' | 'prod' | 'client';
    status: 'ok' | 'expired' | 'deactivated';
    validUntil?: Date;
    evalDaysLeft?: number;
  }
  lastLogin: Date;
  accessToken?: string;
  accessTokenExpiration?: Date;
  refreshToken?: string;
  refreshTokenExpiration?: Date;
  nonExportablePrivateKey?: CryptoKey;
  publicKey?: CryptoKey;
  isLoggedIn?: boolean;
  data?: any; // From user data
  isLoading?: boolean; // true while we still are loading user info
}
