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

export function getFirstName(fullName: string) {
  return fullName.split(' ')[0];
}

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
