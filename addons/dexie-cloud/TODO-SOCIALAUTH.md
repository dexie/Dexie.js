# Social Authentication for Dexie Cloud

## Overview

This feature adds support for OAuth 2.0 social login providers (Google, GitHub, Microsoft, Apple, and custom OAuth2) as an alternative to the existing OTP (One-Time Password) email authentication in Dexie Cloud.

**Key Design Principle**: The Dexie Cloud server acts as an OAuth broker, handling all provider interactions including the OAuth callback. The client library (dexie-cloud-addon) never receives provider tokens - only Dexie Cloud authorization codes which are exchanged for Dexie Cloud tokens.

### Related Files

- **Detailed flow diagram**: [oauth_flow.md](oauth_flow.md) - Sequence diagrams and detailed protocol description
- **Server implementation**: See `dexie-cloud-server` repository
  - `src/api/oauth/registerOAuthEndpoints.ts` - OAuth endpoints
  - `src/api/oauth/oauth-helpers.ts` - Provider exchange logic
  - `src/api/registerTokenEndpoint.ts` - Token endpoint (authorization_code grant)

### Flow Summary

1. **Client** fetches available auth providers from `GET /auth-providers`
2. **Client** redirects to `GET /oauth/login/:provider` (full page redirect)
3. **Dexie Cloud Server** redirects to OAuth provider and handles callback at `/oauth/callback/:provider`
4. **Server** exchanges provider code for tokens, verifies email, generates single-use Dexie auth code
5. **Server** redirects back to client with `dxc-auth` query parameter (base64url-encoded JSON)
6. **Client** detects `dxc-auth` in `db.cloud.configure()`, exchanges code for tokens via `POST /token`

### Supported Providers
- **Google** - OpenID Connect with PKCE
- **GitHub** - OAuth 2.0 (client secret only)
- **Microsoft** - OpenID Connect with PKCE
- **Apple** - Sign in with Apple (form_post response mode)
- **Custom OAuth2** - Configurable endpoints for self-hosted identity providers

### Client Delivery Methods

| Method | Use Case | Delivery Mechanism |
|--------|----------|-------------------|
| **Full Page Redirect** | Web SPAs (recommended) | HTTP redirect with `dxc-auth` query param |
| **Custom URL Scheme** | Capacitor/Native apps | Deep link redirect (e.g., `myapp://`) |

---

## Implementation Status

### ✅ Server-Side (dexie-cloud-server) - COMPLETE

- [x] **OAuth provider configuration type** (`OAuthProviderConfig`)
- [x] **`GET /auth-providers` endpoint** - Returns enabled providers and OTP status
- [x] **`GET /oauth/login/:provider` endpoint** - Initiates OAuth flow with PKCE
- [x] **`GET /oauth/callback/:provider` endpoint** - Handles provider callback, redirects with `dxc-auth`
- [x] **`POST /token` with `grant_type: "authorization_code"`** - Exchanges Dexie auth code for tokens
- [x] **OAuth helper functions** (`oauth-helpers.ts`)
- [x] **Configuration GUI in dexie-cloud-manager**

### ✅ Client-Side (dexie-cloud-addon) - COMPLETE

#### Types in dexie-cloud-common

- [x] **`OAuthProviderInfo` type** - Provider metadata
- [x] **`AuthProvidersResponse` type** - Response from `/auth-providers`
- [x] **`AuthorizationCodeTokenRequest` type** - Token request for OAuth codes

#### Types and Interfaces in dexie-cloud-addon

- [x] **Extended `LoginHints` interface** - Added `provider`, `oauthCode`
- [x] **`DXCProviderSelection` interaction type** - For provider selection UI
- [x] **`DexieCloudOptions` extension** - Added `socialAuth`, `oauthRedirectUri`

#### Core Authentication Flow

- [x] **`fetchAuthProviders()`** - Fetches available providers from server
- [x] **`startOAuthRedirect()`** - Initiates OAuth via full page redirect
- [x] **`parseOAuthCallback()`** - Parses `dxc-auth` query parameter
- [x] **`cleanupOAuthUrl()`** - Removes `dxc-auth` from URL via `history.replaceState()`
- [x] **`exchangeOAuthCode()`** - Exchanges Dexie auth code for tokens
- [x] **OAuth detection in `configure()`** - Auto-detects `dxc-auth` on page load
- [x] **OAuth processing in `onDbReady`** - Completes login when database is ready
- [x] **Updated `login()` function** - Supports `provider` and `oauthCode` hints

#### Default UI Components

- [x] **`ProviderSelectionDialog`** - Renders provider selection screen
- [x] **`AuthProviderButton`** - Renders individual provider buttons with icons
- [x] **`OtpButton`** - "Continue with email" option
- [x] **Updated `LoginDialog.tsx`** - Handles OAuth redirect flow
- [x] **Updated `Styles.ts`** - Provider button styles

#### Error Handling

- [x] **`OAuthError` class** - Error codes: `access_denied`, `invalid_state`, `email_not_verified`, `expired_code`, `provider_error`, `network_error`

---

## 🔲 Remaining TODO

### Testing

- [ ] **Unit tests for OAuth flow**
  - Test `parseOAuthCallback()` with various `dxc-auth` payloads
  - Test error scenarios
  - Test URL cleanup

- [ ] **Integration tests**
  - Test full redirect flow with mock server
  - Test token exchange

