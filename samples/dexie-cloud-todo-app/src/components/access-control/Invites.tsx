import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
          <th></th>
        </tr>
        {invites.map((invite) => (
          <tr key={invite.id}>
            <td>
              <button
                onClick={() => {
                  invite.accept();
                }}
                disabled={!!invite.accepted}
              >
                {invite.accepted ? 'Accepted' : 'Accept'}
              </button>
              <button
                onClick={() => {
                  invite.reject();
                }}
                disabled={!!invite.rejected}
              >
                {invite.rejected ? 'Rejected' : 'Reject'}
              </button>
            </td>
            <td>{invite.realm?.name}</td>
            <td>{invite.invitedBy?.name}</td>
            <td>
              {' '}
              <a style={{cursor: 'pointer',}}
                onClick={() => {
                  db.members.delete(invite.id!);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </a>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
}
