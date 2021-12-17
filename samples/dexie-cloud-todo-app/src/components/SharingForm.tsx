import { useState } from 'react';
import { TodoList } from '../db/TodoList';
import { useLiveQuery, usePermissions } from 'dexie-react-hooks';
import { db } from '../db';
import { DBRealmMember } from 'dexie-cloud-addon';

interface Props {
  todoList: TodoList;
}

export function SharingForm({ todoList }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const members = useLiveQuery(async () => {
    console.log(
      'QUERY useLiveQuery() for members on realm ',
      todoList.realmId
    );
    const result = (await db.members
      .where({ realmId: todoList.realmId })
      //.filter((m) => !!m.email)
      .toArray()).filter((m) => !!m.email);
    console.log(`QUERY result: ${JSON.stringify(result)}`)
    return result;
  }, [todoList.realmId]);
  console.log(`QUERY rendering result ${JSON.stringify(members)}`)

  const can = usePermissions(todoList);
  return (
    <>
      <h5>Shared with</h5>
      <table>
        <tbody>
          {members?.map((member) => (
            <MemberRow key={member.id} {...{ todoList, member }} />
          ))}
        </tbody>
      </table>
      <hr />
      {can.add('members') && (
        <>
          <h4>Invite someone?</h4>
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              todoList.shareWith(name, email, true);
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <button type="submit" disabled={!/@/.test(email)}>
              Send invite
            </button>
          </form>
          <hr />
        </>
      )}
    </>
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
  return (
    <tr>
      <td>
        {member.name} &lt;{member.email}&gt;
      </td>
      <td>
        {can.delete() ? (
          <button onClick={() => todoList.unshareWith(member.email!)}>
            Remove
          </button>
        ) : (
          member.userId === db.cloud.currentUserId &&
          ((member.accepted?.getTime() || 0) >
          (member.rejected?.getTime() || 0) ? (
            <button onClick={() => todoList.leave()}>Leave list</button>
          ) : (
            <button
              onClick={() =>
                db.members.update(member.id!, {
                  accepted: new Date(),
                  rejected: undefined,
                })
              }
            >
              Accept invite
            </button>
          ))
        )}
      </td>
      <td></td>
    </tr>
  );
}