- [ ] **Manual testing**
  - Test with `samples/dexie-cloud-todo-app`
  - Test with Capacitor app (deep links)

### Documentation

- [ ] **Update README.md**
  - Document OAuth login: `db.cloud.login({ provider: 'google' })`
  - Show Capacitor integration pattern
  - Explain redirect flow

- [ ] **Update dexie.org docs**
  - Add OAuth configuration guide
  - Document `socialAuth` and `oauthRedirectUri` options

---

## Client Integration Patterns

### Web SPA (Redirect Flow)

```typescript
// Configure database
db.cloud.configure({
  databaseUrl: 'https://mydb.dexie.cloud'
});

// OAuth callback is handled automatically!
// When page loads with ?dxc-auth=..., the addon:
// 1. Detects the parameter in configure()
// 2. Cleans up the URL immediately
// 3. Completes login in db.on('ready')

// To manually initiate OAuth (e.g., from custom UI):
await db.cloud.login({ provider: 'google' });
// Page redirects to OAuth provider, then back with auth code
```

### Capacitor / Native App

```typescript
// Configure with custom URL scheme
db.cloud.configure({
  databaseUrl: 'https://mydb.dexie.cloud',
  oauthRedirectUri: 'myapp://'
});

// Handle deep link in app
App.addListener('appUrlOpen', async ({ url }) => {
  const callback = handleOAuthCallback(url);
  if (callback) {
    await db.cloud.login({ 
      oauthCode: callback.code, 
      provider: callback.provider 
    });
  }
});

// Initiate login (opens system browser)
await db.cloud.login({ provider: 'google' });
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (dexie-cloud-addon)                       │
│                                                                              │
│  ┌─────────────────┐    ┌───────────────────┐                               │
│  │ LoginDialog     │───▶│ startOAuthRedirect│──▶ window.location.href =     │
│  │ (default UI)    │    │ ()                │    /oauth/login/:provider     │
│  └─────────────────┘    └───────────────────┘                               │
│                                                                              │
│            ... page navigates away, user authenticates ...                  │
│                                                                              │
│  ┌─────────────────┐    ┌───────────────────┐                               │
│  │ Page loads with │───▶│ db.cloud.         │──▶ Detects dxc-auth param     │
│  │ ?dxc-auth=...   │    │ configure()       │    Cleans URL immediately     │
│  └─────────────────┘    └───────────────────┘    Stores pending code        │
│                                   │                                          │
│                                   ▼                                          │
│                         ┌─────────────────┐    ┌─────────────────────────┐  │
│                         │ db.on('ready')  │───▶│ POST /token             │  │
│                         │                 │    │ grant_type:             │  │
│                         │                 │◀───│ authorization_code      │  │
│                         └─────────────────┘    └─────────────────────────┘  │
│                                   │                                          │
│                                   ▼                                          │
│                         ┌─────────────────┐                                  │
│                         │ User logged in! │                                  │
│                         └─────────────────┘                                  │
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
│  └── HTTP 302 redirect with ?dxc-auth=<base64url-json>                      │
│                                                                              │
│  POST /token (grant_type: authorization_code)                               │
│  ├── Validate Dexie auth code                                               │
│  ├── Extract stored user claims                                             │
│  └── Return Dexie Cloud access + refresh tokens                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## The `dxc-auth` Query Parameter

The OAuth callback uses a single `dxc-auth` query parameter containing base64url-encoded JSON to avoid collisions with app query parameters:

**Success:**
```json
{ "code": "DEXIE_AUTH_CODE", "provider": "google", "state": "..." }
```

**Error:**
```json
{ "error": "Error message", "provider": "google", "state": "..." }
```

Example URL:
```
https://myapp.com/?dxc-auth=eyJjb2RlIjoiLi4uIiwicHJvdmlkZXIiOiJnb29nbGUiLCJzdGF0ZSI6Ii4uLiJ9
```

---

## Security Properties

- 🛡 **No provider tokens reach client** - All provider exchange happens server-side
- 🛡 **Single-use Dexie auth codes** - 5 minute TTL, deleted after use
- 🛡 **PKCE protection** - Prevents code interception (where supported)
- 🛡 **State parameter** - CSRF protection, stored server-side
- 🛡 **Origin validation** - redirect_uri validated and whitelisted
- 🛡 **Email verification enforced** - Server rejects unverified emails
- 🛡 **No tokens in URL fragments** - Auth code in query param, not fragment

---

## Key Files

**dexie-cloud-common:**
- `src/OAuthProviderInfo.ts`
- `src/AuthProvidersResponse.ts`
- `src/AuthorizationCodeTokenRequest.ts`

**dexie-cloud-addon:**
- `src/authentication/oauthLogin.ts` - `startOAuthRedirect()`, `mapOAuthError()`
- `src/authentication/handleOAuthCallback.ts` - `parseOAuthCallback()`, `cleanupOAuthUrl()`
- `src/authentication/exchangeOAuthCode.ts` - Token exchange
- `src/authentication/fetchAuthProviders.ts` - Fetch available providers
- `src/errors/OAuthError.ts` - OAuth-specific errors
- `src/default-ui/ProviderSelectionDialog.tsx` - Provider selection UI
- `src/default-ui/AuthProviderButton.tsx` - Provider button component
- `src/dexie-cloud-client.ts` - OAuth detection in `configure()`, processing in `onDbReady`
- `src/DexieCloudOptions.ts` - `socialAuth`, `oauthRedirectUri` options
