import React, { memo } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '../lib/utils';
import { getHolidayTheme } from '../utils/holidayThemes';

export const DayCell = memo(function DayCell({ date, currentMonth, dayEvents = [], onClick }) {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isDayToday = isToday(date);

    // Limit visible events
    const MAX_VISIBLE_EVENTS = 3;
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const hiddenCount = dayEvents.length - MAX_VISIBLE_EVENTS;

    if (!isCurrentMonth) return <div className="min-h-[9rem] border-b border-r border-gray-100/30 bg-gray-50/20" />;

    return (
        <div
            onClick={() => onClick(date)}
            className={cn(
                "min-h-[9rem] sm:min-h-[10rem] p-3 transition-all duration-300 cursor-pointer relative group",
                "border-b border-r border-white/30",
                "hover:bg-white/60 hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]",
                isDayToday && "bg-indigo-50/30"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300",
                    isDayToday
                        ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-110"
                        : "text-slate-600 group-hover:scale-110 group-hover:bg-white/80 group-hover:shadow-sm"
                )}>
                    {format(date, 'd')}
                </span>
            </div>

            <div className="space-y-1.5">
                {visibleEvents.map((event, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "text-[11px] px-2 py-1 rounded-lg truncate transition-all duration-300 border backdrop-blur-sm",
                            "hover:scale-105 hover:z-10 shadow-sm",
                            event.type === 'exam'
                                ? "bg-red-50/80 text-red-700 border-red-100/50 hover:bg-red-100"
                                : event.type === 'holiday'
                                    ? "bg-emerald-50/80 text-emerald-700 border-emerald-100/50 hover:bg-emerald-100"
                                    : "bg-blue-50/80 text-blue-700 border-blue-100/50 hover:bg-blue-100"
                        )}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                event.type === 'exam' ? "bg-red-500" :
                                    event.type === 'holiday' ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                            <span className="truncate font-medium">{event.title}</span>
                        </div>
                    </div>
                ))}
                {hiddenCount > 0 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        +{hiddenCount} más
                    </div>
                )}
            </div>
        </div>
    );
});
