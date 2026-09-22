import { useCalendar } from './useCalendar';

export const useMaintenance = () => {
  const { maintenance } = useCalendar();
  return maintenance;
};
