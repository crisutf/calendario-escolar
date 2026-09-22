import { createContext } from 'react';
import { startOfToday } from 'date-fns';

export const CalendarContext = createContext({
  events: [],
  currentDate: startOfToday(),
  nextMonth: () => {},
  prevMonth: () => {},
  goToToday: () => {},
  maintenance: { mode: false, message: '' },
  announcements: [],
  refetch: async () => {},
  loading: false,
  error: null,
});
