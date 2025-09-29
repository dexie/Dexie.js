import { useState } from 'react';
import { TodoList } from '../../db/TodoList';
import { useLiveQuery, usePermissions } from 'dexie-react-hooks';
import { db } from '../../db';
import { DBRealmMember } from 'dexie-cloud-addon';
import { Trash2, Mail, UserPlus } from 'lucide-react';
import { EditMember } from './EditMember';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import importFile from '../../data/importfile.json';

interface Props {
  todoList: TodoList;
}

export function SharingForm({ todoList }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const members = useLiveQuery(async () => {
    const result = await db.members
      .where({ realmId: todoList.realmId })
      .toArray();
    return result;
  }, [todoList.realmId]);
  const [manualInviteOpen, setManualInviteOpen] = useState(false);

  const can = usePermissions(todoList);
  
  return (
    <div className="space-y-4">
      {members && members.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Shared with:</h4>
          <div className="space-y-2">
            {members?.map((member) => (
              <MemberRow key={member.id} {...{ todoList, member }} />
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-border pt-4">
        {can.add('members') && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite someone?
            </h4>
            
            <div className="space-y-2">
              {Object.keys(importFile.demoUsers)
                .filter((demoUser) => demoUser !== db.cloud.currentUserId)
                .map((demoUser) => (
                  <div key={demoUser} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-foreground">{demoUser}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setManualInviteOpen(false);
                        todoList.shareWith(demoUser, demoUser, true, ['doer']);
                      }}
                    >
                      Invite
                    </Button>
                  </div>
                ))}
            </div>
            
            {manualInviteOpen ? (
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  setManualInviteOpen(false);
                  todoList.shareWith(name, email, true, ['doer']);
                  setName('');
                  setEmail('');
                }}
                className="space-y-3 p-4 bg-muted/50 rounded-lg"
              >
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={!/@/.test(email)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send invite
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualInviteOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualInviteOpen(true)}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Invite by email address
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberRow({
  member,
  todoList,
}: {
  member: DBRealmMember;
  todoList: TodoList;
}) {
  const can = usePermissions(db, 'members', member);
  const isMe = member.userId === db.cloud.currentUserId;
  const isOwner = member.userId === todoList.owner;
  let memberText = member.name || member.email || member.userId;
  if (isMe) memberText += ' (me)';

  return (
    <div className={`flex items-center justify-between p-3 bg-background rounded-lg border ${
      member.accepted ? 'border-border' : 'border-border opacity-50'
    }`}>
      <div className="flex-1">
        <span className="text-sm text-foreground">{memberText}</span>
        {!member.rejected && !member.accepted && (
          <span className="text-xs text-muted-foreground italic ml-2">Pending invite</span>
        )}
        {member.rejected && (
          <span className="text-xs text-muted-foreground italic ml-2">Rejected</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <EditMember member={member} todoList={todoList} />
        
        {can.delete() && !isOwner ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => todoList.unshareWith(member)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          !isOwner &&
          member.userId === db.cloud.currentUserId &&
          ((member.accepted?.getTime() || 0) >
          (member.rejected?.getTime() || 0) ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => todoList.leave()}
            >
              Leave list
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                db.members.update(member.id!, {
                  accepted: new Date(),
                  rejected: undefined,
                })
              }
            >
              Accept invite
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
