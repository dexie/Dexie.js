import React from 'react';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { db } from '../db';

export function ResetDatabaseButton() {
  return (
    <button
      className="large-button"
      onClick={async () => {
        await db.delete();
        window.location.reload();
      }}
    >
      <FontAwesomeIcon icon={faDatabase} /> Factory reset client
    </button>
  );
}
