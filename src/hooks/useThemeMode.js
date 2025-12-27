import { useMemo } from 'react';
import { isSameMonth } from 'date-fns';

export function useThemeMode(currentDate, events) {
    const theme = useMemo(() => {
        const currentMonthEvents = events.filter(event =>
            isSameMonth(event.date, currentDate)
        );

        // 1. Check for Stress Mode (More than 3 exams in the month)
        const examCount = currentMonthEvents.filter(e => e.type === 'exam').length;
        if (examCount > 3) {
            return 'stress';
        }

        // 2. Check for Holiday Mode (Specific holidays in the month)
        const monthIndex = currentDate.getMonth(); // 0-11

        // December (11) or January (0) -> Winter/Holiday
        if (monthIndex === 11 || monthIndex === 0) {
            return 'holiday';
        }

        // 3. Check for Aggressive Mode (End of Term: June, December, March)
        if (monthIndex === 5 || monthIndex === 2) {
            return 'aggressive';
        }

        // 4. Default Calm Mode
        return 'calm';

    }, [currentDate, events]);

    return theme;
}
