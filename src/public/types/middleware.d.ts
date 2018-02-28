export type MiddlewareFunction<TRequest, TResponse> = (
  req: TRequest,
  next: (req: TRequest) => TResponse 
) => TResponse;

export interface MiddlewareStack<TRequest, TResponse> {
  use (middleware: MiddlewareFunction<TRequest, TResponse>, stackLevel: number) : this;
  unuse (middleware: MiddlewareFunction<TRequest, TResponse>) : this;
  invoke (req: TRequest, stackLevel?: number) : TResponse;
}
