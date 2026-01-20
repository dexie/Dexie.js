# Social Authentication for Dexie Cloud

## Overview

This feature adds support for OAuth 2.0 social login providers (Google, GitHub, Microsoft, Apple, and custom OAuth2) as an alternative to the existing OTP (One-Time Password) email authentication in Dexie Cloud.

**Key Design Principle**: The Dexie Cloud server acts as an OAuth broker, handling all provider interactions including the OAuth callback. The client library (dexie-cloud-addon) never receives provider tokens - only Dexie Cloud authorization codes which are exchanged for Dexie Cloud tokens.

### Related Files

- **Detailed flow diagram**: [oauth_flow.md](oauth_flow.md) - Sequence diagrams and detailed protocol description
- **Server implementation**: `/Users/daw/repos/dexie-cloud/libs/dexie-cloud-server`
  - `src/api/oauth/registerOAuthEndpoints.ts` - OAuth endpoints
  - `src/api/oauth/oauth-helpers.ts` - Provider exchange logic
  - `src/api/registerTokenEndpoint.ts` - Token endpoint (authorization_code grant)
  - `web-templates/oauth-callback.handlebars` - Callback page template

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

### Backward Compatibility Requirements

The implementation must be backward compatible in several scenarios:

#### 1. Apps with Custom Login GUI (not using default-ui)

Apps that implement their own login UI by subscribing to `db.cloud.userInteraction` must continue to work without changes. The new `DXCProviderSelection` type should only be emitted when:
- The server has OAuth providers configured AND enabled
- The client has NOT opted out via `db.cloud.configure({ socialAuth: false })`

**Solution**: Fetch `/auth-providers` first. If it returns providers, emit `DXCProviderSelection`. If empty or fails, emit `DXCEmailPrompt` as before. Apps with custom GUIs that don't handle `DXCProviderSelection` can:
- Add `socialAuth: false` to their config to disable it
- Or update their UI to handle the new type

#### 2. requireAuth with Unknown Server Capabilities

When `requireAuth: true`, the client must authenticate before accessing the database. The `/auth-providers` endpoint must be accessible **without authentication** (public read-only endpoint) so the client can discover available auth methods.

**Note**: The server already implements `/auth-providers` as a public endpoint (uses `readRateLimiter`, no auth required).

#### 3. On-Prem Customers with Older Server Versions

Customers running older dexie-cloud-server versions won't have the `/auth-providers` endpoint. The client must handle this gracefully:

**Solution**: 
- Catch 404/network errors from `/auth-providers`
- Fall back to OTP-only flow (existing `DXCEmailPrompt` behavior)
- Never emit `DXCProviderSelection` if endpoint unavailable
- Log a debug message for troubleshooting

#### 4. Client Opt-Out

Even if the server has OAuth configured, apps may want to disable it client-side (e.g., during migration, or for specific deployments).

**Solution**: Add `socialAuth` option to `DexieCloudOptions`:
```typescript
interface DexieCloudOptions {
  // ... existing options
  
  /** Enable social/OAuth authentication.
   * - true: Fetch providers from server, show if available (default)
   * - false: Disable OAuth, always use OTP flow
   */
  socialAuth?: boolean;  // Default: true
}
```

### ✅ Completed

- (None yet - work has not started on client side)

### 🔲 TODO

#### Types in dexie-cloud-common

> Types that reflect server API data should be placed in `dexie-cloud-common` (shared between server and client).

- [ ] **Create `OAuthProviderInfo` type** (`libs/dexie-cloud-common`)
  ```typescript
  interface OAuthProviderInfo {
    type: 'google' | 'github' | 'microsoft' | 'apple' | 'custom-oauth2';
    name: string;           // Provider identifier (e.g., 'google' or custom name)
    displayName: string;    // Human-readable name
    iconUrl?: string;       // URL to provider icon
    scopes?: string[];
  }
  ```

- [ ] **Create `AuthProvidersResponse` type** (`libs/dexie-cloud-common`)
  ```typescript
  interface AuthProvidersResponse {
    providers: OAuthProviderInfo[];
    otpEnabled: boolean;
  }
  ```

- [ ] **Create `OAuthResultMessage` type** (`libs/dexie-cloud-common`)
  ```typescript
  interface OAuthResultMessage {
    type: 'dexie:oauthResult';
    code?: string;      // Dexie auth code
    error?: string;     // Error message
    provider: string;
    state: string;
  }
  ```

- [ ] **Extend `TokenRequest` types** (`libs/dexie-cloud-common`)
  - Add `AuthorizationCodeTokenRequest` type for `grant_type: "authorization_code"`

#### Types and Interfaces in dexie-cloud-addon

- [ ] **Extend `LoginHints` interface** (`src/DexieCloudAPI.ts`)
  - Add `provider?: string` - Provider name to initiate OAuth flow
  - Add `oauthCode?: string` - Dexie auth code received from callback
  - Keep existing `email`, `userId`, `grant_type`, `otpId`, `otp`

