import { useState } from 'react';
import { TodoList } from '../../db/TodoList';
import { useLiveQuery, usePermissions } from 'dexie-react-hooks';
import { db } from '../../db';
import { DBRealmMember } from 'dexie-cloud-addon';
import { Trash2, Mail, UserPlus } from 'lucide-react';
import { EditMember } from './EditMember';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import demoUsersJson from '../../data/demoUsers.json';

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
    <div className="space-y-3">
      {members && members.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Shared with:</h4>
          <div className="space-y-1">
            {members?.map((member) => (
              <MemberRow key={member.id} {...{ todoList, member }} />
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-border pt-3">
        {can.add('members') && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite someone?
            </h4>
            
            <div className="space-y-1">
              {Object.keys(demoUsersJson.demoUsers)
                .filter((demoUser) => demoUser !== db.cloud.currentUserId)
                .map((demoUser) => (
                  <div key={demoUser} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-blue-100">
                    <span className="text-sm text-foreground">{demoUser}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setManualInviteOpen(false);
                        todoList.shareWith(demoUser, demoUser, true, ['doer']);
                      }}
                      className="h-7 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
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
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManualInviteOpen(true)}
                  className="flex items-center gap-2 h-8 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Mail className="h-4 w-4" />
                  Invite by email address
                </Button>
              </div>
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

  const handleUnshare = async (member: DBRealmMember) => {
    await todoList.unshareWith(member);
    const numOtherPeople = await db.members
          .where({ realmId: todoList.realmId })
          .filter((m) => m.userId !== db.cloud.currentUserId)
          .count();
    if (numOtherPeople === 0) {
      // If you removed the last other person, you are now the sole owner.
      // Remove all other members (there should be none) and make the list
      // private again.
      await todoList.makePrivate();
    }
  }
  

  return (
    <div className={`flex items-center justify-between py-2 px-3 bg-white rounded border border-blue-100 ${
      member.accepted ? '' : 'opacity-50'
    }`}>
      <div className="flex-1">
        <span className="text-sm text-foreground font-medium">{memberText}</span>
        {!member.rejected && !member.accepted && (
          <span className="text-xs text-muted-foreground italic ml-2">Pending invite</span>
        )}
        {member.rejected && (
          <span className="text-xs text-muted-foreground italic ml-2">Rejected</span>
        )}
      </div>
      
      <div className="flex items-center gap-2 min-w-[140px] justify-end">
        <EditMember member={member} todoList={todoList} />
        
        <div className="w-8 flex justify-center ml-1">
          {can.delete() && !isOwner ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnshare(member)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
                onClick={() => todoList.leaveList()}
                className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 min-w-[50px]"
              >
                Leave
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
                className="h-7 px-3 text-xs bg-blue-500 hover:bg-blue-600"
              >
                Accept
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
