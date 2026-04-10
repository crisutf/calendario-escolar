import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendar } from '../hooks/useCalendar';

export function CalendarHeader() {
    const { currentDate, nextMonth, prevMonth, goToToday } = useCalendar();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 gap-6 sm:gap-0 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-4 sm:gap-10 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex flex-col">
                    <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white capitalize tracking-tighter transition-all duration-300">
                        {format(currentDate, 'MMMM', { locale: es })}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500 font-bold tracking-[0.3em]">
                            {format(currentDate, 'yyyy', { locale: es })}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                            Vista Mensual
                        </span>
                    </div>
                </div>

                <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                    <button
                        onClick={prevMonth}
                        className="p-2 sm:p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        aria-label="Mes anterior"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <button
                        onClick={nextMonth}
                        className="p-2 sm:p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        aria-label="Mes siguiente"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                    onClick={goToToday}
                    className="
                        flex-1 sm:flex-none
                        px-8 py-3.5
                        bg-slate-900 dark:bg-white 
                        hover:bg-slate-800 dark:hover:bg-slate-100
                        text-xs font-black uppercase tracking-[0.2em]
                        text-white dark:text-slate-900
                        rounded-xl
                        shadow-lg shadow-slate-200 dark:shadow-none
                        transition-all hover:-translate-y-0.5 active:translate-y-0
                    "
                >
                    Hoy
                </button>
            </div>
        </div>
    );
}
