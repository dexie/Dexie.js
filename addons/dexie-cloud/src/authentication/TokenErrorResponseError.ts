import { TokenErrorResponse } from 'dexie-cloud-common';

export class TokenErrorResponseError extends Error {
  title: string;
  messageCode:
    | 'INVALID_OTP'
    | 'INVALID_EMAIL'
    | 'LICENSE_LIMIT_REACHED'
    | 'GENERIC_ERROR';
  message: string;
  messageParams?: { [param: string]: string };

  constructor({
    title,
    message,
    messageCode,
    messageParams,
  }: TokenErrorResponse) {
    super(message);
    this.name = 'TokenErrorResponseError';
    this.title = title;
    this.messageCode = messageCode;
    this.messageParams = messageParams;
  }
}
