# Social Authentication for Dexie Cloud

## Overview

This feature adds support for OAuth 2.0 social login providers (Google, GitHub, Microsoft, Apple, and custom OAuth2) as an alternative to the existing OTP (One-Time Password) email authentication in Dexie Cloud.

**Key Design Principle**: The Dexie Cloud server acts as an OAuth broker, handling all provider interactions including the OAuth callback. The client library (dexie-cloud-addon) never receives provider tokens - only Dexie Cloud authorization codes which are exchanged for Dexie Cloud tokens.

### Flow Summary

1. **Client** fetches available auth providers from `GET /auth-providers`
2. **Client** opens popup/redirect to `GET /oauth/login/:provider`
3. **Dexie Cloud Server** redirects to OAuth provider and handles callback at `/oauth/callback/:provider`
4. **Server** exchanges provider code for tokens, verifies email, generates single-use Dexie auth code
5. **Server** delivers auth code to client via postMessage (popup), custom URL scheme (Capacitor), or redirect
6. **Client** exchanges Dexie auth code for tokens via `POST /token` with `grant_type: "authorization_code"`

### Supported Providers
- **Google** - OpenID Connect with PKCE
- **GitHub** - OAuth 2.0 (client secret only)
- **Microsoft** - OpenID Connect with PKCE
- **Apple** - Sign in with Apple (form_post response mode)
- **Custom OAuth2** - Configurable endpoints for self-hosted identity providers

### Client Delivery Methods

The library must support multiple integration patterns:

| Method | Use Case | Delivery Mechanism |
|--------|----------|-------------------|
| **Popup** | Web SPAs (recommended) | `postMessage` with `type: 'dexie:oauthResult'` |
| **Custom URL Scheme** | Capacitor/Native apps | Deep link redirect (e.g., `myapp://oauth-callback`) |
| **Full Page Redirect** | Web without popup support | HTTP redirect with query params |

---

## Server-Side Tasks (dexie-cloud-server)

### ✅ Completed

- [x] **OAuth provider configuration type** (`OAuthProviderConfig`)
  - Supports `google`, `github`, `apple`, `microsoft`, `custom-oauth2`
  - Configurable `clientId`, `clientSecret`, `scopes`, `enabled`
  - Custom OAuth2 config for self-hosted providers (authorization/token/userinfo endpoints)
  - `name` and `displayName` for custom providers
  - `iconUrl` for custom provider icons

- [x] **`GET /auth-providers` endpoint**
  - Returns list of enabled OAuth providers (without secrets) and OTP status
  - Includes `type`, `name`, `displayName`, `iconUrl`, `scopes` per provider
  - Default icons served from `/static/icons/` for built-in providers

- [x] **`GET /oauth/login/:provider` endpoint**
  - Accepts `redirect_uri` parameter for postMessage target / deep link
  - Validates `redirect_uri` against whitelisted origins (via `npx dexie-cloud whitelist`)
  - Generates state and PKCE challenge
  - Stores `state`, `codeVerifier`, `spaOrigin`, `clientRedirectUri` in challenges table
  - Redirects to OAuth provider with server callback URL (`/oauth/callback/:provider`)

- [x] **`GET /oauth/callback/:provider` endpoint** (NEW)
  - Receives callback from OAuth provider
  - Verifies state against stored challenges
  - Exchanges provider code for tokens (server-side)
  - Fetches and verifies user info (email must be verified)
  - Generates single-use Dexie Cloud authorization code (64 chars, 5 min TTL)
  - Stores user claims with auth code in challenges table
  - Returns HTML page that delivers auth code to client via:
    - `postMessage` to `window.opener` (popup flow)
    - Redirect to custom URL scheme (Capacitor/native)
    - Redirect to HTTPS URL (full page redirect flow)

- [x] **`POST /token` with `grant_type: "authorization_code"`**
  - Validates Dexie auth code (not provider code)
  - Verifies code is `dexie_oauth` type and within 5 min TTL
  - Extracts stored user claims (sub, email, name, picture, etc.)
  - Generates Dexie Cloud access/refresh tokens
  - `sub` format: `{provider}:{user_id}`

- [x] **OAuth helper functions** (`oauth-helpers.ts`)
  - `getProviderEndpoints()` - Returns auth/token/userinfo URLs per provider
  - `shouldUsePKCE()` - Determines if provider supports PKCE
  - `exchangeCodeForTokens()` - Exchanges code for provider tokens
  - `fetchUserInfo()` - Fetches and normalizes user info from provider

- [x] **Crypto utilities** (`crypto-utils.ts`)
  - `generateRandomString()` - For state, PKCE code_verifier, and auth codes

- [x] **Handlebars template** (`oauth-callback.handlebars`)
  - Renders callback page with postMessage/redirect logic
  - Handles error display

- [x] **Configuration GUI in dexie-cloud-manager**
  - `OAuthProviderDialog.tsx` - UI for configuring OAuth providers per database

---

## Client-Side Tasks (dexie-cloud-addon)

> **Note**: dexie-cloud-addon is a **library**, not an app. It must support various frameworks including Next.js, Vite, Svelte, SvelteKit, Capacitor, React Native, etc.

