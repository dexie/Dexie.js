import { RotateCcw } from 'lucide-react';
import { db } from '../db';
import { Button } from './ui/button';

export function ResetDatabaseButton() {
  const handleReset = async () => {
    const confirmed = confirm(
      'Are you sure you want to reset the database? This will delete all your local data and reload the app.'
    );
    
    if (confirmed) {
      await db.delete();
      location.reload(); // Reload the page to reset application state hard.
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleReset}
      className="w-full sm:w-auto flex items-center gap-2 border-red-300 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400"
    >
      <RotateCcw className="h-4 w-4" />
      Factory reset client
    </Button>
  );
}
