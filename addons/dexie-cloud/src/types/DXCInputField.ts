
export type DXCInputField = DXCTextField | DXCPasswordField;

export interface DXCTextField {
  type: 'text' | 'email' | 'otp';
  label?: string;
  placeholder?: string;
}

export interface DXCPasswordField {
  type: 'password';
  label?: string;
  placeholder?: string;
}
