export class HttpError extends Error {
  httpStatus: number;
  constructor(
    res: Response,
    message?: string)
  {
    super(message || `${res.status} ${res.statusText}`);
    this.httpStatus = res.status;
  }

  get name() {
    return "HttpError";
  }
}
