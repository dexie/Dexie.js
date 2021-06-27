import { wrap } from "../helpers/promise";

export function eventRejectHandler(reject) {
  return wrap(function (event) {
      preventDefault(event);
      reject (event.target.error);
      return false;
  });
}

export function eventSuccessHandler (resolve) {
  return wrap(function (event){
      resolve(event.target.result);
  });
}

export function hookedEventRejectHandler (reject) {
  return wrap(function (event) {
      // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.
      
      var req = event.target,
          err = req.error,
          ctx = req._hookCtx,// Contains the hook error handler. Put here instead of closure to boost performance.
          hookErrorHandler = ctx && ctx.onerror;
      hookErrorHandler && hookErrorHandler(err);
      preventDefault(event);
      reject (err);
      return false;
  });
}

export function hookedEventSuccessHandler(resolve) {
  // wrap() is needed when calling hooks because the rare scenario of:
  //  * hook does a db operation that fails immediately (IDB throws exception)
  //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
  //    wrap() will also execute in a virtual tick.
  //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
  //  * If this was the last event in the bulk, the promise will resolve after a physical tick
  //    and the transaction will have committed already.
  // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
  // because it is always marked with _lib = true when created using Transaction._promise().
  return wrap(function(event) {
      var req = event.target,
          ctx = req._hookCtx,// Contains the hook error handler. Put here instead of closure to boost performance.
          result = ctx.value || req.result, // Pass the object value on updates. The result from IDB is the primary key.
          hookSuccessHandler = ctx && ctx.onsuccess;
      hookSuccessHandler && hookSuccessHandler(result);
      resolve && resolve(result);
  }, resolve);
}


export function preventDefault(event) {
  if (event.stopPropagation) // IndexedDBShim doesnt support this on Safari 8 and below.
      event.stopPropagation();
  if (event.preventDefault) // IndexedDBShim doesnt support this on Safari 8 and below.
      event.preventDefault();
}

export function BulkErrorHandlerCatchAll(errorList, done?, supportHooks?) {
  return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(e => {
      errorList.push(e);
      done && done();
  });
}

