import React from 'react';
import {
  Navbar,
  NavDropdown,
  Button,
  NavLink,
} from 'react-bootstrap';
import { useObservable } from 'react-use';
import { db, resetDatabase } from '../../db';
import { SyncStatusIcon } from './SyncStatusIcon';
import './NavBar.css';
import importData from '../../data/importfile.json';
import { handleError } from '../../helpers/handleError';

export function NavBar() {
  const currentUser = useObservable(db.cloud.currentUser);
  return (
    <Navbar
      fixed="top"
      sticky="top"
      collapseOnSelect
      expand="lg"
      bg="dark"
      variant="dark"
    >
      <Navbar.Brand>Dexie Cloud ToDo App</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Text className="d-inline-flex d-lg-none status-icons-collapsed">
        <SyncStatusIcon />
      </Navbar.Text>
      <Navbar.Collapse
        id="responsive-navbar-nav"
        className="justify-content-end"
      >
        {currentUser?.isLoggedIn ? (
          <>
            <Navbar.Text className="d-none d-lg-inline-flex status-icons-not-collapsed">
              <SyncStatusIcon />
            </Navbar.Text>
            <NavDropdown title={currentUser.name} id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => resetDatabase()}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </>
        ) : (
          <NavDropdown id="basic-nav-dropdown" title="Sign in or create your account">
            <NavDropdown.Header>Sign in a demo user</NavDropdown.Header>
            <>
              {Object.keys(importData.demoUsers).map((email) => (
                <NavDropdown.Item key={email}>
                  <NavLink
                    onClick={handleError(() =>
                      db.cloud.login({ grant_type: 'demo', email })
                    )}
                  >
                    {email}
                  </NavLink>
                </NavDropdown.Item>
              ))}
            </>
            <NavDropdown.Divider />
            <NavDropdown.Header>Sign in real user</NavDropdown.Header>
            <NavDropdown.Item>
              <Button onClick={handleError(() => db.cloud.login())}>
                Sign in / sign up yourself
              </Button>
            </NavDropdown.Item>
          </NavDropdown>
        )}
      </Navbar.Collapse>
      {/*<div style={{position: "absolute", top: 0, right: 10}}>
            <SyncStatusIcon />
          </div>*/}
    </Navbar>
  );
}
