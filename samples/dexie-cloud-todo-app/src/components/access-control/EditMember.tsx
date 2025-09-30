import { User, Crown } from 'lucide-react';
import { DBRealmMember } from 'dexie-cloud-addon';
import { useObservable, usePermissions } from 'dexie-react-hooks';
import { db, TodoList } from '../../db';
import { EditMemberAccess } from './EditMemberAccess';

interface Props {
  member: DBRealmMember;
  todoList: TodoList;
}

export function EditMember({ member, todoList }: Props) {
  const can = usePermissions(db, 'members', member);
  const globalRoles = useObservable(db.cloud.roles);
  const roleName = member.roles?.[0];
  const role = roleName ? globalRoles?.[roleName] : null;

  const memberAccess =
    member.userId === todoList.owner ? 'owner' : roleName || 'readonly';

  const memberAccessDisplayName =
    memberAccess === 'owner' ? 'Owner' : role?.displayName || memberAccess;

  const getIcon = () => {
    if (memberAccess === 'owner') return <Crown className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded border border-gray-200 min-w-[100px]">
      {getIcon()}
      {can.update('roles') ? (
        <EditMemberAccess
          todoList={todoList}
          member={member}
          access={memberAccess}
        />
      ) : (
        <span className="text-sm font-medium">{memberAccessDisplayName}</span>
      )}
    </div>
  );
}
