import { DXCAlert } from './DXCAlert';
import { DXCInputField } from './DXCInputField';

export type DXCUserInteraction =
  | DXCGenericUserInteraction
  | DXCEmailPrompt
  | DXCOTPPrompt
  | DXCMessageAlert
  | DXCLogoutConfirmation;

/** A selectable option that can appear in any user interaction.
 * 
 * Similar to an HTML `<option>` element:
 * - `name` identifies the field name in the result (like input name attribute)
 * - `value` is the value to return when selected (like option value attribute)
 * - `displayName` is the human-readable label
 * 
 * When an option is selected, call `onSubmit({ [option.name]: option.value })`.
 */
export interface DXCOption {
  /** Field name for the result (like HTML input name attribute) */
  name: string;
  /** Value to return when selected (like HTML option value attribute) */
  value: string;
  /** Human-readable display label */
  displayName: string;
  /** URL to an icon image (can be a regular URL or a data: URL for inline images) */
  iconUrl?: string;
  /** Optional style hint for the UI (e.g., 'google', 'github', 'microsoft', 'apple', 'otp') */
  styleHint?: string;
}

export interface DXCGenericUserInteraction<Type extends string="generic", TFields extends {[name: string]: DXCInputField} = any> {
  type: Type;
  title: string;
  alerts: DXCAlert[];
  fields: TFields;
  /** Optional selectable options. When present, render as clickable buttons.
   * When user clicks an option, call `onSubmit({ [option.name]: option.value })`.
   */
  options?: DXCOption[];
  submitLabel: string;
  cancelLabel: string | null;
  onSubmit: (params: { [P in keyof TFields]: string} ) => void;
  onCancel: () => void;
}

/** When the system needs to prompt for an email address for login.
 * 
 * May include `options` when social login providers are available.
 * Options should be rendered as clickable buttons above the email field.
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
  /** Optional OAuth provider options. Render as clickable buttons. */
  options?: DXCOption[];
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
