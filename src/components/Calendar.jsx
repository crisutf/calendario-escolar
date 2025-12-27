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

    // Dynamic Theme Classes with smoother transitions
    const themeEffects = {
        calm: 'shadow-blue-500/5 border-blue-100/50',
        stress: 'shadow-red-500/10 border-red-100/50',
        aggressive: 'shadow-orange-500/10 border-orange-100/50',
        holiday: 'shadow-emerald-500/10 border-emerald-100/50',
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 transition-all duration-700 ease-in-out">
            <div className={`
                glass rounded-[2.5rem] overflow-hidden transition-all duration-700 relative z-10
                ${themeEffects[theme] || themeEffects.calm}
                dark:bg-slate-800/40 dark:border-white/10
                animate-fade-in
            `}>
                <CalendarHeader />

                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-gray-100/50 dark:border-white/10 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm">
                    {weekDays.map((day, i) => (
                        <div
                            key={day}
                            className="py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-slide-in"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 bg-white/30">
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

            {/* Background decoration */}
            <div className="fixed top-20 left-20 w-96 h-96 bg-purple-200/30 rounded-full blur-[100px] -z-10 animate-float" />
            <div className="fixed bottom-20 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px] -z-10 animate-float" style={{ animationDelay: '2s' }} />
        </div>
    );
}
