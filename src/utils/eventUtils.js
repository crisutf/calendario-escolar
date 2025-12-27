import { format } from 'date-fns';

/**
 * Groups events by their date string (YYYY-MM-DD).
 * This allows O(1) access to events for a specific day,
 * avoiding the need to filter the entire event list for every cell.
 * 
 * @param {Array} events - List of event objects
 * @returns {Object} - Object where keys are date strings and values are arrays of events
 */
export const groupEventsByDate = (events) => {
    const groups = {};

    events.forEach(event => {
        if (!event.date) return;

        // Ensure we work with a Date object
        const dateObj = event.date instanceof Date ? event.date : new Date(event.date);

        // Use a consistent format for keys
        const dateKey = format(dateObj, 'yyyy-MM-dd');

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push(event);
    });

    return groups;
};
