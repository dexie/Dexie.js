import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { useObservable } from "react-use";
import { db } from "./db";

export function Invites() {
  const currentUser = useObservable(db.cloud.currentUser);
  /*const invites = useLiveQuery(()=>
    db.members.filter(m => m.email === currentUser?.email && !m.accepted).toArray());*/
  const invites = useLiveQuery(()=>db.members.orderBy('[realmId+email]').toArray());
  return <>
    <h3>Invites</h3>
    <table>
      <tr>
        <th>Accepted</th>
        <th>Email</th>
        <th>Invite</th>
        <th>Invited by</th>
        <th>Date</th>
        <th>Name</th>
        <th>Owner</th>
        <th>Permissions</th>
        <th>RealmId</th>
        <th>Rejected</th>
        <th>Roles</th>
        <th>UserId</th>
      </tr>
      {invites?.map(i => <tr key={i.id}>
        <td>{i.accepted ? '✓' : i.email === currentUser?.email ? <button
          onClick={()=>db.members.update(i.id!, {accepted: new Date()})}
        >Accept</button>
        :'' }</td>
        <td>{i.email}</td>
        <td>{''+i.invite}</td>
        <td>{JSON.stringify(i.invitedBy || null)}</td>
        <td>{i.invitedDate?.toString()}</td>
        <td>{i.name}</td>
        <td>{i.owner}</td>
        <td>{JSON.stringify(i.permissions || null)}</td>
        <td>{i.realmId}</td>
        <td>{i.rejected?.toISOString()}</td>
        <td>{i.roles?.join(',')}</td>
        <td>{i.userId}</td>
        <td>
          {i.email === currentUser?.email && !i.accepted && <button onClick={()=>{
            db.members.update(i.id!, {accepted: new Date()})
          }}>
            Accept
          </button>}
        </td>
      </tr>)}
    </table>
    </>;
}