import { 
  Cloud, 
  CloudOff, 
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
      return <Cloud className={iconClassName} />;
    case 'connecting':
      return <Loader2 className={cn(iconClassName, "animate-spin")} />;
    case 'connected':
      return <Wifi className={cn(iconClassName, "text-green-500")} />;
    case 'disconnected':
      return <CloudOff className={cn(iconClassName, "text-yellow-500")} />;
    case 'offline':
      return (
        <div title={syncStatus.error ? String(syncStatus.error) : undefined}>
          <WifiOff className={cn(iconClassName, "text-orange-500")} />
        </div>
      );
    case 'error':
      return (
        <div title={syncStatus.error ? String(syncStatus.error) : undefined}>
          <AlertCircle className={cn(iconClassName, "text-red-500")} />
        </div>
      );
    default:
      return <Cloud className={iconClassName} />;
  }
}
