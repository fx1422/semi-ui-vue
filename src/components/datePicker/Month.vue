<template>
    <div
        :ref="
            (el) => {
                monthRef = el as HTMLDivElement;
            }
        "
        role="grid"
        :aria-multiselectable="(props as any).multiple"
        :class="monthCls"
    >
        <div role="row" :class="weekdayCls">
            <div
                v-for="(weekday, index) in weekdaysText"
                :key="weekday + index"
                role="columnheader"
                :class="weekdayItemCls"
            >
                {{ weekday }}
            </div>
        </div>
        <div :class="weeksCls" :style="weeksStyle">
            <div v-for="(week, weekIndex) in monthTable.weeks || []" :key="weekIndex" role="row" :class="weekCls">
                <template v-for="(day, dayIndex) in week" :key="String(day.dayNumber) + dayIndex">
                    <!-- Empty day placeholder when fullDate is empty -->
                    <div v-if="!day.fullDate" role="gridcell" tabindex="-1" :class="cssClasses.DAY">
                        <span />
                    </div>
                    <!-- Normal day with fullDate -->
                    <div
                        v-else
                        role="gridcell"
                        :tabindex="getDayStatus(day).isDisabled ? -1 : 0"
                        :aria-disabled="getDayStatus(day).isDisabled"
                        :aria-selected="getDayStatus(day).isSelected"
                        :aria-label="day.fullDate"
                        :class="getDayClass(day)"
                        :title="day.fullDate"
                        @click="handleDayClick(day)"
                        @mouseenter="handleDayHover(day)"
                        @mouseleave="handleDayHover()"
                    >
                        <div v-if="!customRender" :class="dayMainCls">
                            <template v-if="slots.date">
                                <slot
                                    name="date"
                                    :dayNumber="day.dayNumber"
                                    :fullDate="day.fullDate"
                                    :date="day.fullDate ? parseISO(day.fullDate) : new Date()"
                                />
                            </template>
                            <RenderDate
                                v-else
                                :dayNumber="day.dayNumber"
                                :fullDate="day.fullDate"
                                :renderDate="props.renderDate"
                            />
                        </div>
                        <template v-else-if="slots.fullDate">
                            <slot
                                name="fullDate"
                                :dayNumber="day.dayNumber"
                                :fullDate="day.fullDate"
                                :date="day.fullDate ? parseISO(day.fullDate) : new Date()"
                                :dayStatus="getDayStatus(day)"
                            />
                        </template>
                        <RenderFullDate
                            v-else
                            :day="day"
                            :renderFullDate="props.renderFullDate"
                            :getDayStatus="getDayStatus"
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    toRaw,
    useAttrs,
    useSlots,
    defineComponent,
    h,
} from 'vue';
import classNames from 'classnames';
import { noop, stubFalse, isFunction } from 'lodash-es';
import { parseISO } from 'date-fns';
import { isBefore, isAfter, isBetween, isSameDay } from '@douyinfe/semi-foundation/datePicker/_utils/index';
import MonthFoundation from '@douyinfe/semi-foundation/datePicker/monthFoundation';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/datePicker/constants';
import { useBaseComponent, useFoundation } from '../_utils';
import type { MonthProps } from './interface';
import type { MonthAdapter, MonthDayInfo } from '@douyinfe/semi-foundation/datePicker/monthFoundation';

const slots = useSlots();

const RenderDate = defineComponent({
    name: 'RenderDate',
    props: ['dayNumber', 'fullDate', 'renderDate'],
    setup(props) {
        return () => {
            if (isFunction(props.renderDate)) {
                const dateObj = props.fullDate ? parseISO(props.fullDate) : new Date();
                const result = props.renderDate(props.dayNumber, dateObj);
                if (typeof result === 'number' || typeof result === 'string') {
                    return h('span', null, result);
                }
                return result;
            }
            return h('span', null, props.dayNumber);
        };
    },
});

const RenderFullDate = defineComponent({
    name: 'RenderFullDate',
    props: ['day', 'renderFullDate', 'getDayStatus'],
    setup(props) {
        return () => {
            if (isFunction(props.renderFullDate)) {
                const { dayNumber, fullDate } = props.day;
                const dateObj = fullDate ? parseISO(fullDate) : new Date();
                const dayStatus = props.getDayStatus(props.day);
                const result = props.renderFullDate(dayNumber, dateObj, dayStatus);
                if (typeof result === 'number' || typeof result === 'string') {
                    return h('span', null, result);
                }
                return result;
            }
            return null;
        };
    },
});

