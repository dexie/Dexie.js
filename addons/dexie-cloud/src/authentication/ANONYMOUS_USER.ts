import { UserLogin } from '../types/UserLogin';

export const ANONYMOUS_USER: UserLogin = {
  userId: "anonymous",
  name: "Anonymous",
  claims: {
    sub: "anonymous",
  },
  lastLogin: new Date(0)
}

try {
  Object.freeze(ANONYMOUS_USER);
  Object.freeze(ANONYMOUS_USER.claims);
} catch {}
