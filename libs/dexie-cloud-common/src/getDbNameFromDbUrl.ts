export function getDbNameFromDbUrl(
  dbUrl: string
) {
  const url = new URL(dbUrl);
  return url.pathname === "/"
    ? url.hostname.split('.')[0]
    : url.pathname.split('/')[1];
}

