import { format } from 'date-fns';

export const holidayThemes = {
    // Reyes Magos (Jan 6)
    '01-06': {
        name: 'Día de Reyes',
        gradient: 'from-yellow-200 via-amber-300 to-yellow-500',
        text: 'text-amber-900',
        border: 'border-amber-200',
        icon: '👑'
    },
    // San Valentín (Feb 14)
    '02-14': {
        name: 'San Valentín',
        gradient: 'from-pink-200 via-rose-300 to-red-400',
        text: 'text-rose-900',
        border: 'border-rose-200',
        icon: '❤️'
    },
    // Día del Trabajador (May 1)
    '05-01': {
        name: 'Día del Trabajador',
        gradient: 'from-slate-200 via-gray-300 to-zinc-400',
        text: 'text-zinc-900',
        border: 'border-zinc-300',
        icon: '🛠️'
    },
    // Halloween (Oct 31)
    '10-31': {
        name: 'Halloween',
        gradient: 'from-orange-400 via-purple-600 to-slate-900',
        text: 'text-purple-100',
        border: 'border-purple-500',
        icon: '🎃'
    },
    // Navidad (Dec 25)
    '12-25': {
        name: 'Navidad',
        gradient: 'from-green-100 via-red-100 to-green-200',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: '🎄'
    },
    // Año Nuevo (Jan 1)
    '01-01': {
        name: 'Año Nuevo',
        gradient: 'from-blue-100 via-purple-100 to-indigo-200',
        text: 'text-indigo-900',
        border: 'border-indigo-200',
        icon: '✨'
    },
    // Día de la Constitución (Dec 6)
    '12-06': {
        name: 'Día de la Constitución',
        gradient: 'from-red-100 via-yellow-100 to-red-100',
        text: 'text-red-900',
        border: 'border-yellow-300',
        icon: '🇪🇸'
    }
};

export function getHolidayTheme(date) {
    const key = format(date, 'MM-dd');
    return holidayThemes[key] || null;
}
