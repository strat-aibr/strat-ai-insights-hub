
import { format, sub, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

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
export function calculatePreviousPeriod(from?: Date, to?: Date): { previousFrom: Date; previousTo: Date } {
  if (!from || !to) {
    const today = new Date();
    const lastMonth = sub(today, { days: 30 });
    from = lastMonth;
    to = today;
  }
  
  // Calculate the duration of the current period in milliseconds
  const periodDuration = to.getTime() - from.getTime();
  
  // Calculate the start and end dates of the previous period
  const previousTo = new Date(from.getTime() - 1); // One millisecond before the start of the current period
  const previousFrom = new Date(previousTo.getTime() - periodDuration); // Same duration before the previous end
  
  return { previousFrom, previousTo };
}

// Add the getDefaultDateRange function
export function getDefaultDateRange() {
  const today = new Date();
  const lastMonth = sub(today, { days: 30 });
  
  return {
    from: lastMonth,
    to: today
  };
}

// Add predefined date ranges similar to Meta Ads
export const predefinedDateRanges = [
  {
    label: "Hoje",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    }
  },
  {
    label: "Ontem",
    getValue: () => {
      const yesterday = sub(new Date(), { days: 1 });
      return { from: yesterday, to: yesterday };
    }
  },
  {
    label: "Últimos 7 dias",
    getValue: () => {
      const today = new Date();
      const last7Days = sub(today, { days: 6 });
      return { from: last7Days, to: today };
    }
  },
  {
    label: "Últimos 14 dias",
    getValue: () => {
      const today = new Date();
      const last14Days = sub(today, { days: 13 });
      return { from: last14Days, to: today };
    }
  },
  {
    label: "Últimos 28 dias",
    getValue: () => {
      const today = new Date();
      const last28Days = sub(today, { days: 27 });
      return { from: last28Days, to: today };
    }
  },
  {
    label: "Últimos 30 dias",
    getValue: () => {
      const today = new Date();
      const last30Days = sub(today, { days: 29 });
      return { from: last30Days, to: today };
    }
  },
  {
    label: "Esta semana",
    getValue: () => {
      const today = new Date();
      const startWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday as first day
      return { from: startWeek, to: today };
    }
  },
  {
    label: "Semana passada",
    getValue: () => {
      const today = new Date();
      const startLastWeek = sub(startOfWeek(today, { weekStartsOn: 1 }), { weeks: 1 });
      const endLastWeek = sub(endOfWeek(today, { weekStartsOn: 1 }), { weeks: 1 });
      return { from: startLastWeek, to: endLastWeek };
    }
  },
  {
    label: "Este mês",
    getValue: () => {
      const today = new Date();
      const startMonth = startOfMonth(today);
      return { from: startMonth, to: today };
    }
  },
  {
    label: "Mês passado",
    getValue: () => {
      const today = new Date();
      const startLastMonth = startOfMonth(sub(today, { months: 1 }));
      const endLastMonth = endOfMonth(sub(today, { months: 1 }));
      return { from: startLastMonth, to: endLastMonth };
    }
  },
  {
    label: "Máximo",
    getValue: () => {
      const today = new Date();
      const start = new Date(2020, 0, 1); // Set a far past date
      return { from: start, to: today };
    }
  },
  {
    label: "Personalizado",
    getValue: () => getDefaultDateRange()
  }
];
