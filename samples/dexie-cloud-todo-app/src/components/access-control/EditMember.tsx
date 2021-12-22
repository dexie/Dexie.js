import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DBRealmMember } from 'dexie-cloud-addon';
import { usePermissions } from 'dexie-react-hooks';
import { db, TodoList } from '../../db';
import { EditMemberAccess, MemberAccess, memberAccessIcon } from './EditMemberAccess';

interface Props {
  member: DBRealmMember;
  todoList: TodoList;
}

export function EditMember({ member, todoList }: Props) {
  const can = usePermissions(db, 'members', member);
  const memberAccess: MemberAccess =
    member.userId === todoList.owner
      ? 'owner'
      : member.permissions?.manage === '*'
      ? 'manager'
      : member.permissions?.add === '*' ||
        member.permissions?.add?.includes('todoItems')
      ? 'doer'
      : 'readonly';
  return (
    <fieldset className="border p-1">
      <FontAwesomeIcon icon={memberAccessIcon[memberAccess]} />
      {can.update('permissions') ? <EditMemberAccess todoList={todoList} member={member} access={memberAccess} /> : memberAccess}
    </fieldset>
  );
}
