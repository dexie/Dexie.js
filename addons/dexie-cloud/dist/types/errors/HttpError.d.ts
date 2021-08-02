export declare class HttpError extends Error {
    httpStatus: number;
    constructor(res: Response, message?: string);
    get name(): string;
}
