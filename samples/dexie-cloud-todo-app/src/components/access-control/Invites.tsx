import { useObservable } from 'react-use';
import { db } from '../../db';

export function Invites() {
  const currentUser = useObservable(db.cloud.currentUser);
  const invites = useObservable(db.cloud.invites, []);
  if (invites.length === 0) return null;
  return (
    <>
      <h3>You've got invited!</h3>
      <table>
        <tr>
          <th></th>
          <th>Name of list</th>
          <th>Invited by</th>
        </tr>
        {invites.map((i) => (
          <tr key={i.id}>
            <td>
              {i.accepted ? (
                '✓'
              ) : i.email === currentUser?.email ? (
                <button
                  onClick={() =>
                    db.members.update(i.id!, { accepted: new Date() })
                  }
                >
                  Accept
                </button>
              ) : (
                ''
              )}
            </td>
            <td>{i.realm?.name}</td>
            <td>{i.invitedBy?.name}</td>
          </tr>
        ))}
      </table>
    </>
  );
}
