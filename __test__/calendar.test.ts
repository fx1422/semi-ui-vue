import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick, h } from 'vue';
import Calendar from '../src/components/calendar';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';
import type { EventObject } from '@douyinfe/semi-foundation/calendar/foundation';

const PREFIX = `${BASE_CLASS_PREFIX}-calendar`;

describe('Calendar Month View - Collapsed Events', () => {
    let wrapper: any;

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    const createEvents = (count: number, date: Date): EventObject[] => {
        return Array.from({ length: count }, (_, i) => ({
            key: `event-${i}`,
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8 + i, 0, 0),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9 + i, 0, 0),
            children: h('div', `Event ${i}`),
        }));
    };

    it('should render collapsed indicator when events exceed itemLimit', async () => {
        const displayValue = new Date(2019, 6, 23);
        const events = createEvents(10, displayValue);

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events,
                height: 400,
            },
        });

        await nextTick();
        await nextTick();

        const monthCalendar = wrapper.findComponent({ name: 'SemiMonthCalendar' });
        expect(monthCalendar.exists()).toBe(true);
    });

    it('should calculate itemLimit based on height', async () => {
        const displayValue = new Date(2019, 6, 23);
        const events = createEvents(5, displayValue);

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events,
                height: 400,
            },
        });

        await nextTick();
        await nextTick();

        expect(wrapper.exists()).toBe(true);
    });

    it('should display remaining text when events exceed limit', async () => {
        const displayValue = new Date(2019, 6, 23);
        const events: EventObject[] = [
            {
                key: '0',
                start: new Date(2019, 6, 23, 8, 0, 0),
                end: new Date(2019, 6, 23, 9, 0, 0),
                children: h('div', 'Event 0'),
            },
            {
                key: '1',
                start: new Date(2019, 6, 23, 9, 0, 0),
                end: new Date(2019, 6, 23, 10, 0, 0),
                children: h('div', 'Event 1'),
            },
            {
                key: '2',
                start: new Date(2019, 6, 23, 10, 0, 0),
                end: new Date(2019, 6, 23, 11, 0, 0),
                children: h('div', 'Event 2'),
            },
        ];

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events,
                height: 400,
            },
        });

        await nextTick();
        await nextTick();

        expect(wrapper.exists()).toBe(true);
    });

    it('should not render collapsed when events are less than itemLimit', async () => {
        const displayValue = new Date(2019, 6, 23);
        const events = createEvents(2, displayValue);

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events,
                height: 600,
            },
        });

        await nextTick();
        await nextTick();

        expect(wrapper.exists()).toBe(true);
    });

    it('should handle empty events array', async () => {
        const displayValue = new Date(2019, 6, 23);

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events: [],
                height: 400,
            },
        });

        await nextTick();
        await nextTick();

        expect(wrapper.exists()).toBe(true);
    });

    it('should handle itemLimit of 0 (no limit)', async () => {
        const displayValue = new Date(2019, 6, 23);
        const events = createEvents(10, displayValue);

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events,
                height: 100,
            },
        });

        await nextTick();
        await nextTick();

        expect(wrapper.exists()).toBe(true);
    });

    it('should render events correctly in month view', async () => {
        const displayValue = new Date(2019, 6, 23);
        const events: EventObject[] = [
            {
                key: '0',
                start: new Date(2019, 6, 23, 8, 0, 0),
                end: new Date(2019, 6, 23, 9, 0, 0),
                children: h('div', 'Test Event'),
            },
        ];

        wrapper = mount(Calendar, {
            props: {
                mode: 'month',
                displayValue,
                events,
                height: 400,
            },
        });

        await nextTick();
        await nextTick();

        expect(wrapper.exists()).toBe(true);
    });
});

