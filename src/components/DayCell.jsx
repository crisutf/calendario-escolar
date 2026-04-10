import React, { memo } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '../lib/utils';
import { getHolidayTheme } from '../utils/holidayThemes';

export const DayCell = memo(function DayCell({ date, currentMonth, dayEvents = [], onClick }) {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isDayToday = isToday(date);

    // Limit visible events based on screen size (simplified for now, using dots on mobile)
    const MAX_VISIBLE_EVENTS_DESKTOP = 3;
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS_DESKTOP);
    const hiddenCount = dayEvents.length - MAX_VISIBLE_EVENTS_DESKTOP;

    if (!isCurrentMonth) return <div className="min-h-[5rem] sm:min-h-[9rem] border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20" />;

    return (
        <div
            onClick={() => onClick(date)}
            className={cn(
                "min-h-[5rem] sm:min-h-[10rem] p-1.5 sm:p-3 transition-all duration-200 cursor-pointer relative group bg-white dark:bg-slate-900",
                "border-b border-r border-slate-100 dark:border-slate-800",
                "hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:z-10",
                isDayToday && "bg-slate-50 dark:bg-slate-800/30"
            )}
        >
            <div className="flex justify-between items-start mb-1 sm:mb-2">
                <span className={cn(
                    "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-black transition-all duration-300",
                    isDayToday
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
                )}>
                    {format(date, 'd')}
                </span>
            </div>

            {/* Desktop Events - Minimalist Labels */}
            <div className="hidden sm:block space-y-1">
                {visibleEvents.map((event, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "text-[9px] px-2 py-1.5 rounded-md truncate transition-all border",
                            event.type === 'exam'
                                ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50"
                                : event.type === 'holiday'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50"
                        )}
                    >
                        <span className="font-bold tracking-tight">{event.title}</span>
                    </div>
                ))}
                {hiddenCount > 0 && (
                    <div className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest pl-1 pt-0.5">
                        + {hiddenCount}
                    </div>
                )}
            </div>

            {/* Mobile Events - Discrete Bars */}
            <div className="flex sm:hidden flex-col gap-0.5 mt-1">
                {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "h-1 w-full rounded-full",
                            event.type === 'exam' ? "bg-rose-500" :
                                event.type === 'holiday' ? "bg-emerald-500" : "bg-indigo-500"
                        )}
                    />
                ))}
            </div>
        </div>
    );
});
