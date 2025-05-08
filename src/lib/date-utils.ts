
import { differenceInDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function getDefaultDateRange() {
  const today = new Date();
  const from = subDays(today, 30);
  return { from, to: today };
}

export function calculatePreviousPeriod(from: Date, to: Date) {
  const days = differenceInDays(to, from) + 1;
  const prevFrom = subDays(from, days);
  const prevTo = subDays(from, 1);
  return { from: prevFrom, to: prevTo };
}

export function formatDateForAPI(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
