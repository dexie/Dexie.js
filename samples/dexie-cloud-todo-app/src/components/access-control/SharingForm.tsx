import { useState } from 'react';
import { TodoList } from '../../db/TodoList';
import { useLiveQuery, useObservable, usePermissions } from 'dexie-react-hooks';
import { db } from '../../db';
import { DBRealmMember } from 'dexie-cloud-addon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { EditMember } from './EditMember';
import * as importFile from '../../data/importfile.json';
interface Props {
  todoList: TodoList;
}

export function SharingForm({ todoList }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const members = useLiveQuery(async () => {
    const result = await db.members
      .where({ realmId: todoList.realmId })
      //.filter((m) => !!m.email)
      .toArray();
    return result;
  }, [todoList.realmId]);
  const [manualInviteOpen, setManualInviteOpen] = useState(false);

  const can = usePermissions(todoList);
  return (
    <>
      {members && members.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Shared with:</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <MemberRow key={member.id} {...{ todoList, member }} />
            ))}
          </tbody>
        </table>
      )}
      <hr />
      {can.add('members') && (
        <>
          <h4>Invite someone?</h4>
          <table>
            <tbody>
              {Object.keys(importFile.demoUsers).map((demoUser) => (
                <tr>
                  <td>{demoUser}</td>
                  <td>
                    <button type="button" onClick={()=>{
                      setManualInviteOpen(false);
                      todoList.shareWith(demoUser, demoUser, true, ["doer"]);
                    }}>
                      Invite
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {manualInviteOpen ? (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                setManualInviteOpen(false);
                todoList.shareWith(name, email, true, ["doer"]);
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
          ) : (
            <a
              href="#"
              onClick={(ev) => {
                ev.preventDefault();
                setManualInviteOpen(true);
              }}
            >
              Invite by email address
            </a>
          )}
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
  const isMe = member.userId === db.cloud.currentUserId;
  const isOwner = member.userId === todoList.owner;
  let memberText = member.name || member.email || member.userId;
  if (isMe) memberText += ' (me)';

  return (
    <tr>
      <td style={{ paddingRight: 12 }}>{memberText}</td>
      <td>
        <EditMember member={member} todoList={todoList} />
      </td>
      <td>
        {can.delete() && !isOwner ? (
          <div className="todo-list-trash">
            <button
              className="button"
              onClick={() => todoList.unshareWith(member)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ) : (
          !isOwner &&
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
