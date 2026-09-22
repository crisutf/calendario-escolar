import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addMonths, subMonths, startOfToday, parseISO } from 'date-fns';
import { CalendarContext } from './CalendarContext';
import api from '../lib/api';

export function CalendarProvider({ children }) {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [events, setEvents] = useState([]);
  const [maintenance, setMaintenance] = useState({ mode: false, message: '' });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, announcementsRes] = await Promise.all([
        api.get('/api/events'),
        api.get('/api/announcements'),
      ]);

      const eventsData =
        (eventsRes && Array.isArray(eventsRes.events) ? eventsRes.events : eventsRes?.data) ||
        (Array.isArray(eventsRes) ? eventsRes : []) ||
        [];
      const parsedEvents = Array.isArray(eventsData)
        ? eventsData.map((event) => ({
            ...event,
            date: typeof event.date === 'string' ? parseISO(event.date) : event.date,
          }))
        : [];

      setEvents(parsedEvents);
      setMaintenance(eventsRes?.meta?.maintenance || eventsRes?.maintenance || { mode: false, message: '' });
      const annData =
        (announcementsRes && Array.isArray(announcementsRes.announcements)
          ? announcementsRes.announcements
          : announcementsRes?.data) ||
        (Array.isArray(announcementsRes) ? announcementsRes : []) ||
        [];
      setAnnouncements(Array.isArray(annData) ? annData : []);
    } catch (err) {
      console.warn('Failed to fetch calendar data:', err);
      setEvents([]);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    intervalRef.current = setInterval(() => {
      refetch();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch]);

  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goToToday = () => setCurrentDate(startOfToday());

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        events,
        nextMonth,
        prevMonth,
        goToToday,
        maintenance,
        announcements,
        refetch,
        loading,
        error,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}
