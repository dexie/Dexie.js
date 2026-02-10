export function readBlobSync(b: Blob): string {
  const req = new XMLHttpRequest();
  req.overrideMimeType("text/plain; charset=x-user-defined");
  req.open("GET", URL.createObjectURL(b), false); // Sync
  req.send();
  if (req.status !== 200 && req.status !== 0) {
    throw new Error("Bad Blob access: " + req.status);
  }
  return req.responseText;
}
