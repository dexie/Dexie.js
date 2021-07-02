import { DXCAlert } from './DXCAlert';
import { DXCInputField } from './DXCInputField';

export type DXCUserInteraction =
  | DXCGenericUserInteraction
  | DXCEmailPrompt
  | DXCOTPPrompt
  | DXCMessageAlert;

export interface DXCGenericUserInteraction {
  type: 'generic';
  title: string;
  alerts: DXCAlert[];
  fields: { [name: string]: DXCInputField };
  onSubmit: (params: { [paramName: string]: string }) => void;
  onCancel: () => void;
}

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
  onSubmit: (params: { email: string }) => void;
  onCancel: () => void;
}

export interface DXCOTPPrompt {
  type: 'otp';
  title: string;
  alerts: DXCAlert[];
  fields: {
    otp: {
      type: 'text';
      label: string;
    };
  };
  onSumbit: (params: { otp: string }) => void;
  onCancel: () => void;
}

export interface DXCMessageAlert {
  type: 'message-alert';
  title: string;
  alerts: DXCAlert[];
  fields: {};
  onSubmit: (params: { [paramName: string]: string }) => void;
  onCancel: () => void;
}