### ✅ Completed

- (None yet - work has not started on client side)

### 🔲 TODO

#### Types and Interfaces

- [ ] **Create `OAuthProviderInfo` type** (`src/types/OAuthProviderInfo.ts`)
  ```typescript
  interface OAuthProviderInfo {
    type: 'google' | 'github' | 'microsoft' | 'apple' | 'custom-oauth2';
    name: string;           // Provider identifier (e.g., 'google' or custom name)
    displayName: string;    // Human-readable name
    iconUrl?: string;       // URL to provider icon
    scopes?: string[];
  }
  
  interface AuthProvidersResponse {
    providers: OAuthProviderInfo[];
    otpEnabled: boolean;
  }
  ```

- [ ] **Extend `LoginHints` interface** (`src/DexieCloudAPI.ts`)
  - Add `provider?: string` - Provider name to initiate OAuth flow
  - Add `oauthCode?: string` - Dexie auth code received from callback
  - Keep existing `email`, `userId`, `grant_type`, `otpId`, `otp`

- [ ] **Create `OAuthResultMessage` type**
  ```typescript
  interface OAuthResultMessage {
    type: 'dexie:oauthResult';
    code?: string;      // Dexie auth code
    error?: string;     // Error message
    provider: string;
    state: string;
  }
  ```

#### Core Authentication Flow

- [ ] **Create `fetchAuthProviders()` function** (`src/authentication/fetchAuthProviders.ts`)
  - Fetches `GET /auth-providers` from database URL
  - Returns `AuthProvidersResponse`
  - Cache result with TTL to avoid repeated requests

- [ ] **Create `oauthLogin()` function** (`src/authentication/oauthLogin.ts`)
  - Opens popup window to `/oauth/login/:provider`
  - Listens for `postMessage` with `type: 'dexie:oauthResult'`
  - Validates message origin
  - Returns auth code or throws on error/cancel
  - Handles popup blocked scenario (fallback to redirect?)
  
- [ ] **Create `exchangeOAuthCode()` function** (`src/authentication/exchangeOAuthCode.ts`)
  - Sends `POST /token` with:
    ```json
    {
      "grant_type": "authorization_code",
      "code": "<DEXIE_AUTH_CODE>",
      "public_key": "<SPA_PUBLIC_KEY>",
      "scopes": ["ACCESS_DB"]
    }
    ```
  - Returns `TokenFinalResponse`

- [ ] **Update `login()` function** (`src/authentication/login.ts`)
  - If `hints.provider` is set, use OAuth flow instead of OTP
  - If `hints.oauthCode` is set, exchange code directly (for redirect/deep link flows)
  - Integrate with existing `authenticate()` flow

- [ ] **Create `handleOAuthCallback()` function** (`src/authentication/handleOAuthCallback.ts`)
  - For redirect/deep link flows where app needs to handle the callback
  - Parses `code`, `provider`, `state`, `error` from URL
  - Completes login flow by calling `login({ oauthCode, provider })`
  - Can be called by apps on their callback route

#### Default UI Components

- [ ] **Create `AuthProviderButton` component** (`src/default-ui/AuthProviderButton.tsx`)
  - Renders button for a single OAuth provider
  - Displays provider icon and name
  - Follows provider branding guidelines (Google, Apple, Microsoft have strict rules)
  - Supports light/dark mode

- [ ] **Update `LoginDialog.tsx`**
  - Fetch auth providers on mount
  - Show OAuth provider buttons if any are enabled
  - Show email/OTP input only if `otpEnabled` is true
  - Add visual divider ("or") between OAuth and email login
  - Handle OAuth popup flow when provider button clicked
  - Handle loading/error states for provider fetch

- [ ] **Update `Styles.ts`**
  - Add styles for OAuth provider buttons
  - Provider-specific button colors (Google blue, GitHub black, etc.)
  - Dark mode variants

#### Capacitor / Mobile Support

- [ ] **Document deep link handling** (not library code, but patterns)
  - Show how apps should register custom URL scheme
  - Provide example of handling `appUrlOpen` event
  - Call `db.cloud.login({ oauthCode, provider })` from handler

- [ ] **Support `redirect_uri` configuration**
  - Allow apps to configure their redirect URI in `db.cloud.configure()`
  - Use for Capacitor apps with custom URL schemes
  - Use for full-page redirect flows

#### DexieCloudOptions Extension

- [ ] **Add OAuth-related options** (`src/DexieCloudOptions.ts`)
  ```typescript
  interface DexieCloudOptions {
    // ... existing options
    oauthRedirectUri?: string;  // For Capacitor/redirect flows
    oauthPopup?: boolean;       // Default: true for web, false for Capacitor
  }
  ```

#### Error Handling

- [ ] **Create `OAuthError` class** (`src/errors/OAuthError.ts`)
  - Extends existing error handling
  - Error codes: `popup_blocked`, `popup_closed`, `access_denied`, `invalid_state`, `email_not_verified`, `expired_code`
  - User-friendly messages

- [ ] **Handle common OAuth errors in UI**
  - Popup blocked → show message with manual retry button
  - User cancelled → silent failure or subtle message
  - Provider error → show error alert

