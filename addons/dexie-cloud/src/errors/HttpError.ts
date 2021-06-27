export class HttpError extends Error {
  constructor(
    res: Response,
    message?: string)
  {
    super(message || `${res.status} ${res.statusText}`);
  }

  get name() {
    return "HttpError";
  }
}
