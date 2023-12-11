import React from 'react';
import { TodoLists } from './components/TodoLists';
import { AddTodoList } from './components/AddTodoList';
import { ResetDatabaseButton } from './components/ResetDatabaseButton';
import { NavBar } from './components/navbar/NavBar';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Invites } from './components/access-control/Invites';
import { useObservable } from 'dexie-react-hooks';
import { db } from './db';
import { type UserLogin } from 'dexie-cloud-addon';

function App() {
  return (
    <div>
      <NavBar />
      <LicenseAdvertiseExample />
      <Invites />
      <TodoLists />
      <AddTodoList />
      <ResetDatabaseButton />
    </div>
  );
}

function LicenseAdvertiseExample() {
  const currentUser = useObservable(db.cloud.currentUser);
  if (!currentUser) return null; // Information about current user not available yet.
  const { license } = currentUser;
  if (!license) return null; // No license information available yet.

  if (
    license.status === 'ok' &&
    license.validUntil === undefined &&
    license.evalDaysLeft === undefined
  ) {
    // No license limits. Don't show any warning.
    return null;
  }

  if (license.status !== 'ok') {
    // User license has expired or is invalid.
    return (
      <div>
        <p>No valid license. You are in offline mode until a valid license is purchased.</p>
        <p>
          Click <a href="https://example.com">here</a> to purchase license.
        </p>
        <p>
          Click <a href="#" onClick={(ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
            deleteUserAccount(currentUser);
          }}>here</a> to delete your account on the server completely along all private data stored (any data shared with others will not be deleted)
        </p>
      </div>
    );
  }

  let licenseExpiresInDays = license.evalDaysLeft; // Might be undefined.
  if (licenseExpiresInDays === undefined) {
    // Using Absolute expiration date on eval or production license
    const validUntil = license.validUntil?.getTime() ?? Infinity;
    licenseExpiresInDays = Math.round(
      (validUntil! - Date.now()) / (24 * 60 * 60 * 1000)
    );
  }

  if (licenseExpiresInDays < 7) {
    return (
      <div>
        <p>License expires in {licenseExpiresInDays} days.</p>
        <p>
          Click <a href="https://example.com">here</a> to purchase a production
          license.
        </p>
      </div>
    );
  }

  // Enough time left. Don't show any warning.
  return null;
}

async function deleteUserAccount(user: UserLogin) {
  if (!user?.userId) return; // Safety check
  const confirmed = confirm(`Are you sure you want to delete your user completely along all stored data for ${user.userId}? Private data will be deleted. Shared data will not be deleted. This action cannot be undone.`);
  if (!confirmed) return;
  await fetch(`${db.cloud.options?.databaseUrl}/users/${user.userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
  await db.cloud.logout({force: true});
}

export default App;
