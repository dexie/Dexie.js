import type * as Y from 'yjs';
import type { DexieCloudDB } from '../db/DexieCloudDB';

export function $Y(db: DexieCloudDB): typeof Y {
    const $Y = db.dx._options.Y;
    if (!$Y) throw new Error('Y library not supplied to Dexie constructor');
    return $Y as typeof Y;
}

