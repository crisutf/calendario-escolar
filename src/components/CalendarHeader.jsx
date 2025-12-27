import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendar } from '../hooks/useCalendar';

export function CalendarHeader() {
    const { currentDate, nextMonth, prevMonth, goToToday } = useCalendar();

    return (
        <div className="flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white capitalize tracking-tight text-glow transition-all duration-300">
                        {format(currentDate, 'MMMM', { locale: es })}
                    </h2>
                    <span className="text-xl text-slate-400 dark:text-slate-500 font-light tracking-widest pl-1">
                        {format(currentDate, 'yyyy', { locale: es })}
                    </span>
                </div>

                <div className="flex gap-2 ml-4">
                    <button
                        onClick={prevMonth}
                        className="p-3 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all hover:scale-110 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:shadow-lg border border-transparent hover:border-white/50 dark:hover:border-white/10"
                        aria-label="Mes anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-3 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all hover:scale-110 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:shadow-lg border border-transparent hover:border-white/50 dark:hover:border-white/10"
                        aria-label="Mes siguiente"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <button
                onClick={goToToday}
                className="
                    px-6 py-2.5 
                    bg-white/40 dark:bg-slate-800/40 hover:bg-white/90 dark:hover:bg-slate-700/90
                    text-sm font-semibold text-slate-700 dark:text-slate-200
                    rounded-2xl 
                    shadow-sm hover:shadow-md 
                    transition-all hover:-translate-y-0.5 active:translate-y-0
                    border border-white/40 dark:border-white/10
                    backdrop-blur-md
                "
            >
                Hoy
            </button>
        </div>
    );
}
