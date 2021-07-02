export type LoginState =
  | LoginStateSilent
  | LoginStateInteraction
  | LoginStateError;

export interface LoginStateSilent {
  type: 'silent';
}

export type LoginStateInteraction = (Alert | EmailRequested | OTPRequested) & {
  type: 'interaction';
  alerts?: {
    type: 'error' | 'warning' | 'info';
    message: string;
  }[];
  isWorking?: boolean;
  onSubmit: (params: LoginPromptReply) => void;
  onCancel: () => void;
};

export type LoginPromptReply = {
  email?: string;
  otp?: string;
  name?: string;
};

export interface LoginStateError {
  type: 'error';
  message: string;
}

interface Alert {
  interactionType: 'alert';
  alerts: {
    type: 'error' | 'warning' | 'info';
    message: string;
  }[];
  submitText: 'OK';
}

interface EmailRequested {
  interactionType: 'emailRequested';
  submitText: 'Send OTP';
}

interface OTPRequested {
  interactionType: 'otpRequested';
  isWorking: boolean;
  submitText: 'Login';
}
