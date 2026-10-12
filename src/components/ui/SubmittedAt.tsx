import { formatSubmitted } from '@/lib/utils';

interface SubmittedAtProps {
  at?: string | null;
  className?: string;
}

export function SubmittedAt({ at, className = 'mt-1 block text-xs text-gray-500' }: SubmittedAtProps) {
  if (!at) return null;
  const label = formatSubmitted(at);
  if (!label) return null;

  return (
    <time dateTime={at} className={className}>
      {label}
    </time>
  );
}
