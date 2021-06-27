export const IS_SERVICE_WORKER =
  typeof self !== "undefined" && "clients" in self && !self.document;
