import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DBRealmMember } from 'dexie-cloud-addon';
import { useObservable, usePermissions } from 'dexie-react-hooks';
import { db, TodoList } from '../../db';
import { EditMemberAccess, memberAccessIcon } from './EditMemberAccess';

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
  return (
    <fieldset className="border p-1">
        <FontAwesomeIcon style={{margin: '0 4px 0 0', width: 22}} icon={memberAccessIcon[memberAccess] || faQuestion} />
      {can.update('roles') ? (
        <EditMemberAccess
          todoList={todoList}
          member={member}
          access={memberAccess}
        />
      ) : (
        memberAccessDisplayName
      )}
    </fieldset>
  );
}
