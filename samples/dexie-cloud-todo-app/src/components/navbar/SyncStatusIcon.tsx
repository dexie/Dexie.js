import { useObservable } from 'react-use';
import { db } from '../../db';
import { IconConnecting } from '../icons/IconConnecting';
import { IconError } from '../icons/IconError';
import { IconOffline } from '../icons/IconOffline';
import { IconOnline } from '../icons/IconOnline';
import { IconSleepyCloud } from '../icons/IconSleepyCloud';
import { SvgIcon } from './SvgIcon';

interface Props {
  className?: string;
}
export function SyncStatusIcon({ className }: Props) {
  const syncStatus = useObservable(db.cloud.syncState);
  switch (syncStatus?.status) {
    case 'not-started':
      return <SvgIcon className={className}></SvgIcon>;
    case 'connecting':
      return (
        <SvgIcon className={className}>
          <IconConnecting />
        </SvgIcon>
      );
    case 'connected':
      return (
        <SvgIcon className={className}>
          <IconOnline />
        </SvgIcon>
      );
    case 'disconnected':
      return (
        <SvgIcon className={className}>
          <IconSleepyCloud />
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
