import type { BaseProps } from '../_base/baseComponent';
import type { EventObject, weekStartsOnEnum } from '@douyinfe/semi-foundation/calendar/foundation';
import { strings } from '@douyinfe/semi-foundation/calendar/constants';
import type { ArrayElement } from '../_base/base';

export interface CalendarProps extends /* @vue-ignore */ BaseProps {
    displayValue?: Date;
    range?: Date[];
    header?: any;
    events?: EventObject[];
    mode?: ArrayElement<typeof strings.MODE>;
    showCurrTime?: boolean;
    weekStartsOn?: weekStartsOnEnum;
    scrollTop?: number;
    onClick?: (e: MouseEvent, value: Date) => void;
    onClose?: (e: MouseEvent) => void;
    renderTimeDisplay?: (time: number) => any;
    markWeekend?: boolean;
    minEventHeight?: number;
    width?: number | string;
    height?: number | string;
    renderDateDisplay?: (date: Date) => any;
    dateGridRender?: (dateString?: string, date?: Date) => any;
    allDayEventsRender?: (events: EventObject[]) => any;
}

export type DayCalendarProps = Omit<CalendarProps, 'mode'>;

type DayCalendarPropsKeys = 'events' | 'displayValue' | 'showCurrTime' | 'mode' | 'dateGridRender' | 'minEventHeight';
export interface DayColProps extends Pick<CalendarProps, DayCalendarPropsKeys>, /* @vue-ignore */ BaseProps {
    scrollHeight: number;
    currPos?: number;
    isWeekend?: boolean;
    handleClick: (e: MouseEvent, val: [Date, number, number, number]) => void;
}

export type MonthCalendarProps = Omit<CalendarProps, 'range' | 'showCurrTime' | 'scrollTop' | 'renderTimeDisplay'>;

export type RangeCalendarProps = CalendarProps;

export interface TimeColProps {
    className?: string;
    renderTimeDisplay?: CalendarProps['renderTimeDisplay'];
}

export type WeekCalendarProps = CalendarProps;

export type { EventObject } from '@douyinfe/semi-foundation/calendar/foundation';
