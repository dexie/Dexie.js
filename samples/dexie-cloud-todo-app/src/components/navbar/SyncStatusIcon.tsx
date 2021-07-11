import { useObservable } from 'react-use';
import { db } from '../../db';
import { IconError } from '../icons/IconError';
import { IconInSync } from '../icons/IconInSync';
import { IconOffline } from '../icons/IconOffline';
import { IconSync } from '../icons/IconSync';
import { IconSyncing } from '../icons/IconSyncing';
import { ReactComponent as InSyncIcon } from '../icons/in-sync.svg';
import { SvgIcon } from './SvgIcon';

interface Props {
  className?: string;
}
export function SyncStatusIcon({ className }: Props) {
  const syncStatus = useObservable(db.cloud.syncState);
  switch (syncStatus?.phase) {
    case 'initial':
      return <SvgIcon className={className}></SvgIcon>;
    case 'not-in-sync':
      return (
        <SvgIcon className={className}>
          <IconSync />
        </SvgIcon>
      );
    case 'pulling':
    case 'pushing':
      return (
        <SvgIcon className={className}>
          <IconSyncing />
        </SvgIcon>
      );
    case 'in-sync':
      return (
        <SvgIcon className={className}>
          <IconInSync />
        </SvgIcon>
      );
    case 'offline':
      return (
        <SvgIcon
          className={className}
          title={syncStatus.error && '' + syncStatus.error}
        >
          <IconOffline />
        </SvgIcon>
      );
    case 'error':
      return (
        <SvgIcon
          className={className}
          title={syncStatus.error && '' + syncStatus.error}
        >
          <IconError />
        </SvgIcon>
      );

    default:
      /*return (
        <SvgIcon className={className}>
          <IconInSync />
        </SvgIcon>
      );*/
      return <SvgIcon className={className}>{syncStatus?.phase}</SvgIcon>;
  }
}
