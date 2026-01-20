/** Message sent via postMessage from OAuth callback page */
export interface OAuthResultMessage {
  /** Message type identifier */
  type: 'dexie:oauthResult';
  /** Dexie Cloud authorization code (on success) */
  code?: string;
  /** Error message (on failure) */
  error?: string;
  /** Provider name that was used for authentication */
  provider: string;
  /** State parameter for CSRF validation */
  state: string;
}

/** Type guard to check if a message is an OAuthResultMessage */
export function isOAuthResultMessage(msg: unknown): msg is OAuthResultMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as OAuthResultMessage).type === 'dexie:oauthResult' &&
    typeof (msg as OAuthResultMessage).provider === 'string' &&
    typeof (msg as OAuthResultMessage).state === 'string'
  );
}
