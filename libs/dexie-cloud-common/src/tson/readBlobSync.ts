export function readBlobSync(b: Blob): string {
  const req = new XMLHttpRequest();
  req.overrideMimeType("text/plain; charset=x-user-defined");
  const url = URL.createObjectURL(b);
  try {
    req.open("GET", url, false); // Sync
    req.send();
    if (req.status !== 200 && req.status !== 0) {
      throw new Error("Bad Blob access: " + req.status);
    }
    return req.responseText;
  } finally {
    URL.revokeObjectURL(url);
  }
}
