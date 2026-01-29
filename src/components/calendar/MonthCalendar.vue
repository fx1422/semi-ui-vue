<template>
    <LocaleConsumer component-name="Calendar">
        <template #default="{ locale, dateFnsLocale }">
            <MonthCalendarInner
                :key="monthCalendarKey"
                :locale="locale"
                :date-fns-locale="dateFnsLocale"
                :month-cls="monthCls"
                :month-style="monthStyle"
                :dom-ref="domRef"
                :cell-dom-ref="cellDomRef"
                :get-data-attr="getDataAttr"
                :props="props"
                :month-header-days="monthHeaderDays"
                :monthly-weeks="monthlyWeeks"
                :parsed-events="state.parsedEvents"
                :item-limit="state.itemLimit"
                :get-day-cls="getDayCls"
                :get-header-day-cls="getHeaderDayCls"
                :get-day-events="getDayEvents"
                :get-week-display-events="getWeekDisplayEvents"
                :get-event-style="getEventStyle"
                :handle-click="handleClick"
                :init-monthly-data="initMonthlyData"
                :show-card="showCardState"
                :close-card="closeCard"
                :show-card-handler="showCard"
                :get-week-key="getWeekKey"
            >
                <template v-if="$slots.header" #header>
                    <slot name="header" />
                </template>
                <template v-if="$slots.dateDisplay" #dateDisplay="slotProps">
                    <slot name="dateDisplay" v-bind="slotProps" />
                </template>
                <template v-if="$slots.dateGrid" #dateGrid="slotProps">
                    <slot name="dateGrid" v-bind="slotProps" />
                </template>
                <template v-if="$slots.event" #event="slotProps">
                    <slot name="event" v-bind="slotProps" />
                </template>
            </MonthCalendarInner>
        </template>
    </LocaleConsumer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, useAttrs } from 'vue';
import classnames from 'classnames';
import { isEqual } from 'lodash-es';
import CalendarFoundation, {
    CalendarAdapter,
    MonthlyEvent,
    MonthData,
    ParsedEventsType,
} from '@douyinfe/semi-foundation/calendar/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import MonthCalendarInner from './MonthCalendarInner.vue';
import { useBaseComponent, useFoundation } from '../_utils';
import type { MonthCalendarProps } from './interface';

const attrs = useAttrs();

