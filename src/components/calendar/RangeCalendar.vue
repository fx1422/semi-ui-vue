<template>
    <LocaleConsumer component-name="Calendar">
        <template #default="{ locale, dateFnsLocale }">
            <RangeCalendarInner
                :locale="locale"
                :date-fns-locale="dateFnsLocale"
                :week-cls="weekCls"
                :week-style="weekStyle"
                :dom-ref="domRef"
                :get-data-attr="getDataAttr"
                :props="props"
                :range-days="rangeDays"
                :range-month="rangeMonth"
                :all-day-events="allDayEvents"
                :all-day-style="allDayStyle"
                :get-header-day-cls="getHeaderDayCls"
                :get-skeleton-cls="getSkeletonCls"
                :get-all-day-event-style="getAllDayEventStyle"
                :get-day-events="getDayEvents"
                :handle-click="handleClick"
                :init-range-data="initRangeData"
            >
                <template v-if="$slots.header" #header>
                    <slot name="header" />
                </template>
                <template v-if="$slots.dateDisplay" #dateDisplay="slotProps">
                    <slot name="dateDisplay" v-bind="slotProps" />
                </template>
                <template v-if="$slots.allDayEvents" #allDayEvents="slotProps">
                    <slot name="allDayEvents" v-bind="slotProps" />
                </template>
                <template v-if="$slots.timeDisplay" #timeDisplay="slotProps">
                    <slot name="timeDisplay" v-bind="slotProps" />
                </template>
                <template v-if="$slots.dateGrid" #dateGrid="slotProps">
                    <slot name="dateGrid" v-bind="slotProps" />
                </template>
                <template v-if="$slots.event" #event="slotProps">
                    <slot name="event" v-bind="slotProps" />
                </template>
            </RangeCalendarInner>
        </template>
    </LocaleConsumer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, useAttrs } from 'vue';
import classnames from 'classnames';
import { isEqual } from 'lodash-es';
import CalendarFoundation, {
    CalendarAdapter,
    ParsedEvents,
    ParsedEventsType,
    RangeData,
} from '@douyinfe/semi-foundation/calendar/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import { calcRowHeight } from '@douyinfe/semi-foundation/calendar/eventUtil';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import RangeCalendarInner from './RangeCalendarInner.vue';
import { useBaseComponent, useFoundation } from '../_utils';
import type { RangeCalendarProps } from './interface';

const attrs = useAttrs();

defineOptions({
    name: 'SemiRangeCalendar',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<RangeCalendarProps>(), {
    events: () => [],
    mode: 'range',
});

const prefixCls = `${cssClasses.PREFIX}-week`;
const allDayCls = `${cssClasses.PREFIX}-all-day`;

const toPercent = (num: number) => {
    const res = num < 1 ? num * 100 : 100;
    return `${res}%`;
};

const domRef = ref<HTMLDivElement>();

const rangeData = ref<RangeData | null>(null);

const state = ref({
    parsedEvents: {
        day: new Map(),
        allDay: new Map(),
    } as ParsedEvents,
    cachedKeys: [] as string[],
});

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const adapter: CalendarAdapter<RangeCalendarProps, typeof state.value> = {
    ...baseAdapter,
    setRangeData: (data: RangeData) => {
        rangeData.value = data;
    },
    getRangeData: () => rangeData.value,
    setParsedEvents: (parsedEvents: ParsedEventsType) => {
        state.value.parsedEvents = parsedEvents as ParsedEvents;
    },
    cacheEventKeys: (cachedKeys: string[]) => {
        state.value.cachedKeys = cachedKeys;
    },
};

const { foundation } = useFoundation(CalendarFoundation, adapter);

const weekCls = computed(() => {
    return classnames(prefixCls, props.className);
});

const weekStyle = computed(() => {
    const style: any = {};
    if (props.height !== undefined && props.height !== null) {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    if (props.width !== undefined && props.width !== null) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    return {
        ...style,
        ...props.style,
        ...(attrs.style as any),
    };
});

const parsedEvents = computed(() => state.value.parsedEvents);

// 使用 computed 缓存数据，避免在模板函数中修改响应式数据
const rangeDays = computed(() => {
    if (!rangeData.value) {
        return [];
    }
    return rangeData.value.week || [];
});

const rangeMonth = computed(() => {
    if (!rangeData.value) {
        return '';
    }
    return rangeData.value.month || '';
});

// 辅助函数：初始化 rangeData（不修改响应式数据）
const initRangeData = (dateFnsLocale: any) => {
    if (!dateFnsLocale || !props.range || props.range.length < 2) {
        return;
    }
    const data = foundation.getRangeData(props.range[0], dateFnsLocale);
    if (data) {
        rangeData.value = data;
    }
};

const allDayEvents = computed(() => {
    if (!parsedEvents.value.allDay || !rangeData.value) {
        return [];
    }
    const parsed = foundation.parseRangeAllDayEvents(parsedEvents.value.allDay);
    if (props.allDayEventsRender) {
        return props.allDayEventsRender(props.events);
    }
    return parsed;
});

const allDayStyle = computed(() => {
    if (props.allDayEventsRender) {
        return null;
    }
    return {
        height: `${calcRowHeight(allDayEvents.value)}em`,
    };
});

const getHeaderDayCls = (day: any) => {
    return classnames({
        [`${cssClasses.PREFIX}-today`]: day.isToday,
        [`${cssClasses.PREFIX}-weekend`]: props.markWeekend && day.isWeekend,
    });
};

const getSkeletonCls = (day: any) => {
    return classnames({
        [`${cssClasses.PREFIX}-weekend`]: props.markWeekend && day.isWeekend,
    });
};

const getAllDayEventStyle = (event: any) => {
    return {
        left: toPercent(event.leftPos || 0),
        width: toPercent(event.width || 0),
        top: `${event.topInd || 0}em`,
    };
};

const getDayEvents = (date: Date) => {
    const dateString = date.toString();
    const events = parsedEvents.value.day;
    if (events.has(dateString)) {
        const dayEvents = events.get(dateString) || [];
        const parsed = foundation.getParseDailyEvents(dayEvents, date);
        return parsed.day;
    }
    return [];
};

const handleClick = (e: MouseEvent, val: [Date, number, number, number]) => {
    if (props.onClick) {
        const value = foundation.formatCbValue(val);
        props.onClick(e, value);
    }
};

onMounted(async () => {
    foundation.init();
    foundation.parseRangeEvents();

    await nextTick();
    if (domRef.value) {
        domRef.value.scrollTop = props.scrollTop ?? 400;
    }
});

watch(
    () => [props.events, props.range],
    async () => {
        const prevEventKeys = state.value.cachedKeys;
        const nowEventKeys = props.events.map((event) => event.key);
        if (!isEqual(prevEventKeys, nowEventKeys)) {
            await nextTick();
            foundation.parseRangeEvents();
        }
    },
    { deep: true }
);
</script>
