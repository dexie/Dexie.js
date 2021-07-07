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
              db.cloud.login().catch(error => {
                if (error?.name === "AbortError") {
                  console.warn("User cancelled login dialog");
                } else {
                  console.error("Failed to login", error);
                  alert ("Failed to login: " + error);
                }
              })
            }
          >
            Login
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
