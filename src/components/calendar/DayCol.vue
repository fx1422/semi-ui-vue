<template>
    <div :class="prefixCls" role="presentation">
        <div role="gridcell" :class="`${prefixCls}-content`">
            <template v-if="showCurrTimeComputed">
                <!-- 当前时间线圆点 -->
                <div :class="`${prefixCls}-curr-circle`" :style="currTimeStyle" />
                <!-- 当前时间线 -->
                <div :class="`${prefixCls}-curr-line`" :style="currTimeStyle" />
            </template>
            <ul role="row" :class="skeletonCls">
                <template v-for="item in 25" :key="`${item - 1}-daycol`">
                    <li
                        :data-time="`${pad(item - 1)}:00:00`"
                        :class="`${prefixCls}-skeleton-row-line`"
                        @click="handleClick($event, [props.displayValue, item - 1, 0, 0])"
                    />
                    <li
                        :data-time="`${pad(item - 1)}:30:00`"
                        @click="handleClick($event, [props.displayValue, item - 1, 30, 0])"
                    />
                </template>
            </ul>
            <slot name="dateGrid" :dateString="props.displayValue.toString()" :date="props.displayValue">
                <component
                    :is="() => props.dateGridRender(props.displayValue.toString(), props.displayValue)"
                    v-if="props.dateGridRender"
                />
            </slot>
            <ul :class="`${cssClasses.PREFIX}-event-items`">
                <li
                    v-for="(event, ind) in events"
                    :key="event.key || `${event.startPos}-${ind}`"
                    :class="`${cssClasses.PREFIX}-event-item ${cssClasses.PREFIX}-event-day`"
                    :style="getEventStyle(event)"
                >
                    <slot name="event" :event="event" :index="ind">
                        <component :is="() => event.children" v-if="event.children" />
                    </slot>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import { getPos, round, getCurrDate } from '@douyinfe/semi-foundation/calendar/eventUtil';
import { isSameDay } from 'date-fns';
import type { DayColProps } from './interface';

defineOptions({
    name: 'SemiDayCol',
});

const props = withDefaults(defineProps<DayColProps>(), {
    events: () => [],
    showCurrTime: true,
    scrollHeight: 0,
    minEventHeight: Number.MIN_SAFE_INTEGER,
});

const prefixCls = `${cssClasses.PREFIX}-grid`;

function pad(d: number) {
    return d < 10 ? `0${d.toString()}` : d.toString();
}

// 当前时间位置状态
const currPos = ref(0);
const showCurrTime = ref(false);

// 计算是否是今天
const isToday = computed(() => {
    return props.displayValue && isSameDay(props.displayValue, getCurrDate());
});

// 计算当前时间在一天中的位置比例 (0-1)
const calculatedCurrPos = computed(() => {
    if (isToday.value) {
        return round(getPos(getCurrDate()));
    }
    return 0;
});

// 初始化当前时间线
const initCurrTime = () => {
    if (isToday.value && props.showCurrTime) {
        showCurrTime.value = true;
        currPos.value = calculatedCurrPos.value;
    } else {
        showCurrTime.value = false;
        currPos.value = 0;
    }
};

// 定时更新当前时间位置
let rafId: number | null = null;
let lastUpdateTime = 0;

const updateCurrPos = () => {
    if (isToday.value) {
        const now = Date.now();
        if (now - lastUpdateTime > 30000) {
            currPos.value = round(getPos(getCurrDate()));
            lastUpdateTime = now;
        }
    }
    rafId = requestAnimationFrame(updateCurrPos);
};

onMounted(() => {
    initCurrTime();
    if (props.showCurrTime && isToday.value) {
        lastUpdateTime = Date.now();
        rafId = requestAnimationFrame(updateCurrPos);
    }
});

onUnmounted(() => {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
    }
});

// 监听 scrollHeight 变化，确保时间线正确显示
watch(
    () => props.scrollHeight,
    (newVal, oldVal) => {
        if (newVal > 0 && (!oldVal || oldVal === 0)) {
            initCurrTime();
        }
    },
    { immediate: true }
);

// 是否显示当前时间线
const showCurrTimeComputed = computed(() => {
    return props.showCurrTime ? showCurrTime.value : false;
});

const skeletonCls = computed(() => {
    return classnames(`${prefixCls}-skeleton`, {
        [`${cssClasses.PREFIX}-weekend`]: props.isWeekend,
    });
});

const currTimeStyle = computed(() => {
    const top = currPos.value * props.scrollHeight;
    return { top: `${top}px` };
});

const getEventStyle = (event: any) => {
    const { startPos, endPos, left = 0 } = event;
    const top = startPos * props.scrollHeight;
    const height = (endPos - startPos) * props.scrollHeight;
    return {
        top: `${top}px`,
        height: `${Math.max(props.minEventHeight, height)}px`,
        left: left,
    };
};

const handleClick = (e: MouseEvent, val: [Date, number, number, number]) => {
    props.handleClick(e, val);
};

const events = computed(() => props.events || []);
</script>
