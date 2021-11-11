import { useState } from 'react';
import { TodoList } from '../db/TodoList';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface Props {
  todoList: TodoList;
}

export function InviteForm({ todoList }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const members = useLiveQuery(() =>
    db.members
      .where({ realmId: todoList.realmId })
      .filter((m) => !!m.email)
      .toArray()
  );
  return (
    <>
      <h5>Shared with</h5>
      <table>
        {members?.map((member) => (
          <tr key={member.id}>
            <td>
              {member.name}&lt;{member.email}&gt;
            </td>
            <td>
              <button onClick={() => todoList.unshareWith(member.email!)}>
                Remove
              </button>
            </td>
            <td></td>
          </tr>
        ))}
      </table>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          todoList.shareWith(name, email, sendEmail);
        }}
      >
        <label>Invite someone</label>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(ev) => setSendEmail(ev.target.checked)}
          />
          Send invite email
        </label>
        <button type="submit">Send</button>
      </form>
    </>
  );
}
