import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckDouble,
  faEye,
  faQuestion,
  faUserEdit,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { DBRealmMember, getTiedRealmId } from 'dexie-cloud-addon';
import { useObservable } from 'dexie-react-hooks';
import { db, TodoList } from '../../db';

export const memberAccessIcon: {
  [memberAccess: string]: IconDefinition;
} = {
  owner: faUserEdit,
  doer: faCheckDouble,
  manager: faUserTie,
  readonly: faEye,
};

interface Props {
  todoList: TodoList;
  member: DBRealmMember;
  access: string;
}

export function EditMemberAccess({ todoList, member, access }: Props) {
  const roles = useObservable(db.cloud.roles) || {};
  return (
    <select
      disabled={
        todoList.owner === member.userId &&
        member.userId === db.cloud.currentUserId
      }
      style={{border: 0}}
      value={access}
      onChange={(ev) => changeAccess(todoList, member, access, ev.target.value)}
    >
      <option value="owner" disabled={!member.userId}>
        Owner
      </option>
      {Object.entries(roles).map(([roleName, role]) => (
        <option key={roleName} value={roleName}>
          {role.displayName}
        </option>
      ))}
      {!roles[access] && access !== 'owner' && <option key={access}>(unknown)</option>}
    </select>
  );
}

function changeAccess(
  todoList: TodoList,
  member: DBRealmMember,
  existingAccess: string,
  newAccess: string
) {
  const realmId = getTiedRealmId(todoList.id);
  return db.transaction('rw', db.todoLists, db.members, db.realms, () => {
    if (existingAccess !== 'owner' && newAccess === 'owner') {
      if (!member.userId)
        throw new Error(
          `Cannot give ownership to user before invite is accepted.`
        );
      // Before changing owner, give full permissions to the old owner:
      db.members
        .where({ realmId, userId: todoList.owner })
        .modify({ roles: ['manager'] });
      // Change owner of the todo list:
      db.todoLists.update(todoList, { owner: member.userId });
      // Change owner of realm:
      db.realms.update(realmId, { owner: member.userId });
    }
    if (newAccess !== 'owner') {
      db.members.update(member, { permissions: {}, roles: [newAccess] });
    }
    if (existingAccess === 'owner' && newAccess !== 'owner') {
      // Remove ownership by letting current user take ownership instead:
      db.todoLists.update(todoList, { owner: db.cloud.currentUserId });
      db.realms.update(realmId, {
        owner: db.cloud.currentUserId,
      });
    }
  });
}