- [ ] **Add `DXCProviderSelection` to `DXCUserInteraction`** (`src/types/DXCUserInteraction.ts`)
  
  The current `DXCUserInteraction` only supports text input fields. For OAuth, we need clickable provider buttons. Add a new interaction type:
  
  ```typescript
  /** When the system needs user to select a login method (OAuth provider or OTP) */
  export interface DXCProviderSelection {
    type: 'provider-selection';
    title: string;
    alerts: DXCAlert[];
    providers: OAuthProviderInfo[];  // Available OAuth providers
    otpEnabled: boolean;             // Whether email/OTP option is available
    fields: {};                      // Empty - no text fields
    submitLabel?: undefined;         // No submit button - provider buttons instead
    cancelLabel: string;
    onSelectProvider: (providerName: string) => void;
    onSelectOtp: () => void;         // User chose email/OTP instead
    onCancel: () => void;
  }
  ```
  
  Update the union type:
  ```typescript
  export type DXCUserInteraction =
    | DXCGenericUserInteraction
    | DXCEmailPrompt
    | DXCOTPPrompt
    | DXCMessageAlert
    | DXCLogoutConfirmation
    | DXCProviderSelection;  // NEW
  ```

#### Core Authentication Flow

- [ ] **Create `fetchAuthProviders()` function** (`src/authentication/fetchAuthProviders.ts`)
  - Fetches `GET /auth-providers` from database URL
  - Returns `AuthProvidersResponse`
  - **Handles failures gracefully**:
    - 404 → Return `{ providers: [], otpEnabled: true }` (old server)
    - Network error → Return `{ providers: [], otpEnabled: true }`
    - Log debug message for troubleshooting
  - Cache result with TTL to avoid repeated requests
  - Respects `socialAuth: false` option (returns empty providers without fetching)

- [ ] **Update authentication flow to check providers first**
  - Before prompting for email, call `fetchAuthProviders()`
  - If `providers.length > 0`:
    - Emit `DXCProviderSelection` interaction
    - Wait for user to select provider or OTP
  - If `providers.length === 0` or `otpEnabled` only:
    - Emit `DXCEmailPrompt` as before (existing behavior)

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

- [ ] **Create `ProviderSelectionDialog` component** (`src/default-ui/ProviderSelectionDialog.tsx`)
  - Handles the new `DXCProviderSelection` interaction type
  - Renders OAuth provider buttons
  - Renders "Continue with email" button if `otpEnabled`
  - Visual divider ("or") between options

- [ ] **Create `AuthProviderButton` component** (`src/default-ui/AuthProviderButton.tsx`)
  - Renders button for a single OAuth provider
  - Displays provider icon and name
  - Follows provider branding guidelines (Google, Apple, Microsoft have strict rules)
  - Supports light/dark mode

- [ ] **Update `LoginDialog.tsx`**
  - Handle OAuth popup flow when provider button clicked (via `onSelectProvider`)
  - Handle loading/error states

- [ ] **Update main dialog renderer** (`src/default-ui/index.tsx`)
  - Render `ProviderSelectionDialog` when `type === 'provider-selection'`

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
    
    /** Enable social/OAuth authentication.
     * - true (default): Fetch providers from server, show if available
     * - false: Disable OAuth, always use OTP flow
     * 
     * Use `false` for backward compatibility if your custom login UI
     * doesn't handle the `DXCProviderSelection` interaction type yet.
     */
    socialAuth?: boolean;
    
    /** Redirect URI for OAuth callback (Capacitor/redirect flows).
     * For web popups, this is auto-detected from window.location.origin.
     * Required for:
     * - Capacitor apps: 'myapp://oauth-callback'
     * - Full-page redirect flows: 'https://myapp.com/oauth-callback'
     */
    oauthRedirectUri?: string;
    
    /** Use popup window for OAuth flow.
     * - true (default for web): Opens OAuth in popup, uses postMessage
     * - false: Opens OAuth in same window or system browser (Capacitor)
     */
    oauthPopup?: boolean;
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

**Testing tip**: The dexie-cloud-todo-app sample (`samples/dexie-cloud-todo-app`) can be used for manual testing. Configure OAuth providers in dexie-cloud-manager for your test database.

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

**New files in dexie-cloud-common:**
- `src/OAuthProviderInfo.ts`
- `src/AuthProvidersResponse.ts`
- `src/OAuthResultMessage.ts`
- `src/AuthorizationCodeTokenRequest.ts`

**New files in dexie-cloud-addon:**
- `src/types/DXCUserInteraction.ts` - Add `DXCProviderSelection`
- `src/authentication/fetchAuthProviders.ts`
- `src/authentication/oauthLogin.ts`
- `src/authentication/exchangeOAuthCode.ts`
- `src/authentication/handleOAuthCallback.ts`
- `src/errors/OAuthError.ts`
- `src/default-ui/ProviderSelectionDialog.tsx`
- `src/default-ui/AuthProviderButton.tsx`

**Files to modify:**
- `src/DexieCloudAPI.ts` - Extend `LoginHints`
- `src/DexieCloudOptions.ts` - Add OAuth options
- `src/authentication/login.ts` - Integrate OAuth flow
- `src/authentication/interactWithUser.ts` - Add `promptForProvider()` helper
- `src/default-ui/index.tsx` - Render `ProviderSelectionDialog`
- `src/default-ui/LoginDialog.tsx` - Handle provider selection callbacks
- `src/default-ui/Styles.ts` - Provider button styles
