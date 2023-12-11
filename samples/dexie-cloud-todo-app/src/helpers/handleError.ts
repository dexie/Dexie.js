export function handleError<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  return (...args: TArgs) =>
    fn(...args).catch((error) => {
      if (error?.name === 'AbortError') {
        // AbortErrors are normal. It means a user has willingly cancelled a dialog
        // or aborted a transaction. Give a lower log level.
        console.debug(error);
      } else {
        console.error(error);
      }
    });
}
