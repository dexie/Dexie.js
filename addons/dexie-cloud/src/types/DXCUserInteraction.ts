import { DXCAlert } from './DXCAlert';
import { DXCInputField } from './DXCInputField';

export type DXCUserInteraction =
  | DXCGenericUserInteraction
  | DXCEmailPrompt
  | DXCOTPPrompt
  | DXCMessageAlert
  | DXCLogoutConfirmation;

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