defineOptions({
    name: 'DatePickerMonth',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<MonthProps>(), {
    month: () => new Date(),
    selected: () => new Set<string>(),
    rangeStart: '',
    rangeEnd: '',
    onDayClick: noop,
    onDayHover: noop,
    onWeeksRowNumChange: noop,
    weekStartsOn: numbers.WEEK_START_ON,
    disabledDate: stubFalse,
    weeksRowNum: 0,
    hoverDay: '',
    offsetRangeStart: '',
    offsetRangeEnd: '',
    forwardRef: noop,
});

const attrs = useAttrs();

const prefixCls = cssClasses.PREFIX;
const monthRef = ref<HTMLDivElement | null>(null);

const monthTable = ref<{ weeks: MonthDayInfo[][]; monthText: string; month?: Date }>({ weeks: [], monthText: '' });

const state = reactive({
    weekdays: [] as string[],
    todayText: '',
    weeksRowNum: props.weeksRowNum,
    month: monthTable.value,
});

// Update month in state when monthTable changes
watch(
    () => monthTable.value,
    (newValue) => {
        state.month = newValue;
    },
    { deep: true }
);

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter: MonthAdapter = {
    ...baseAdapter,
    updateToday: (todayText: string) => {
        state.todayText = todayText;
    },
    setWeekDays: (weekdays: string[]) => {
        state.weekdays = weekdays;
    },
    setWeeksRowNum: (weeksRowNum: number, callback?: () => void) => {
        state.weeksRowNum = weeksRowNum;
        if (callback) callback();
    },
    updateMonthTable: (month: any) => {
        monthTable.value = toRaw(month);
    },
    notifyDayClick: (day: MonthDayInfo) => {
        props.onDayClick?.(day as any, {} as MouseEvent);
    },
    notifyDayHover: (day?: MonthDayInfo) => {
        // Convert MonthDayInfo to string for Vue component
        // Handle case where day might be undefined (e.g., on mouseleave)
        if (day?.fullDate) {
            props.onDayHover?.(day.fullDate);
        }
    },
    notifyWeeksRowNumChange: (weeksRowNum: number) => props.onWeeksRowNumChange?.(weeksRowNum),
    getProps: () => {
        // Add missing 'multiple' property required by MonthFoundationProps
        return {
            ...props,
            multiple: (props as any).multiple || false,
        } as any;
    },
};

const { foundation } = useFoundation(MonthFoundation, adapter);

const monthCls = computed(() => classNames(cssClasses.MONTH));
const weekdayCls = computed(() => classNames(cssClasses.WEEKDAY));
const weekdayItemCls = computed(() => classNames(`${prefixCls}-weekday-item`));
const weekdaysText = computed(() => {
    const locale = props.locale || ({} as any);
    return state.weekdays.map((key) => (locale as any).weeks?.[key] || key);
});

const weeksCls = computed(() => classNames(cssClasses.WEEKS));
const weekCls = computed(() => cssClasses.WEEK);
const dayMainCls = computed(() => classNames(`${cssClasses.DAY}-main`));

const weeksStyle = computed(() => {
    if (state.weeksRowNum) {
        const height = state.weeksRowNum * numbers.WEEK_HEIGHT;
        return { height: `${height}px` };
    }
    return {};
});

// Ensure monthTable has the correct structure
watch(
    () => monthTable.value,
    (newValue) => {
        if (!newValue.weeks) {
            monthTable.value = { ...newValue, weeks: [], monthText: '' };
        }
    },
    { immediate: true }
);

const customRender = computed(() => slots.fullDate || isFunction(props.renderFullDate));

const selectedArray = computed(() => [...props.selected]);

const getSingleDayStatus = (options: { fullDate: string; todayText: string }) => {
    const { fullDate, todayText } = options;
    const { rangeInputFocus } = props;
    const disabledOptions = { rangeStart: props.rangeStart, rangeEnd: props.rangeEnd, rangeInputFocus };
    const isToday = fullDate === todayText;
    const isSelected = selectedArray.value.includes(fullDate);

    let isDisabled = props.disabledDate && props.disabledDate(parseISO(fullDate), disabledOptions);
    const focusRecordsRefFromAttrs = (attrs as any).focusRecordsRef;
    const focusRecordsRefValue = props.focusRecordsRef || focusRecordsRefFromAttrs;
    const focusRecords = focusRecordsRefValue?.value || focusRecordsRefValue;
    if (
        !isDisabled &&
        props.rangeInputFocus === 'rangeStart' &&
        props.rangeEnd &&
        focusRecords &&
        focusRecords.rangeEnd
    ) {
        isDisabled = isAfter(fullDate, props.rangeEnd.trim().split(/\s+/)[0]);
    }
    if (
        !isDisabled &&
        props.rangeInputFocus === 'rangeEnd' &&
        props.rangeStart &&
        focusRecords &&
        focusRecords.rangeStart
    ) {
        isDisabled = isBefore(fullDate, props.rangeStart.trim().split(/\s+/)[0]);
    }

    return {
        isToday,
        isSelected,
        isDisabled,
    };
};

const getDateRangeStatus = (options: { fullDate: string }) => {
    const { fullDate } = options;
    const { rangeStart, rangeEnd, hoverDay, offsetRangeStart, offsetRangeEnd, rangeInputFocus } = props;

    const _isDateRangeAnySelected = Boolean(rangeStart || rangeEnd);
    if (!_isDateRangeAnySelected) {
        return {};
    }

    const _isHoverDay = isSameDay(hoverDay, fullDate);
    const _isDateRangeSelected = Boolean(rangeStart && rangeEnd);

    let _isHoverAfterStart, _isHoverBeforeEnd, isSelectedStart, isSelectedEnd, isHoverDayAroundOneSelected;
    if (rangeStart) {
        isSelectedStart = isSameDay(fullDate, rangeStart);
        if (rangeInputFocus === 'rangeEnd') {
            _isHoverAfterStart = isBetween(fullDate, { start: rangeStart, end: hoverDay });
        }
    }
    if (rangeEnd) {
        isSelectedEnd = isSameDay(fullDate, rangeEnd);
        if (rangeInputFocus === 'rangeStart') {
            _isHoverBeforeEnd = isBetween(fullDate, { start: hoverDay, end: rangeEnd });
        }
    }

    if (!_isDateRangeSelected && _isDateRangeAnySelected) {
        isHoverDayAroundOneSelected = _isHoverDay;
    }

    let isHover;
    if (!(offsetRangeStart || offsetRangeEnd)) {
        isHover = _isHoverAfterStart || _isHoverBeforeEnd || _isHoverDay;
    }

    let isInRange,
        isSelectedStartAfterHover,
        isSelectedEndBeforeHover,
        isHoverDayInStartSelection,
        isHoverDayInEndSelection,
        isHoverDayInRange;
    if (_isDateRangeSelected) {
        isInRange = isBetween(fullDate, { start: rangeStart, end: rangeEnd });
        if (!(offsetRangeStart || offsetRangeEnd)) {
            isSelectedStartAfterHover = isSelectedStart && isAfter(rangeStart, hoverDay);
            isSelectedEndBeforeHover = isSelectedEnd && isBefore(rangeEnd, hoverDay);
            isHoverDayInStartSelection = _isHoverDay && rangeInputFocus === 'rangeStart';
            isHoverDayInEndSelection = _isHoverDay && rangeInputFocus === 'rangeEnd';
            isHoverDayInRange = _isHoverDay && isBetween(hoverDay, { start: rangeStart, end: rangeEnd });
        }
    }

    return {
        isHoverDay: _isHoverDay,
        isSelectedStart,
        isSelectedEnd,
        isInRange,
        isHover,
        isSelectedStartAfterHover,
        isSelectedEndBeforeHover,
        isHoverDayInRange,
        isHoverDayInStartSelection,
        isHoverDayInEndSelection,
        isHoverDayAroundOneSelected,
    };
};

const getOffsetDateStatus = (options: { fullDate: string }) => {
    const { fullDate } = options;
    const { offsetRangeStart, offsetRangeEnd, rangeStart, rangeEnd, hoverDay } = props;

    if (!(offsetRangeStart || offsetRangeEnd)) {
        return {};
    }

    const _isInRange = isBetween(fullDate, { start: rangeStart, end: rangeEnd });
    const _isHoverDay = isSameDay(hoverDay, fullDate);
    const _isSelectedStart = rangeStart && isSameDay(fullDate, rangeStart);
    const _isSelectedEnd = rangeEnd && isSameDay(fullDate, rangeEnd);
    const _isDateRangeSelected = Boolean(rangeStart && rangeEnd);

    const isOffsetRangeStart = isSameDay(fullDate, offsetRangeStart);
    const isOffsetRangeEnd = isSameDay(fullDate, offsetRangeEnd);
    const isHoverDayOffset = _isHoverDay;

    let isHoverInOffsetRange, isInOffsetRange;
    if (_isDateRangeSelected) {
        isHoverInOffsetRange = _isInRange && _isHoverDay;
    }

    const _isOffsetDateRangeSelected = Boolean(offsetRangeStart && offsetRangeEnd);
    if (_isOffsetDateRangeSelected) {
        isInOffsetRange =
            _isSelectedStart || isBetween(fullDate, { start: offsetRangeStart, end: offsetRangeEnd }) || _isSelectedEnd;
    }

    return {
        isOffsetRangeStart,
        isOffsetRangeEnd,
        isHoverInOffsetRange,
        isHoverDayOffset,
        isInOffsetRange,
    };
};

const getDayStatus = (day: MonthDayInfo) => {
    const { fullDate } = day;
    const singleDayStatus = getSingleDayStatus({ fullDate, todayText: state.todayText });
    const dateRangeStatus = getDateRangeStatus({ fullDate });
    const offsetDataStatus = getOffsetDateStatus({ fullDate });

    return {
        ...singleDayStatus,
        ...dateRangeStatus,
        ...offsetDataStatus,
    };
};

const getDayClass = (day: MonthDayInfo) => {
    const dayStatus = getDayStatus(day);
    const { fullDate } = day;

    if (customRender.value) {
        return classNames(cssClasses.DAY);
    }

    return classNames(cssClasses.DAY, {
        [cssClasses.DAY_TODAY]: dayStatus.isToday,
        [cssClasses.DAY_IN_RANGE]: dayStatus.isInRange,
        [cssClasses.DAY_HOVER]: dayStatus.isHover,
        [cssClasses.DAY_SELECTED]: dayStatus.isSelected,
        [cssClasses.DAY_SELECTED_START]: dayStatus.isSelectedStart,
        [cssClasses.DAY_SELECTED_END]: dayStatus.isSelectedEnd,
        [cssClasses.DAY_DISABLED]: dayStatus.isDisabled,
        [cssClasses.DAY_HOVER_DAY]: dayStatus.isHoverDayOffset,
        [cssClasses.DAY_IN_OFFSET_RANGE]: dayStatus.isInOffsetRange,
        [cssClasses.DAY_SELECTED_RANGE_HOVER]: dayStatus.isHoverInOffsetRange,
        [cssClasses.DAY_OFFSET_RANGE_START]: dayStatus.isOffsetRangeStart,
        [cssClasses.DAY_OFFSET_RANGE_END]: dayStatus.isOffsetRangeEnd,
        [cssClasses.DAY_SELECTED_START_AFTER_HOVER]: dayStatus.isSelectedStartAfterHover,
        [cssClasses.DAY_SELECTED_END_BEFORE_HOVER]: dayStatus.isSelectedEndBeforeHover,
        [cssClasses.DAY_HOVER_DAY_BEFORE_RANGE]: dayStatus.isHoverDayInStartSelection,
        [cssClasses.DAY_HOVER_DAY_AFTER_RANGE]: dayStatus.isHoverDayInEndSelection,
        [cssClasses.DAY_HOVER_DAY_AROUND_SINGLE_SELECTED]: dayStatus.isHoverDayAroundOneSelected,
    });
};

const handleDayClick = (day: MonthDayInfo) => {
    const dayStatus = getDayStatus(day);
    if (!dayStatus.isDisabled) {
        foundation.handleClick(day);
    }
};

const handleDayHover = (day?: MonthDayInfo) => {
    foundation.handleHover(day);
};

onMounted(() => {
    foundation.init();
    if (props.forwardRef) {
        props.forwardRef(monthRef.value);
    }
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => props.month,
    () => {
        foundation.getMonthTable();
    },
    { immediate: true }
);

watch(
    () => props.weeksRowNum,
    (val) => {
        state.weeksRowNum = val;
    }
);

defineExpose({
    monthRef,
});
</script>
