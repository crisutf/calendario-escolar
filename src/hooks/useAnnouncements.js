import { useCalendar } from './useCalendar';

export const useAnnouncements = () => {
  const { announcements } = useCalendar();
  return announcements;
};
