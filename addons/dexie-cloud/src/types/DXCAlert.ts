
export type DXCAlert = DXCErrorAlert | DXCWarningAlert | DXCInfoAlert;

export interface DXCErrorAlert {
  type: 'error';
  messageCode:
    | 'INVALID_OTP'
    | 'INVALID_EMAIL'
    | 'LICENSE_LIMIT_REACHED'
    | 'GENERIC_ERROR'
    // Policy rejection codes — returned by server as structured 403 responses.
    // Use these in a switch statement to display translated or custom messages.
    | 'USER_NOT_REGISTERED'
    | 'EMAIL_NOT_ALLOWED'
    | 'NO_SEATS_AVAILABLE'
    | 'USER_NOT_ACCEPTED'
    | 'WEBHOOK_ERROR';
  message: string;
  messageParams: { [paramName: string]: string; };
  /** Optional text that users can copy to clipboard (e.g. a CLI command) */
  copyText?: string;
}

export interface DXCWarningAlert {
  type: 'warning';
  messageCode: 'GENERIC_WARNING' | 'LOGOUT_CONFIRMATION';
  message: string;
  messageParams: { [paramName: string]: string; };
  /** Optional text that users can copy to clipboard (e.g. a CLI command) */
  copyText?: string;
}

export interface DXCInfoAlert {
  type: 'info';
  messageCode: 'GENERIC_INFO' | 'OTP_SENT';
  message: string;
  messageParams: { [paramName: string]: string; };
  /** Optional text that users can copy to clipboard (e.g. a CLI command) */
  copyText?: string;
}
