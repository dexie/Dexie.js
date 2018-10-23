export const FORMAT_HEADER = `{"format":"dexie","v":0001,"payload":`;
export const FORMAT_FOOTER = `}`;
export const VERSION = JSON.parse(FORMAT_HEADER + "null" + FORMAT_FOOTER).v;
