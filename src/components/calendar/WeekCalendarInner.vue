<template>
    <div :ref="setDomRef" :class="weekCls" :style="weekStyle" v-bind="getDataAttr()">
        <div :class="`${prefixCls}-sticky-top`">
            <slot name="header">
                <component :is="() => props.props.header" v-if="props.props.header" />
            </slot>
            <!-- 周头部：月份 + 日期列表 -->
            <div :class="`${prefixCls}-header`">
                <ul :class="`${cssClasses.PREFIX}-tag ${prefixCls}-tag ${prefixCls}-sticky-left`">
                    <span>{{ weeklyMonth }}</span>
                </ul>
                <div role="gridcell" :class="`${prefixCls}-grid`">
                    <ul :class="`${prefixCls}-grid-row`">
                        <li
                            v-for="day in weekDays"
                            :key="`${day.date.toString()}-weekheader`"
                            :class="getHeaderDayCls(day)"
                        >
                            <slot name="dateDisplay" :date="day.date" :day="day">
                                <component
                                    :is="() => props.props.renderDateDisplay(day.date)"
                                    v-if="props.props.renderDateDisplay"
                                />
                                <template v-else>
                                    <span :class="`${cssClasses.PREFIX}-today-date`">{{ day.dayString }}</span>
                                    <span>{{ day.weekday }}</span>
                                </template>
                            </slot>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 全天事件区域 -->
            <div :class="allDayCls" :style="allDayStyle">
                <ul :class="`${cssClasses.PREFIX}-tag ${allDayCls}-tag ${prefixCls}-sticky-left`">
                    <span>{{ locale.allDay }}</span>
                </ul>
                <div role="gridcell" :class="`${cssClasses.PREFIX}-content ${allDayCls}-content`">
                    <ul :class="`${allDayCls}-skeleton`">
                        <li
                            v-for="day in weekDays"
                            :key="`${day.date.toString()}-weekgrid`"
                            :class="getSkeletonCls(day)"
                        />
                    </ul>
                    <slot name="allDayEvents" :events="props.props.events" :parsedEvents="allDayEvents">
                        <ul :class="`${cssClasses.PREFIX}-event-items`">
                            <li
                                v-for="(event, ind) in allDayEvents"
                                :key="`allDay-${ind}`"
                                :class="`${cssClasses.PREFIX}-event-item ${cssClasses.PREFIX}-event-allday`"
                                :style="getAllDayEventStyle(event)"
                            >
                                <slot name="event" :event="event" :index="ind">
                                    <component :is="() => event.children" v-if="event.children" />
                                </slot>
                            </li>
                        </ul>
                    </slot>
                </div>
            </div>
        </div>
        <!-- 可滚动的时间网格区域 -->
        <div :class="`${prefixCls}-scroll-wrapper`">
            <div :ref="(el) => setScrollDomRef(el as HTMLDivElement | null)" :class="`${prefixCls}-scroll`">
                <!-- 时间列 -->
                <TimeCol :class="`${prefixCls}-sticky-left`" :render-time-display="props.props.renderTimeDisplay">
                    <template v-if="$slots.timeDisplay" #timeDisplay="slotProps">
                        <slot name="timeDisplay" v-bind="slotProps" />
                    </template>
                </TimeCol>
                <!-- 每日网格 -->
                <DayCol
                    v-for="day in weekDays"
                    :key="`${day.date.toString()}-weekday`"
                    :display-value="day.date"
                    :scroll-height="scrollHeight"
                    :handle-click="handleClick"
                    :events="getDayEvents(day.date)"
                    :show-curr-time="props.props.showCurrTime"
                    :is-weekend="!!(props.props.markWeekend && day.isWeekend)"
                    :date-grid-render="props.props.dateGridRender"
                    :min-event-height="props.props.minEventHeight"
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
import { ref, watch, onMounted, nextTick } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import DayCol from './DayCol.vue';
import TimeCol from './TimeCol.vue';
import type { WeekCalendarProps } from './interface';

defineOptions({
    name: 'SemiWeekCalendarInner',
});

const props = defineProps<{
    locale: any;
    dateFnsLocale: any;
    weekCls: string;
    weekStyle: any;
    domRef: any;
    getDataAttr: () => any;
    props: WeekCalendarProps;
    weekDays: any[];
    weeklyMonth: string;
    allDayEvents: any[];
    allDayStyle: any;
    getHeaderDayCls: (day: any) => string;
    getSkeletonCls: (day: any) => string;
    getAllDayEventStyle: (event: any) => any;
    getDayEvents: (date: Date) => any[];
    handleClick: (e: MouseEvent, val: [Date, number, number, number]) => void;
    initWeeklyData: (dateFnsLocale: any) => void;
}>();

// 本地 scrollDom ref 和 scrollHeight
const scrollDomRef = ref<HTMLDivElement | null>(null);
const scrollHeight = ref(0);

const setDomRef = (el: HTMLDivElement | null) => {
    if (props.domRef && typeof props.domRef === 'object' && 'value' in props.domRef) {
        props.domRef.value = el;
    }
};

const setScrollDomRef = (el: HTMLDivElement | null) => {
    scrollDomRef.value = el;
    if (el) {
        nextTick(() => {
            const height = el.scrollHeight;
            if (height > 0) {
                scrollHeight.value = height;
            }
        });
    }
};

const prefixCls = `${cssClasses.PREFIX}-week`;
const allDayCls = `${cssClasses.PREFIX}-all-day`;

// 立即初始化数据（如果 dateFnsLocale 已经可用）
// 这确保首次渲染时就有数据
if (props.dateFnsLocale && props.weekDays.length === 0) {
    props.initWeeklyData(props.dateFnsLocale);
}

// 监听 dateFnsLocale 变化，初始化数据
watch(
    () => props.dateFnsLocale,
    (newLocale) => {
        if (newLocale) {
            props.initWeeklyData(newLocale);
        }
    },
    { immediate: true }
);

// 监听 displayValue 变化，重新初始化数据
watch(
    () => props.props.displayValue,
    () => {
        if (props.dateFnsLocale) {
            props.initWeeklyData(props.dateFnsLocale);
        }
    }
);

onMounted(async () => {
    await nextTick();
    if (props.dateFnsLocale && props.weekDays.length === 0) {
        props.initWeeklyData(props.dateFnsLocale);
    }

    // 获取 scrollHeight
    await nextTick();
    if (scrollDomRef.value && scrollHeight.value === 0) {
        scrollHeight.value = scrollDomRef.value.scrollHeight;
    }
});

// 当 weekDays 变化时，重新获取 scrollHeight
watch(
    () => props.weekDays.length,
    async (newLen) => {
        if (newLen > 0 && scrollHeight.value === 0) {
            await nextTick();
            if (scrollDomRef.value) {
                scrollHeight.value = scrollDomRef.value.scrollHeight;
            }
        }
    }
);
</script>
