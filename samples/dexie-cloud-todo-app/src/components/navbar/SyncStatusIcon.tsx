import { 
  Cloud, 
  CloudMoon,
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { useObservable } from 'react-use';
import { db } from '../../db';
import { cn } from '../../lib/utils';

interface Props {
  className?: string;
}

export function SyncStatusIcon({ className }: Props) {
  const syncStatus = useObservable(db.cloud.syncState);
  
  const iconClassName = cn("text-muted-foreground", className);
  
  switch (syncStatus?.status) {
    case 'not-started':
      return (
        <div title="Sync not started">
          <Cloud className={iconClassName} />
        </div>
      );
    case 'connecting':
      return (
        <div title="Connecting to cloud...">
          <Loader2 className={cn(iconClassName, "animate-spin")} />
        </div>
      );
    case 'connected':
      return (
        <div title="Connected and syncing">
          <Wifi className={cn(iconClassName, "text-green-500")} />
        </div>
      );
    case 'disconnected':
      // Use CloudMoon to suggest "sleeping/dormant" rather than "off"
      return (
        <div title="Connection sleeping - will reconnect when active">
          <CloudMoon className={cn(iconClassName, "text-blue-400")} />
        </div>
      );
    case 'offline':
      return (
        <div title={syncStatus.error ? String(syncStatus.error) : "Offline"}>
          <WifiOff className={cn(iconClassName, "text-orange-500")} />
        </div>
      );
    case 'error':
      return (
        <div title={syncStatus.error ? String(syncStatus.error) : "Connection error"}>
          <AlertCircle className={cn(iconClassName, "text-red-500")} />
        </div>
      );
    default:
      return (
        <div title="Sync status unknown">
          <Cloud className={iconClassName} />
        </div>
      );
  }
}
