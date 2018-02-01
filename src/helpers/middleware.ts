import { MiddlewareStack, MiddlewareFunction } from '../public/types/middleware';
import { WriteRequest } from '../public/types/mutation-core';

export function createMiddlewareStack<TRequest, TResponse> (finalHandler: (req: TRequest) => TResponse) : MiddlewareStack<TRequest, TResponse> {
  let stack: {level: number, middleware: MiddlewareFunction<TRequest, TResponse>}[] = [];

  return {
    invoke: finalHandler,

    use (middleware: MiddlewareFunction<TRequest, TResponse>, stackLevel: number) {
      stack.push({middleware, level: stackLevel});
      stack.sort((a,b)=>b.level - a.level);
      this.invoke = stack
        .map(entry => entry.middleware)
        .reduce((next: (req: TRequest) => TResponse, mw) => req => mw(req, next), finalHandler);
      return this;
    },

    unuse (middleware: MiddlewareFunction<TRequest, TResponse>) {
      stack = stack.filter(mw => mw.middleware !== middleware);
      return this;
    }
  }
}
