<template>
    <component :is="calendarComponent" v-bind="calendarProps" :style="$attrs.style">
        <template v-if="$slots.header" #header>
            <slot name="header" />
        </template>
        <template v-if="$slots.dateDisplay" #dateDisplay="slotProps">
            <slot name="dateDisplay" v-bind="slotProps" />
        </template>
        <template v-if="$slots.dateGrid" #dateGrid="slotProps">
            <slot name="dateGrid" v-bind="slotProps" />
        </template>
        <template v-if="$slots.timeDisplay" #timeDisplay="slotProps">
            <slot name="timeDisplay" v-bind="slotProps" />
        </template>
        <template v-if="$slots.allDayEvents" #allDayEvents="slotProps">
            <slot name="allDayEvents" v-bind="slotProps" />
        </template>
        <template v-if="$slots.event" #event="slotProps">
            <slot name="event" v-bind="slotProps" />
        </template>
    </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import DayCalendar from './DayCalendar.vue';
import WeekCalendar from './WeekCalendar.vue';
import MonthCalendar from './MonthCalendar.vue';
import RangeCalendar from './RangeCalendar.vue';
import type { CalendarProps } from './interface';

defineOptions({
    name: 'SemiCalendar',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<CalendarProps>(), {
    events: () => [],
    displayValue: () => new Date(),
    showCurrTime: true,
    mode: 'week',
    markWeekend: false,
    height: 600,
    scrollTop: 400,
    weekStartsOn: 0,
});

const attrs = useAttrs();

const calendarComponent = computed(() => {
    const components = {
        day: DayCalendar,
        week: WeekCalendar,
        month: MonthCalendar,
        range: RangeCalendar,
    };
    return components[props.mode || 'week'];
});

const calendarProps = computed(() => {
    const eventsValue =
        props.events && typeof props.events === 'object' && 'value' in props.events
            ? (props.events as any).value
            : props.events;

    const { mode, ...rest } = props;

    const restWithEvents = {
        ...rest,
        events: eventsValue,
    };

    if (mode === 'month') {
        const { range, showCurrTime, scrollTop, renderTimeDisplay, ...monthProps } = restWithEvents;
        return monthProps;
    } else if (mode === 'day') {
        const { range, ...dayProps } = restWithEvents;
        return dayProps;
    } else if (mode === 'range') {
        return restWithEvents;
    } else {
        return restWithEvents;
    }
});
</script>
