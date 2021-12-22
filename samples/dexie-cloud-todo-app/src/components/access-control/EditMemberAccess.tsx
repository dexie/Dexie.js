import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckDouble,
  faEye,
  faUserEdit,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { DBRealmMember, getTiedRealmId } from 'dexie-cloud-addon';
import { db, TodoList } from '../../db';

export type MemberAccess = 'owner' | 'doer' | 'manager' | 'readonly';

export const memberAccessIcon: {
  [memberAccess in MemberAccess]: IconDefinition;
} = {
  owner: faUserEdit,
  doer: faCheckDouble,
  manager: faUserTie,
  readonly: faEye,
};

interface Props {
  todoList: TodoList;
  member: DBRealmMember;
  access: MemberAccess;
}

export function EditMemberAccess({ todoList, member, access }: Props) {
  return (
    <select
      disabled={todoList.owner === member.userId && member.userId === db.cloud.currentUserId}
      value={access}
      onChange={(ev) =>
        changeAccess(todoList, member, access, ev.target.value as MemberAccess)
      }
    >
      {Object.keys(memberAccessIcon).map((a) => (
        <option key={a} value={a} disabled={a === 'owner' && !member.userId}>
          {a}
        </option>
      ))}
    </select>
  );
}

function changeAccess(
  todoList: TodoList,
  member: DBRealmMember,
  existingAccess: MemberAccess,
  newAccess: MemberAccess
) {
  const realmId = getTiedRealmId(todoList.id);
  return db.transaction('rw', db.todoLists, db.members, db.realms, () => {
    if (existingAccess !== 'owner' && newAccess === 'owner') {
      if (!member.userId)
        throw new Error(`Cannot give ownership to user before invite is accepted.`);
      // Before changing owner, give full permissions to the old owner:
      db.members
        .where({ realmId, userId: todoList.owner })
        .modify({ permissions: { manage: '*' } });
      // Change owner of the todo list:
      db.todoLists.update(todoList, { owner: member.userId });
      // Change owner of realm:
      db.realms.update(realmId, { owner: member.userId });
    }
    switch (newAccess) {
      case 'doer':
        db.members.update(member, {
          permissions: {
            add: ['todoItems'],
            update: { todoItems: ['done'] },
          },
        });
        break;
      case 'manager':
        db.members.update(member, {
          permissions: {
            manage: '*'
          },
        });
        break;
      case 'readonly':
        db.members.update(member, { permissions: {} });
        break;
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
