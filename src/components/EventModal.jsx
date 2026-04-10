import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function EventModal({ isOpen, onClose, date, events }) {
    if (!isOpen || !date) return null;

    const dayEvents = events.filter(e =>
        format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-all duration-300"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: { type: "spring", damping: 30, stiffness: 400 }
                        }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className={cn(
                            "fixed z-50 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800",
                            "inset-x-0 bottom-0 top-auto sm:inset-0 sm:m-auto sm:w-full sm:max-w-lg sm:h-fit rounded-t-[2.5rem] sm:rounded-[2rem]"
                        )}
                    >
                        <div className="p-8 sm:p-10 relative">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-1 w-6 bg-slate-900 dark:bg-white rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                            Detalles de la Agenda
                                        </span>
                                    </div>
                                    <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white capitalize tracking-tighter">
                                        {format(date, 'EEEE d', { locale: es })}
                                    </h3>
                                    <p className="text-slate-400 dark:text-slate-500 capitalize text-lg font-bold tracking-tight mt-1">
                                        {format(date, 'MMMM yyyy', { locale: es })}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-4 max-h-[50vh] sm:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {dayEvents.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                                        <div className="p-6 bg-white dark:bg-slate-900 rounded-full mb-6 shadow-sm">
                                            <CalendarIcon className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-300 dark:text-slate-600 tracking-tight">Sin actividades programadas</p>
                                    </div>
                                ) : (
                                    dayEvents.map((event, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={cn(
                                                "p-6 rounded-3xl border flex items-center gap-6 transition-all hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 shadow-sm",
                                                event.type === 'exam' ? "border-rose-100 dark:border-rose-900/30" :
                                                    event.type === 'holiday' ? "border-emerald-100 dark:border-emerald-900/30" :
                                                        "border-slate-100 dark:border-slate-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                event.type === 'exam' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" :
                                                    event.type === 'holiday' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                                            )}>
                                                <CalendarIcon className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md",
                                                        event.type === 'exam' ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" :
                                                            event.type === 'holiday' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                                                                "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                    )}>
                                                        {event.type === 'exam' ? 'Examen' : event.type === 'holiday' ? 'Festivo' : 'Evento'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xl tracking-tight">
                                                    {event.title}
                                                </h4>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
                                <span>Calendario Digital hecho por Crisutf</span>
                                <span>Ref: {format(date, 'ddMMyy')}</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
