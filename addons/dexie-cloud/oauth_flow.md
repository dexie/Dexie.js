# OAuth Authorization Code Flow for Dexie Cloud SPA Integration

## Actors

- **SPA** – Customer's frontend application
- **Dexie Cloud** – Auth broker + database access control
- **OAuth Provider** – Google, GitHub, Apple, Microsoft, etc.

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

The client initiates the OAuth flow. There are two ways to do this:

#### 2a. Full Page Redirect (Recommended for Web SPAs)

```js
window.location.href = `https://<db>.dexie.cloud/oauth/login/google?redirect_uri=${encodeURIComponent(location.href)}`;
```

The `redirect_uri` parameter specifies where Dexie Cloud should redirect after authentication.
This can be any page in your app - no dedicated callback route is needed.

#### 2b. Custom URL Scheme (Capacitor / Native Apps)

```js
// Open in system browser or in-app browser
Browser.open({
  url: `https://<db>.dexie.cloud/oauth/login/google?redirect_uri=${encodeURIComponent('myapp://')}`
});
```

The custom scheme `myapp://` tells Dexie Cloud to redirect back via deep link.

---

### 3. Dexie Cloud Prepares OAuth

Dexie Cloud receives `/oauth/login/google` and generates:

- `state` (anti-CSRF)
- `code_verifier` (PKCE)
- `code_challenge` (PKCE)

Stores these in the challenges table, then redirects the browser to provider:

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

Provider redirects back to Dexie Cloud:

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

Dexie Cloud issues an HTTP 302 redirect back to the client with the authorization code.
The auth data is encapsulated in a single `dxc-auth` query parameter containing base64url-encoded JSON.
This avoids collisions with the app's own query parameters.

#### 6a. Full Page Redirect (Web SPAs)

If the client passed an http/https `redirect_uri`, Dexie Cloud redirects:

```
HTTP/1.1 302 Found
Location: https://myapp.com/?dxc-auth=eyJjb2RlIjoiLi4uIiwicHJvdmlkZXIiOiJnb29nbGUiLCJzdGF0ZSI6Ii4uLiJ9
```

The `dxc-auth` parameter contains base64url-encoded JSON:

```json
{ "code": "DEXIE_AUTH_CODE", "provider": "google", "state": "STATE" }
```

Or in case of error:

```json
{ "error": "Error message", "provider": "google", "state": "STATE" }
```

The app doesn't need a dedicated OAuth callback route - the dexie-cloud client library
detects and processes the `dxc-auth` parameter on any page load.

#### 6b. Custom URL Scheme (Capacitor / Native Apps)

If the client passed a `redirect_uri` with a custom scheme (e.g., `myapp://`),
Dexie Cloud redirects to that URL with the same `dxc-auth` parameter:

```
HTTP/1.1 302 Found
Location: myapp://?dxc-auth=eyJjb2RlIjoiLi4uIiwicHJvdmlkZXIiOiJnb29nbGUiLCJzdGF0ZSI6Ii4uLiJ9
```

The native app intercepts this deep link and decodes the parameter.

#### 6c. Error Case

If no valid `redirect_uri` was provided, an error page is displayed
explaining that the auth flow cannot complete.

---

### 7. Client Receives Authorization Code

**For Full Page Redirect (6a):**

The `dexie-cloud-addon` library handles OAuth callback detection automatically:

1. When `db.cloud.configure()` is called, the addon checks for the `dxc-auth` query parameter
2. This check only runs in DOM environments (not in Web Workers)
3. If the parameter is present:
   - The URL is immediately cleaned up using `history.replaceState()` to remove `dxc-auth`
   - A `setTimeout(cb, 0)` is scheduled to initiate the token exchange
   - The token exchange fetches from the configured `databaseUrl`
   - The response is processed in the existing `db.on('ready')` callback when Dexie is ready

```js
// Pseudocode for dexie-cloud-addon implementation
function configure(options) {
  // Only check in DOM environment, not workers
  if (typeof window !== 'undefined' && window.location) {
    const encoded = new URLSearchParams(location.search).get('dxc-auth');
    if (encoded) {
      // Decode base64url (unpadded) to JSON
      const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4);
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const { code, provider, state, error } = payload;

      // Clean up URL immediately (remove dxc-auth param)
      const url = new URL(location.href);
      url.searchParams.delete('dxc-auth');
      history.replaceState(null, '', url.toString());

      if (!error) {
        // Schedule token exchange (processed in db.on('ready'))
        setTimeout(() => {
          // Perform token exchange with options.databaseUrl
        }, 0);
      }
    }
  }
}
```

**For Capacitor/Native Apps (6b):**

App registers a deep link handler and decodes the same parameter:

```js
// Capacitor example
App.addListener('appUrlOpen', ({ url }) => {
  const parsedUrl = new URL(url);
  const encoded = parsedUrl.searchParams.get('dxc-auth');
  if (encoded) {
    const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const { code, provider, state, error } = payload;
    // Proceed to token exchange
  }
});
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

- 🛑 No JWTs exposed via URL fragments
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
