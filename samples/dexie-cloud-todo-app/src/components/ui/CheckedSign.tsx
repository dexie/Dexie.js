import { cn } from '../../lib/utils';

interface CheckedSignProps {
  className?: string;
}

export function CheckedSign({ className }: CheckedSignProps) {
  return (
    <svg className={cn("w-4 h-4 fill-current", className)} viewBox="0 0 20 20">
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
    </svg>
  );
}