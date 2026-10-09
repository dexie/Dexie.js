import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the navbar dropdown as one accessible button', async () => {
    render(<App />);
    expect(screen.getByText('Dexie Cloud ToDo App')).toBeTruthy();

    const user = userEvent.setup();
    const trigger = screen.getByRole('button', {
      name: /sign in or create account/i
    });
    expect(trigger.querySelector('button')).toBeNull();

    await user.click(trigger);
    expect(screen.getByText('alice@demo.local')).toBeTruthy();
  });
});
