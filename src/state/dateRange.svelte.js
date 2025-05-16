import {getDaysDiff} from '../utils/date-time.converter.js';
import {FilterParams} from './resultFilters.svelte.js';

export let getDateRangeMap = () => {
    const today = new Date();
    const from = new Date(FilterParams.from);
    const to = new Date(FilterParams.to);

    today.setHours(0, 0, 0, 0);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const diff = getDaysDiff(from, to);
    const datesList = [to];

    for (let i = 1; i <= diff; i++) {
        const day = new Date();

        day.setDate(to.getDate() - i);
        day.setHours(0, 0, 0, 0);
        datesList.push(day);
    }

    return datesList.map((date, i) => {
        let name = '';

        switch (today.getTime() - date.getTime()) {
            case 0:
                name = 'Today';
                break;
            case 86400000:
                name = 'Yesterday';
                break
            default:
                name = new Intl.DateTimeFormat('en-US', {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }).format(date);
                break
        }

        return {
            name,
            date: new Intl.DateTimeFormat('en-CA').format(date),
            isActive: i === 0
        }
    })
}