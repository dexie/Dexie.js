import { TodoLists } from './components/TodoLists';
import { AddTodoList } from './components/AddTodoList';
import { ResetDatabaseButton } from './components/ResetDatabaseButton';
import { NavBar } from './components/navbar/NavBar';
import { Invites } from './components/access-control/Invites';
import { useObservable } from 'dexie-react-hooks';
import { db } from './db';
import { type UserLogin } from 'dexie-cloud-addon';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <LicenseAdvertiseExample />
          <Invites />
        </div>
        <TodoLists />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <AddTodoList />
            <ResetDatabaseButton />
          </div>
        </div>
      </main>
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
      <Card className="mb-6 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">License Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            No valid license. You are in offline mode until a valid license is purchased.
          </CardDescription>
          <div className="space-y-2">
            <Button asChild>
              <a href="https://example.com">Purchase License</a>
            </Button>
            <Button 
              variant="destructive" 
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                deleteUserAccount(currentUser);
              }}
            >
              Delete Account & All Data
            </Button>
          </div>
        </CardContent>
      </Card>
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
      <Card className="mb-6 border-yellow-500">
        <CardHeader>
          <CardTitle className="text-yellow-600">License Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            License expires in {licenseExpiresInDays} days.
          </CardDescription>
          <Button asChild>
            <a href="https://example.com">Purchase Production License</a>
          </Button>
        </CardContent>
      </Card>
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
