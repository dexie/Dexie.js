import React from 'react';
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button
} from 'react-bootstrap';
import { useObservable } from 'react-use';
import { db } from '../models/db';

export function NavBar() {
  const currentUser = useObservable(db.cloud.currentUser);
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand>Dexie Cloud ToDo App</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {currentUser?.isLoggedIn ? (
          <Navbar.Text>
            Signed in as: <a>{currentUser.name}</a>
          </Navbar.Text>
        ) : (
          <Button
            onClick={() =>
              db.cloud.login({ grant_type: 'demo', userId: 'foo@demo.local' })
            }
          >
            Login
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
