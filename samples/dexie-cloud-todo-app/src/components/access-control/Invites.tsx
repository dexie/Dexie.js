import { Trash2, Users } from 'lucide-react';
import { useObservable } from 'react-use';
import { db } from '../../db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function Invites() {
  const invites = useObservable(db.cloud.invites, []);
  if (invites.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          You've got invited!
        </CardTitle>
        <CardDescription>
          You have {invites.length} pending invitation{invites.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{invite.realm?.name}</div>
                <div className="text-sm text-muted-foreground">
                  Invited by {invite.invitedBy?.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => invite.accept()}
                  disabled={!!invite.accepted}
                  variant={invite.accepted ? "secondary" : "default"}
                >
                  {invite.accepted ? 'Accepted' : 'Accept'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => invite.reject()}
                  disabled={!!invite.rejected}
                >
                  {invite.rejected ? 'Rejected' : 'Reject'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => db.members.delete(invite.id!)}
                  title="Remove invite"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
