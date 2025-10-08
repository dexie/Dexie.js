import { DBRealmMember } from 'dexie-cloud-addon';
import { useObservable } from 'dexie-react-hooks';
import { db, TodoList } from '../../db';

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
      style={{ border: 0 }}
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

async function changeAccess(
  todoList: TodoList,
  member: DBRealmMember,
  existingAccess: string,
  newAccess: string
) {
  if (newAccess === 'owner') {
    //
    // Assigning ownership
    //
    if (!member.userId) {
      throw new Error(
        `Cannot give ownership to user before invite is accepted.`
      );
    }
    if (existingAccess === 'owner') {
      // Already owner - no change
      return;
    } else {
      // Change ownership to this member
      return todoList.changeOwner(member.userId);
    }
  } else {
    //
    // Assigning role
    //
    if (member.userId === todoList.owner) {
      // The user wants to change the current owner to get another role.
      // Assume user wants to deassign the ownership first to someone else.
      // Since somebody has to be owner, transfer ownership to the actor (current user).
      await todoList.changeOwner(db.cloud.currentUserId);
    }
    await todoList.changeMemberRole(member, newAccess);
  }
}
