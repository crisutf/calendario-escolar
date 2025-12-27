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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: { type: "spring", damping: 25, stiffness: 300 }
                        }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto z-50 w-full max-w-md h-fit glass rounded-[2rem] shadow-2xl overflow-hidden border border-white/50"
                    >
                        <div className="p-6 relative overflow-hidden">
                            {/* Decorative background blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-800 capitalize tracking-tight">
                                        {format(date, 'EEEE d', { locale: es })}
                                    </h3>
                                    <p className="text-slate-500 capitalize text-lg">
                                        {format(date, 'MMMM yyyy', { locale: es })}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/50 hover:bg-white rounded-full transition-all hover:rotate-90 text-slate-500 hover:text-red-500 shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                {dayEvents.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <CalendarIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p>No hay eventos programados</p>
                                    </div>
                                ) : (
                                    dayEvents.map((event, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={cn(
                                                "p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02]",
                                                event.type === 'exam' ? "bg-red-50/50 border-red-100 hover:bg-red-50 hover:border-red-200" :
                                                    event.type === 'holiday' ? "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200" :
                                                        "bg-blue-50/50 border-blue-100 hover:bg-blue-50 hover:border-blue-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-3 h-3 rounded-full shadow-sm ring-2 ring-white",
                                                event.type === 'exam' ? "bg-red-500" :
                                                    event.type === 'holiday' ? "bg-emerald-500" :
                                                        "bg-blue-500"
                                            )} />

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-slate-800 truncate text-sm sm:text-base">
                                                    {event.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                                                    {event.type === 'exam' ? 'Examen' : event.type === 'holiday' ? 'Festivo' : 'Evento'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
                                Los eventos se actualizan automáticamente desde el servidor.
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
