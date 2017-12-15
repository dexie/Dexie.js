export function safariMultiStoreFix(storeNames: string[]) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}
