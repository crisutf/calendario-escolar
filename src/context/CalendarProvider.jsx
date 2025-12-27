import React, { useState, useEffect } from 'react';
import { addMonths, subMonths, startOfToday, parseISO } from 'date-fns';
import { CalendarContext } from './CalendarContext';

export function CalendarProvider({ children }) {
    const [currentDate, setCurrentDate] = useState(startOfToday());
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch('https://cdn-crisutf.pages.dev/calendario/events.json')
            .then(response => response.json())
            .then(data => {
                const parsedEvents = data.map(event => ({
                    ...event,
                    date: parseISO(event.date)
                }));
                setEvents(parsedEvents);
            })
            .catch(error => console.error('Error fetching events:', error));
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

