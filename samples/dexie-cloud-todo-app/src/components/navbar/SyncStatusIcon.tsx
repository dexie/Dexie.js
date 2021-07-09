import { useObservable } from 'react-use';
import { db } from '../../models/db';
import { IconInSync } from '../icons/IconInSync';
import { IconSyncing } from '../icons/IconSyncing';
import { ReactComponent as InSyncIcon } from '../icons/in-sync.svg';
import { SvgIcon } from './SvgIcon';

interface Props {
  className?: string;
}
export function SyncStatusIcon({ className }: Props) {
  const syncStatus = useObservable(db.cloud.syncState);
  switch (syncStatus?.phase) {
    case 'in-sync':
      return (
        <SvgIcon className={className}>
          <IconInSync />
        </SvgIcon>
      );
    case 'pulling':
    case 'pushing':
      return (
        <SvgIcon className={className}>
          <IconSyncing />
        </SvgIcon>
      );
    case 'initial':
    default:
      /*return (
        <SvgIcon className={className}>
          <IconInSync />
        </SvgIcon>
      );*/
      return <SvgIcon className={className}>{syncStatus?.phase}</SvgIcon>;
  }
}
