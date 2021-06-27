import Events from '../helpers/Events';
import { GlobalDexieEvents } from '../public/types/db-events';

export const globalEvents = Events(null, "txcommitted") as GlobalDexieEvents;
