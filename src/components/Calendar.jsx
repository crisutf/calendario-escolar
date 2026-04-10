import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendar } from '../hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { EventModal } from './EventModal';
import { useThemeMode } from '../hooks/useThemeMode';

import { groupEventsByDate } from '../utils/eventUtils';

export function Calendar() {
    const { currentDate, events } = useCalendar();
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const theme = useThemeMode(currentDate, events);

    // Optimize: Group events by date once when events change
    const eventsByDate = React.useMemo(() => groupEventsByDate(events), [events]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const handleDayClick = React.useCallback((date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = React.useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Dynamic Theme Classes (Refined for Academic style)
    const themeEffects = {
        calm: 'shadow-slate-200/50 border-slate-200/60',
        stress: 'shadow-rose-100/50 border-rose-200/60',
        aggressive: 'shadow-amber-100/50 border-amber-200/60',
        holiday: 'shadow-green-100/50 border-green-200/60',
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 lg:p-8 transition-all duration-500 ease-in-out">
            <div className={`
                bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 relative z-10
                border ${themeEffects[theme] || themeEffects.calm} dark:border-slate-800
                animate-fade-in shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
            `}>
                <CalendarHeader />

                {/* Weekday headers - Professional Minimalist */}
                <div className="grid grid-cols-7 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {weekDays.map((day, i) => (
                        <div
                            key={day}
                            className="py-4 text-center text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] animate-slide-in"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800 gap-[1px]">
                    {days.map((day, idx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        return (
                            <DayCell
                                key={idx}
                                date={day}
                                currentMonth={currentDate}
                                dayEvents={eventsByDate[dateKey] || []}
                                onClick={handleDayClick}
                            />
                        );
                    })}
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                date={selectedDate}
                events={events}
            />
        </div>
    );
}
