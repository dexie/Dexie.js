
export type DXCAlert = DXCErrorAlert | DXCWarningAlert | DXCInfoAlert;

export interface DXCErrorAlert {
  type: 'error';
  messageCode: 'INVALID_OTP' |
  'INVALID_EMAIL' |
  'LICENSE_LIMIT_REACHED' |
  'GENERIC_ERROR';
  message: string;
  messageParams: { [paramName: string]: string; };
}

export interface DXCWarningAlert {
  type: 'warning';
  messageCode: 'GENERIC_WARNING';
  message: string;
  messageParams: { [paramName: string]: string; };
}

export interface DXCInfoAlert {
  type: 'info';
  messageCode: 'GENERIC_INFO' | 'OTP_SENT';
  message: string;
  messageParams: { [paramName: string]: string; };
}