#### Testing

- [ ] **Unit tests for OAuth flow**
  - Mock postMessage events
  - Test popup lifecycle handling
  - Test error scenarios

- [ ] **Integration tests**
  - Test with mock OAuth callback page
  - Test token exchange

#### Documentation

- [ ] **Update README.md**
  - Document OAuth login: `db.cloud.login({ provider: 'google' })`
  - Show Capacitor integration pattern
  - Explain redirect vs popup flows

---

## Client Integration Patterns

### Web SPA (Popup Flow - Default)

```typescript
// User clicks "Login with Google"
await db.cloud.login({ provider: 'google' });
// Popup opens, user authenticates, popup closes, user is logged in
```

### Capacitor / Native App

```typescript
// In db.cloud.configure()
db.cloud.configure({
  databaseUrl: 'https://mydb.dexie.cloud',
  oauthRedirectUri: 'myapp://oauth-callback',
  oauthPopup: false
});

// Handle deep link in app
App.addListener('appUrlOpen', async ({ url }) => {
  const params = new URL(url).searchParams;
  const code = params.get('code');
  const provider = params.get('provider');
  if (code && provider) {
    await db.cloud.login({ oauthCode: code, provider });
  }
});

// Initiate login (opens system browser)
await db.cloud.login({ provider: 'google' });
```

### Full Page Redirect (No Popup)

```typescript
db.cloud.configure({
  databaseUrl: 'https://mydb.dexie.cloud',
  oauthRedirectUri: 'https://myapp.com/oauth-callback',
  oauthPopup: false
});

// On /oauth-callback page:
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const provider = params.get('provider');
if (code && provider) {
  await db.cloud.login({ oauthCode: code, provider });
  window.history.replaceState({}, '', '/'); // Clean URL
}
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (dexie-cloud-addon)                       │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────────┐  │
│  │ LoginDialog │───▶│ oauthLogin()│───▶│ Opens popup to                  │  │
│  │ (default UI)│    │             │    │ /oauth/login/:provider          │  │
│  └─────────────┘    └─────────────┘    └─────────────────────────────────┘  │
│                            │                                                 │
│                            │ Listens for postMessage                        │
│                            ▼                                                 │
│                     ┌─────────────┐                                         │
│                     │ Receives    │                                         │
│                     │ auth code   │                                         │
│                     └──────┬──────┘                                         │
│                            │                                                 │
│                            ▼                                                 │
│                     ┌─────────────────┐    ┌─────────────────────────────┐  │
│                     │exchangeOAuthCode│───▶│ POST /token                 │  │
│                     │                 │    │ grant_type: authorization_  │  │
│                     │                 │◀───│ code                        │  │
│                     └─────────────────┘    └─────────────────────────────┘  │
│                            │                                                 │
│                            ▼                                                 │
│                     ┌─────────────┐                                         │
│                     │ User logged │                                         │
│                     │ in!         │                                         │
│                     └─────────────┘                                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         DEXIE CLOUD SERVER                                   │
│                                                                              │
│  /oauth/login/:provider                                                      │
│  ├── Generate state, PKCE                                                   │
│  ├── Store in challenges table                                              │
│  └── Redirect to OAuth provider                                             │
│                                                                              │
│  /oauth/callback/:provider  ◀── OAuth provider redirects here               │
│  ├── Verify state                                                           │
│  ├── Exchange code for provider tokens (server-side!)                       │
│  ├── Fetch user info, verify email                                          │
│  ├── Generate Dexie auth code (single-use, 5 min TTL)                       │
│  └── Return HTML page with postMessage/redirect                             │
│                                                                              │
│  POST /token (grant_type: authorization_code)                               │
│  ├── Validate Dexie auth code                                               │
│  ├── Extract stored user claims                                             │
│  └── Return Dexie Cloud access + refresh tokens                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Properties

- 🛡 **No provider tokens reach client** - All provider exchange happens server-side
- 🛡 **Single-use Dexie auth codes** - 5 minute TTL, deleted after use
- 🛡 **PKCE protection** - Prevents code interception (where supported)
- 🛡 **State parameter** - CSRF protection, stored server-side
- 🛡 **Origin validation** - postMessage uses captured origin, redirect_uri whitelisted
- 🛡 **Email verification enforced** - Server rejects unverified emails

---

## Key Files to Create/Modify

**New files:**
- `src/types/OAuthProviderInfo.ts`
- `src/authentication/fetchAuthProviders.ts`
- `src/authentication/oauthLogin.ts`
- `src/authentication/exchangeOAuthCode.ts`
- `src/authentication/handleOAuthCallback.ts`
- `src/errors/OAuthError.ts`
- `src/default-ui/AuthProviderButton.tsx`

**Files to modify:**
- `src/DexieCloudAPI.ts` - Extend `LoginHints`
- `src/DexieCloudOptions.ts` - Add OAuth options
- `src/authentication/login.ts` - Integrate OAuth flow
- `src/default-ui/LoginDialog.tsx` - Show provider buttons
- `src/default-ui/Styles.ts` - Provider button styles
