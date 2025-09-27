import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders todo app without crashing', () => {
    render(<App />);
    // Test that the navbar and app title renders
    const element = screen.getByText('Dexie Cloud ToDo App');
    expect(element).toBeTruthy();
  });
});
