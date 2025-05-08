import { format, sub } from 'date-fns';

export function formatDate(date: Date) {
  return format(date, 'dd/MM/yyyy');
}

export function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function formatDateForAPI(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function subtractDays(date: Date, days: number) {
  return sub(date, { days });
}

// Add this function to calculate the previous period for comparison
export function calculatePreviousPeriod(from: Date, to: Date): { previousFrom: Date; previousTo: Date } {
  // Calculate the duration of the current period in milliseconds
  const periodDuration = to.getTime() - from.getTime();
  
  // Calculate the start and end dates of the previous period
  const previousTo = new Date(from.getTime() - 1); // One millisecond before the start of the current period
  const previousFrom = new Date(previousTo.getTime() - periodDuration); // Same duration before the previous end
  
  return { previousFrom, previousTo };
}
