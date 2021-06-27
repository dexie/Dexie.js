import { UserLogin } from '../db/entities/UserLogin';

export const UNAUTHORIZED_USER: UserLogin = {
  userId: "unauthorized",
  name: "Unauthorized",
  claims: {
    sub: "unauthorized",
  },
  lastLogin: new Date(0)
}

try {
  Object.freeze(UNAUTHORIZED_USER);
  Object.freeze(UNAUTHORIZED_USER.claims);
} catch {}
