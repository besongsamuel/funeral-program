import { format, parseISO } from 'date-fns';

export function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy \'at\' h:mm a');
  } catch {
    return dateStr;
  }
}

/** Date and time a tribute or story was submitted, in the reader's local time. */
export function formatSubmitted(dateStr: string) {
  try {
    const date = parseISO(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getFirstName(fullName: string) {
  return fullName.split(' ')[0];
}

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