defineOptions({
    name: 'SemiMonthCalendar',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<MonthCalendarProps>(), {
    displayValue: () => new Date(),
    events: () => [],
    mode: 'month',
});

const prefixCls = `${cssClasses.PREFIX}-month`;

const domRef = ref<HTMLDivElement>();
const cellDomRef = ref<HTMLDivElement>();

const monthlyData = ref<MonthData | null>(null);

const state = ref({
    itemLimit: 0,
    showCard: {} as Record<string, [boolean] | [boolean, string]>,
    parsedEvents: {} as MonthlyEvent,
    cachedKeys: [] as string[],
});

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const adapter: CalendarAdapter<MonthCalendarProps, typeof state.value> = {
    ...baseAdapter,
    registerClickOutsideHandler: (_key: string, _cb: () => void) => {
        // 注意：Vue 版本的 Popover 已经处理了点击外部关闭的逻辑
        // 这里保留方法以保持与 Foundation 的兼容性
        // 实际的点击外部关闭由 Popover 组件的 @click-outside 事件处理
        return () => {
            // 清理函数（如果需要）
        };
    },
    unregisterClickOutsideHandler: () => {
        // 清理逻辑
    },
    setMonthlyData: (data: MonthData) => {
        monthlyData.value = data;
    },
    getMonthlyData: () => monthlyData.value,
    notifyClose: (e: any, key: string) => {
        const updates: Record<string, [boolean] | [boolean, string]> = {};
        updates[key] = [false];
        state.value.showCard = { ...state.value.showCard, ...updates };
        if (props.onClose) {
            props.onClose(e);
        }
    },
    openCard: (key: string, spacing: boolean) => {
        const updates: Record<string, [boolean] | [boolean, string]> = {};
        const pos = spacing ? 'leftTopOver' : 'rightTopOver';
        updates[key] = [true, pos];
        state.value.showCard = { ...state.value.showCard, ...updates };
    },
    setParsedEvents: (parsedEvents: ParsedEventsType) => {
        state.value.parsedEvents = parsedEvents as MonthlyEvent;
    },
    setItemLimit: (itemLimit: number) => {
        state.value.itemLimit = itemLimit;
    },
    cacheEventKeys: (cachedKeys: string[]) => {
        state.value.cachedKeys = cachedKeys;
    },
};

const { foundation } = useFoundation(CalendarFoundation, adapter);

const monthCls = computed(() => {
    return classnames(prefixCls, props.className);
});

const monthStyle = computed(() => {
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

const displayValue = computed(() => props.displayValue || new Date());

// 使用 computed 缓存数据，避免在模板函数中修改响应式数据
const monthHeaderDays = computed(() => {
    if (!monthlyData.value || !monthlyData.value[0]) {
        return [];
    }
    return monthlyData.value[0];
});

const monthlyWeeks = computed(() => {
    if (!monthlyData.value) {
        return [];
    }
    return Object.values(monthlyData.value);
});

// 获取 weekIndex 对应的字符串键（用于访问 parsedEvents）
// parsedEvents 的键是字符串（"0", "1", "2"），而 v-for 的 weekIndex 是数字索引
const getWeekKey = (weekIndex: number) => {
    if (!monthlyData.value) {
        return String(weekIndex);
    }
    const keys = Object.keys(monthlyData.value);
    return keys[weekIndex] ?? String(weekIndex);
};

const initMonthlyData = (dateFnsLocale: any) => {
    if (!dateFnsLocale) {
        return;
    }
    const data = foundation.getMonthlyData(displayValue.value, dateFnsLocale);
    if (data) {
        monthlyData.value = data;
    }
};

const calcItemLimit = () => {
    if (cellDomRef.value) {
        const contentCellHeight = cellDomRef.value.getBoundingClientRect().height;
        const contentPadding = 60;
        const contentHeight = 24;
        return Math.max(0, Math.ceil((contentCellHeight - contentPadding) / contentHeight));
    }
    return 0;
};

const getDayCls = (day: any) => {
    return classnames({
        [`${cssClasses.PREFIX}-month-same`]: day.isSameMonth,
        [`${cssClasses.PREFIX}-month-other`]: !day.isSameMonth,
        [`${cssClasses.PREFIX}-today`]: day.isToday,
        [`${cssClasses.PREFIX}-weekend`]: props.markWeekend && day.isWeekend,
    });
};

const getDayEvents = (date: Date) => {
    const dateString = date.toString();
    const parsedEvents = state.value.parsedEvents;
    if (parsedEvents.day && Array.isArray(parsedEvents.day)) {
        // 查找包含该日期的事件
        for (const week of parsedEvents.day) {
            if (Array.isArray(week)) {
                const dayEvents = week.filter(
                    (event: any) => event && event.date && event.date.toString() === dateString
                );
                if (dayEvents.length > 0) {
                    return dayEvents;
                }
            }
        }
    }
    return [];
};

const getWeekDisplayEvents = (weekIndex: number) => {
    const parsedEvents = state.value.parsedEvents;
    const itemLimit = state.value.itemLimit;
    const weekKey = getWeekKey(weekIndex);

    if (parsedEvents && parsedEvents[weekKey] && parsedEvents[weekKey].display) {
        const events = parsedEvents[weekKey].display;
        if (itemLimit > 0) {
            return events.filter((event: any) => event.topInd < itemLimit);
        }
        return events;
    }
    return [];
};

const getHeaderDayCls = (day: any) => {
    return classnames({
        [`${cssClasses.PREFIX}-weekend`]: props.markWeekend && day.isWeekend,
    });
};

const getEventStyle = (event: any) => {
    const toPercent = (num: number) => {
        const res = num < 1 ? num * 100 : 100;
        return `${res}%`;
    };
    return {
        left: toPercent(event.leftPos || 0),
        width: toPercent(event.width || 0),
        top: `${event.topInd || 0}em`,
    };
};

const handleClick = (e: MouseEvent, val: [Date]) => {
    if (props.onClick) {
        const value = foundation.formatCbValue(val);
        props.onClick(e, value);
    }
};

const showCard = (e: MouseEvent, key: string) => {
    foundation.showCard(e, key);
};

const closeCard = (e: MouseEvent, key: string) => {
    foundation.closeCard(e, key);
};

const showCardState = computed(() => state.value.showCard);

onMounted(async () => {
    foundation.init();
    await nextTick();
    await nextTick();

    let itemLimit = calcItemLimit();
    if (itemLimit === 0 && props.height) {
        const contentPadding = 60;
        const contentHeight = 24;
        const estimatedHeight = typeof props.height === 'number' ? props.height : parseInt(props.height, 10);
        itemLimit = Math.max(1, Math.ceil((estimatedHeight / 6 - contentPadding) / contentHeight));
    }

    foundation.parseMonthlyEvents(itemLimit);
});

watch(
    () => [props.events, props.displayValue, props.height],
    async (newVal, oldVal) => {
        const prevEventKeys = state.value.cachedKeys;
        const nowEventKeys = props.events.map((event) => event.key);
        let itemLimit = state.value.itemLimit;
        if (props.height !== undefined) {
            await nextTick();
            await nextTick();
            itemLimit = calcItemLimit();
            if (itemLimit === 0 && props.height) {
                const contentPadding = 60;
                const contentHeight = 24;
                const estimatedHeight = typeof props.height === 'number' ? props.height : parseInt(props.height, 10);
                itemLimit = Math.max(1, Math.ceil((estimatedHeight - contentPadding) / contentHeight));
            }
        }
        const prevDisplayValue = oldVal?.[1];
        const nowDisplayValue = newVal[1];
        if (!isEqual(prevEventKeys, nowEventKeys) || !isEqual(prevDisplayValue, nowDisplayValue)) {
            foundation.parseMonthlyEvents(itemLimit);
        }
    },
    { deep: true, immediate: true }
);

watch(
    () => props.displayValue,
    async () => {
        await nextTick();
        const itemLimit = calcItemLimit();
        foundation.parseMonthlyEvents(itemLimit);
    },
    { deep: true }
);

const monthCalendarKey = ref(0);

watch(
    () => props.weekStartsOn,
    async () => {
        monthCalendarKey.value++;
        monthlyData.value = null;
        await nextTick();
        const itemLimit = calcItemLimit();
        foundation.parseMonthlyEvents(itemLimit);
    }
);
</script>
