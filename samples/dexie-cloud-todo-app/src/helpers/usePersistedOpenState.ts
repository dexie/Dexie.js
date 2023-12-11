import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function usePersistedOpenState(
  namespace: string,
  id: string,
  defaultOpen = false
) {
  const isOpen =
    useLiveQuery(
      () => db.openCloseStates.get([namespace, id]),
      [namespace, id],
      defaultOpen
    ) ?? defaultOpen;
  const setIsOpen = (isOpen: boolean) =>
    db.openCloseStates.put(isOpen, [namespace, id]);
  return [isOpen, setIsOpen] as const;
}
