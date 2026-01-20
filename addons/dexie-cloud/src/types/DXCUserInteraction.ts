import { OAuthProviderInfo } from 'dexie-cloud-common';
import { DXCAlert } from './DXCAlert';
import { DXCInputField } from './DXCInputField';

export type DXCUserInteraction =
  | DXCGenericUserInteraction
  | DXCEmailPrompt
  | DXCOTPPrompt
  | DXCMessageAlert
  | DXCLogoutConfirmation
  | DXCProviderSelection;

export interface DXCGenericUserInteraction<Type extends string="generic", TFields extends {[name: string]: DXCInputField} = any> {
  type: Type;
  title: string;
  alerts: DXCAlert[];
  fields: TFields;
  submitLabel: string;
  cancelLabel: string | null;
  onSubmit: (params: { [P in keyof TFields]: string} ) => void;
  onCancel: () => void;
}

/** When the system needs to prompt for an email address for login.
 * 
*/
export interface DXCEmailPrompt {
  type: 'email';
  title: string;
  alerts: DXCAlert[];
  fields: {
    email: {
      type: 'text';
      placeholder: string;
    };
  };
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (params: { email: string } | { [paramName: string]: string }) => void;
  onCancel: () => void;
}

/** When the system needs to prompt for an OTP code.
 * 
*/
export interface DXCOTPPrompt {
  type: 'otp';
  title: string;
  alerts: DXCAlert[];
  fields: {
    otp: {
      type: 'text';
      label: string;
    }
  };
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (params: { otp: string } | { [paramName: string]: string }) => void;
  onCancel: () => void;
}

/** When the system must inform about errors, warnings or information */
export interface DXCMessageAlert {
  type: 'message-alert';
  title: string;
  alerts: DXCAlert[];
  fields: {
    [name: string]: DXCInputField;
  };
  submitLabel: string;
  cancelLabel?: null;
  onSubmit: (params: { [paramName: string]: string }) => void;
  onCancel: () => void;
}

/** When the system needs confirmation to logout current user when
 * there are unsynced changes that would be lost.
 */
export interface DXCLogoutConfirmation {
  type: 'logout-confirmation';
  title: string;
  alerts: DXCAlert[];
  fields: {
    [name: string]: DXCInputField;
  };
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (params: { [paramName: string]: string }) => void;
  onCancel: () => void;
}

/** When the system needs user to select a login method (OAuth provider or OTP).
 * Emitted when the server has OAuth providers configured and enabled.
 */
export interface DXCProviderSelection {
  type: 'provider-selection';
  title: string;
  alerts: DXCAlert[];
  /** Available OAuth providers */
  providers: OAuthProviderInfo[];
  /** Whether email/OTP option is available */
  otpEnabled: boolean;
  /** Empty - no text fields for this interaction type */
  fields: {};
  /** No submit button - provider buttons instead */
  submitLabel?: undefined;
  cancelLabel: string;
  /** Called when user selects an OAuth provider */
  onSelectProvider: (providerName: string) => void;
  /** Called when user chooses email/OTP instead */
  onSelectOtp: () => void;
  onCancel: () => void;
}
