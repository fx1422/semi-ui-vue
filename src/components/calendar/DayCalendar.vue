<template>
    <div ref="domRef" :class="dayCls" :style="dayStyle" v-bind="getDataAttr()">
        <div :class="`${prefixCls}-sticky-top`">
            <slot name="header">
                <component :is="() => props.header" v-if="props.header" />
            </slot>
            <LocaleConsumer component-name="Calendar">
                <template #default="{ locale }">
                    <div :class="allDayCls">
                        <ul :class="`${cssClasses.PREFIX}-tag ${allDayCls}-tag ${prefixCls}-sticky-left`">
                            <span>{{ (locale as { allDay: string }).allDay }}</span>
                        </ul>
                        <div role="gridcell" :class="allDayContentCls">
                            <slot name="allDayEvents" :events="props.events" :parsedEvents="parsedEvents.allDay">
                                <ul :class="`${cssClasses.PREFIX}-event-items`">
                                    <li
                                        v-for="(event, ind) in parsedEvents.allDay"
                                        :key="event.key || `allDay-${ind}`"
                                        :class="`${cssClasses.PREFIX}-event-item ${cssClasses.PREFIX}-event-allday`"
                                    >
                                        <slot name="event" :event="event" :index="ind">
                                            <component :is="() => event.children" v-if="event.children" />
                                        </slot>
                                    </li>
                                </ul>
                            </slot>
                        </div>
                    </div>
                </template>
            </LocaleConsumer>
        </div>
        <div :class="`${prefixCls}-scroll-wrapper`">
            <div ref="scrollDomRef" :class="`${prefixCls}-scroll`">
                <TimeCol :class="`${prefixCls}-sticky-left`" :render-time-display="props.renderTimeDisplay">
                    <template v-if="$slots.timeDisplay" #timeDisplay="slotProps">
                        <slot name="timeDisplay" v-bind="slotProps" />
                    </template>
                </TimeCol>
                <DayCol
                    :events="parsedEvents.day"
                    :display-value="displayValue"
                    :scroll-height="scrollHeight"
                    :curr-pos="0"
                    :handle-click="handleClick"
                    :show-curr-time="props.showCurrTime"
                    :is-weekend="isWeekend"
                    :min-event-height="props.minEventHeight"
                    :date-grid-render="props.dateGridRender"
                >
                    <template v-if="$slots.dateGrid" #dateGrid="slotProps">
                        <slot name="dateGrid" v-bind="slotProps" />
                    </template>
                    <template v-if="$slots.event" #event="slotProps">
                        <slot name="event" v-bind="slotProps" />
                    </template>
                </DayCol>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import classnames from 'classnames';
import { isEqual } from 'lodash-es';
import CalendarFoundation, {
    CalendarAdapter,
    ParsedEventsType,
    ParsedEventsWithArray,
} from '@douyinfe/semi-foundation/calendar/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import DayCol from './DayCol.vue';
import TimeCol from './TimeCol.vue';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import { useBaseComponent, useFoundation } from '../_utils';
import type { DayCalendarProps } from './interface';

defineOptions({
    name: 'SemiDayCalendar',
});

const props = withDefaults(defineProps<DayCalendarProps>(), {
    events: () => [],
    displayValue: () => new Date(),
    mode: 'day',
});

const prefixCls = `${cssClasses.PREFIX}-day`;

const domRef = ref<HTMLDivElement>();
const scrollDomRef = ref<HTMLDivElement>();

const state = ref({
    scrollHeight: 0,
    parsedEvents: {
        day: [],
        allDay: [],
    } as ParsedEventsWithArray,
    cachedKeys: [] as string[],
});

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const adapter: CalendarAdapter<DayCalendarProps, typeof state.value> = {
    ...baseAdapter,
    updateScrollHeight: (scrollHeight: number) => {
        state.value.scrollHeight = scrollHeight;
    },
    setParsedEvents: (parsedEvents: ParsedEventsType) => {
        state.value.parsedEvents = parsedEvents as ParsedEventsWithArray;
    },
    cacheEventKeys: (cachedKeys: string[]) => {
        state.value.cachedKeys = cachedKeys;
    },
};

const { foundation } = useFoundation(CalendarFoundation, adapter);

const isWeekend = computed(() => {
    if (!props.markWeekend) {
        return false;
    }
    return foundation.checkWeekend(props.displayValue);
});

const dayCls = computed(() => {
    return classnames(prefixCls, props.className);
});

const dayStyle = computed(() => {
    const style: any = {};
    if (props.height !== undefined && props.height !== null) {
        // 如果是数字，Vue 会自动添加 px，但为了确保一致性，我们也可以显式处理
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    if (props.width !== undefined && props.width !== null) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    return {
        ...style,
        ...props.style,
    };
});

const displayValue = computed(() => props.displayValue || new Date());
const scrollHeight = computed(() => state.value.scrollHeight);
const parsedEvents = computed(() => state.value.parsedEvents);

const handleClick = (e: MouseEvent, val: [Date, number, number, number]) => {
    if (props.onClick) {
        const value = foundation.formatCbValue(val);
        props.onClick(e, value);
    }
};

// 更新 scrollHeight 的函数
const updateScrollHeight = () => {
    if (scrollDomRef.value) {
        const height = scrollDomRef.value.scrollHeight;
        if (height > 0 && state.value.scrollHeight === 0) {
            foundation.notifyScrollHeight(height);
        }
    }
};

onMounted(async () => {
    foundation.init();
    foundation.parseDailyEvents();

    await nextTick();
    if (domRef.value) {
        domRef.value.scrollTop = props.scrollTop ?? 400;
    }
    updateScrollHeight();
});

// 监听 scrollDomRef 挂载
watch(
    () => scrollDomRef.value,
    async (newVal) => {
        if (newVal && state.value.scrollHeight === 0) {
            await nextTick();
            updateScrollHeight();
        }
    },
    { immediate: true }
);

const allDayCls = computed(() => `${cssClasses.PREFIX}-all-day`);

const allDayContentCls = computed(() => {
    return classnames(`${allDayCls.value}-content`, {
        [`${cssClasses.PREFIX}-weekend`]: isWeekend.value,
    });
});

watch(
    () => [props.events, props.displayValue],
    () => {
        const prevEventKeys = state.value.cachedKeys;
        const nowEventKeys = props.events.map((event) => event.key);
        if (!isEqual(prevEventKeys, nowEventKeys)) {
            foundation.parseDailyEvents();
        }
    },
    { deep: true }
);
</script>
