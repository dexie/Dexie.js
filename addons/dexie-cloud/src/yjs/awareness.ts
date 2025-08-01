import type { Awareness } from 'y-protocols/awareness';

export const awarenessWeakMap = new WeakMap<any, Awareness>();

export const getDocAwareness = (doc: any) => awarenessWeakMap.get(doc);
