# OAuth Authorization Code Flow for Dexie Cloud SPA Integration

## Actors

- **SPA** – Customer's frontend application
- **Dexie Cloud** – Auth broker + database access control
- **OAuth Provider** – Google, GitHub, Apple, Microsoft, etc.
- **Popup Window** – Browser window initiated by the SPA

## Preconditions

The SPA:

- Generates a persistent public/private keypair
  - Private key stored securely in IndexedDB
  - Public key sent later during token exchange
- Needs two JWTs after login:
  - Access Token (short-lived)
  - Refresh Token (long-lived)

Dexie Cloud acts as OAuth broker and manages tenant + identity linkage.

---

## Flow Overview

### 1. User Initiates Login

User clicks "Login", SPA displays list of providers:

```
Google | GitHub | Apple | Microsoft
```

No nonce or PKCE is created yet.

---

### 2. User Selects Provider

Example: User selects **Google**

The client initiates the OAuth flow. There are three ways to do this:

#### 2a. Popup Flow (Recommended for Web SPAs)

```js
popup = window.open('about:blank');
popup.location = `https://<db>.dexie.cloud/oauth/login/google?redirect_uri=${encodeURIComponent(window.location.origin)}`;
```

The `redirect_uri` parameter is used to determine the `targetOrigin` for postMessage.

#### 2b. Custom URL Scheme (Capacitor / Native Apps)

```js
// Open in system browser or in-app browser
Browser.open({
  url: `https://<db>.dexie.cloud/oauth/login/google?redirect_uri=${encodeURIComponent('myapp://oauth-callback')}`
});
```

The custom scheme `myapp://` tells Dexie Cloud to redirect back via deep link.

#### 2c. Full Page Redirect (Web without Popup)

```js
window.location.href = `https://<db>.dexie.cloud/oauth/login/google?redirect_uri=${encodeURIComponent('https://myapp.com/oauth-callback')}`;
```

Used when popups are blocked or for a more traditional OAuth redirect flow.

---

### 3. Dexie Cloud Prepares OAuth

Dexie Cloud receives `/oauth/login/google` and generates:

- `state` (anti-CSRF)
- `code_verifier` (PKCE)
- `code_challenge` (PKCE)

Stores these in the challenges table, then redirects popup to provider:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=...
  redirect_uri=https://<db>.dexie.cloud/oauth/callback/google
  state=STATE
  code_challenge=CHALLENGE
  code_challenge_method=S256
  response_type=code
  scope=openid email profile
```

Note: `redirect_uri` points to the **Dexie Cloud server** callback endpoint.

---

### 4. Provider Authenticates User

Provider authenticates the user and requests consent if needed.

---

### 5. Provider Callback to Dexie Cloud

Provider redirects back to popup:

```
https://<db>.dexie.cloud/oauth/callback/google?code=CODE&state=STATE
```

Dexie Cloud:

1. Verifies `state`
2. Performs token exchange with provider using PKCE
3. Extracts identity claims (email/id/name/…)
4. Verifies email is verified
5. Links identity to tenant/database
6. Generates a **single-use Dexie Cloud authorization code**
7. Deletes the OAuth state (one-time use)

---

### 6. Dexie Cloud Delivers Auth Code to Client

Dexie Cloud returns HTML that delivers the authorization code back to the client.
The delivery method depends on how the client initiated the login:

#### 6a. Popup Flow (Web SPAs)

If `window.opener` exists, uses postMessage:

```js
window.opener.postMessage(
  {
    type: 'dexie:oauthResult',
    code: DEXIE_AUTH_CODE,
    provider: 'google',
    state: STATE
  },
  targetOrigin // Origin captured from redirect_uri or referer
);

window.close();
```

#### 6b. Custom URL Scheme (Capacitor / Native Apps)

If the client passed a `redirect_uri` with a custom scheme (e.g., `myapp://oauth-callback`),
the callback page redirects to that URL:

```js
window.location.href =
  'myapp://oauth-callback?code=DEXIE_AUTH_CODE&provider=google&state=STATE';
```

The native app intercepts this deep link and extracts the parameters.

#### 6c. Full Page Redirect (Web without Popup)

If there's no `window.opener` but the client passed an http/https `redirect_uri`,
the callback page redirects back to the client URL:

```js
window.location.href =
  'https://myapp.com/oauth-callback?code=DEXIE_AUTH_CODE&provider=google&state=STATE';
```

The client page at that URL handles the auth code from query parameters.

#### 6d. Error Case

If none of the above conditions are met (no opener, no redirect_uri), an error is displayed
explaining that the auth flow cannot complete.

---

### 7. Client Receives Authorization Code

**For Popup Flow (6a):**

SPA listens for postMessage and verifies:

- `type === "dexie:oauthResult"`
- origin (implicit via postMessage)
- provider
- state (optional)
- popup lifecycle

**For Capacitor/Native Apps (6b):**

App registers a deep link handler for the custom URL scheme:

```js
// Capacitor example
App.addListener('appUrlOpen', ({ url }) => {
  const params = new URL(url).searchParams;
  const code = params.get('code');
  const provider = params.get('provider');
  const state = params.get('state');
  // Proceed to token exchange
});
```

**For Full Page Redirect (6c):**

Client page reads parameters from the URL:

```js
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const provider = params.get('provider');
const state = params.get('state');
// Proceed to token exchange
```

Upon success, client proceeds to token exchange.

---

### 8. Client Performs Token Exchange

Client sends:

```http
POST /token
Content-Type: application/json
```

Payload:

```json
{
  "grant_type": "authorization_code",
  "code": "<DEXIE_AUTH_CODE>",
  "public_key": "<SPA_PUBLIC_KEY>",
  "scopes": ["ACCESS_DB"]
}
```

Dexie Cloud validates:

- Dexie authorization code integrity
- TTL (5 minutes)
- Single-use constraint
- Database context
- User identity and claims from stored data
- Subscription/license status

---

### 9. Dexie Cloud Issues Tokens

Dexie Cloud responds with:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

This completes authentication.

---

## Security Properties Achieved

- 🛑 No JWTs exposed via popup or URL
- 🛑 No refresh tokens in postMessage
- 🛑 Provider tokens never reach SPA (only Dexie tokens)
- 🛡 Single-use Dexie authorization code (5 min TTL)
- 🛡 PKCE prevents provider code interception
- 🛡 State stored server-side with TTL (30 min)
- 🛡 CSRF protection via `state` parameter
- 🛡 OAuth state deleted after use
- 🛡 Dexie auth code deleted after use
- 🛡 Email verification enforced by server
- 🛡 All provider exchanges happen server-side
- 🛡 CORS + origin protections during `/token` exchange
- 🛡 Future PoP (Proof-of-Possession) enabled via SPA public key
- 🛡 Works with Apple, Google, Microsoft, GitHub

---

## Resulting Benefits

- Works for SPA / PWA / Capacitor / WebViews
- Supports multi-tenant architectures
- Supports native account linking
- Enables refresh token rotation
- Supports offline-first/local-first model

This aligns with modern OIDC/OAuth best practices (2023+) and matches architectures used by:
Auth0, Firebase, Supabase, Okta, MSAL, Google Identity Services, Clerk, etc.
