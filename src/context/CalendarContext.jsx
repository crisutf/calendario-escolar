import React, { createContext, useContext, useState, useMemo } from 'react';
import { addMonths, subMonths, startOfToday, parseISO } from 'date-fns';
import eventsData from '../data/events.json';

const CalendarContext = createContext();

export function CalendarProvider({ children }) {
    const [currentDate, setCurrentDate] = useState(startOfToday());

    // Parse dates from JSON once
    const events = useMemo(() => {
        return eventsData.map(event => ({
            ...event,
            date: parseISO(event.date)
        }));
    }, []);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(startOfToday());

    return (
        <CalendarContext.Provider value={{ currentDate, events, nextMonth, prevMonth, goToToday }}>
            {children}
        </CalendarContext.Provider>
    );
}

export const useCalendar = () => useContext(CalendarContext);
