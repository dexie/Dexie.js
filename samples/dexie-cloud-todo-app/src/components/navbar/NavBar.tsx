import { useState } from 'react';
import { Menu, ChevronDown, User, LogOut } from 'lucide-react';
import { useObservable } from 'react-use';
import { db } from '../../db';
import { SyncStatusIcon } from './SyncStatusIcon';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import demoUsersJson from '../../data/demoUsers.json';
import { handleError } from '../../helpers/handleError';
import { logout } from '../../db/logout';

export function NavBar() {
  const currentUser = useObservable(db.cloud.currentUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">
              Dexie Cloud ToDo App
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <SyncStatusIcon className="h-5 w-5" />
            {currentUser?.isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {currentUser.name}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" className="flex items-center gap-2">
                    Sign in or create account
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sign in a demo user</DropdownMenuLabel>
                  {Object.keys(demoUsersJson.demoUsers).map((email) => (
                    <DropdownMenuItem
                      key={email}
                      onClick={handleError(() =>
                        db.cloud.login({ grant_type: 'demo', email })
                      )}
                    >
                      {email}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sign in real user</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={handleError(() => db.cloud.login())}
                  >
                    Sign in / sign up yourself
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <SyncStatusIcon className="h-5 w-5" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {currentUser?.isLoggedIn ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Signed in as {currentUser.name}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                    Sign in a demo user
                  </div>
                  {Object.keys(demoUsersJson.demoUsers).map((email) => (
                    <Button
                      key={email}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleError(async () => {
                        await db.cloud.login({ grant_type: 'demo', email });
                        setIsMenuOpen(false);
                      })}
                    >
                      {email}
                    </Button>
                  ))}
                  <div className="border-t border-border my-2"></div>
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                    Sign in real user
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleError(async () => {
                      await db.cloud.login();
                      setIsMenuOpen(false);
                    })}
                  >
                    Sign in / sign up yourself
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
