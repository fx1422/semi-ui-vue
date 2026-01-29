<template>
    <div :class="monthCls" :style="style" :x-open-type="xOpenType">
        <div v-if="isYearPickerOpen" :class="`${prefixCls}-yam`">
            <YearAndMonth
                :ref="(el) => props.setCache(`yam-${props.panelType}`, el)"
                :locale="props.props.locale"
                :localeCode="props.props.localeCode"
                :currentYear="{ left: year, right: 0 }"
                :currentMonth="{ left: monthNumber, right: 0 }"
                :onSelect="handleYearMonthSelect"
                :onBackToMain="handleBackToMain"
                :density="props.props.density"
                :yearAndMonthOpts="props.props.yearAndMonthOpts"
                :startYear="props.props.startYear"
                :endYear="props.props.endYear"
                :noBackBtn="false"
            />
        </div>
        <div v-if="isTimePickerOpen" :class="`${prefixCls}-tpk`">
            <div :class="`${prefixCls}-time`">
                <Combobox
                    :ref="(el) => props.setCache(`timepicker-${props.panelType}`, el)"
                    :panelHeader="timePlaceholder"
                    :format="timeFormat"
                    :timeStampValue="pickerDate"
                    :onChange="handleTimeChange"
                    v-bind="timePickerProps"
                />
            </div>
        </div>

        <template v-if="props.foundation?.isRangeType() || (!isYearPickerOpen && !isTimePickerOpen)">
            <div :ref="(el) => props.setCache(`wrap-${props.panelType}`, el)" :style="wrapStyle">
                <Navigation
                    :forwardRef="(el) => props.setCache(`nav-${props.panelType}`, el)"
                    :monthText="getMonthText()"
                    :density="props.props.density"
                    :onMonthClick="handleShowYearPicker"
                    :onPrevMonth="handlePrevMonth"
                    :onNextMonth="handleNextMonth"
                    :onNextYear="handleNextYear"
                    :onPrevYear="handlePrevYear"
                    :shouldBimonthSwitch="shouldBimonthSwitch"
                    :panelType="props.panelType"
                />
                <Month
                    :locale="props.props.locale"
                    :localeCode="props.props.localeCode"
                    :forwardRef="(el) => props.setCache(`month-${props.panelType}`, el)"
                    :disabledDate="props.props.disabledDate"
                    :weekStartsOn="props.props.weekStartsOn"
                    :month="props.month"
                    :selected="props.selected || props.state.selected"
                    :rangeStart="props.rangeStart ?? props.state.rangeStart"
                    :rangeEnd="props.rangeEnd ?? props.state.rangeEnd"
                    :rangeInputFocus="props.rangeInputFocus"
                    :offsetRangeStart="props.offsetRangeStart ?? props.state.offsetRangeStart"
                    :offsetRangeEnd="props.offsetRangeEnd ?? props.state.offsetRangeEnd"
                    :hoverDay="props.hoverDay ?? props.state.hoverDay"
                    :weeksRowNum="props.weeksRowNum ?? props.state.maxWeekNum"
                    :renderDate="props.props.renderDate"
                    :renderFullDate="props.props.renderFullDate"
                    :onDayClick="handleDayClick"
                    :onDayHover="handleDayHover"
                    :onWeeksRowNumChange="handleWeeksRowNumChange"
                    :startDateOffset="props.props.startDateOffset"
                    :endDateOffset="props.props.endDateOffset"
                    :focusRecordsRef="props.props.focusRecordsRef"
                    :multiple="props.props.multiple"
                >
                    <template v-if="$slots.date" #date="slotProps">
                        <slot name="date" v-bind="slotProps" />
                    </template>
                    <template v-if="$slots.fullDate" #fullDate="slotProps">
                        <slot name="fullDate" v-bind="slotProps" />
                    </template>
                </Month>
            </div>
        </template>

        <div
            v-if="showSwitch"
            :ref="(el) => props.setCache(`switch-${props.panelType}`, el)"
            :class="`${prefixCls}-switch`"
        >
            <div role="button" aria-label="Switch to date panel" :class="switchDateCls" @click="handleShowDatePanel">
                <IconCalendar v-if="showSwitchIcon" aria-hidden />
                <span :class="`${prefixCls}-switch-text`">{{ switchDateText || switchMonthText }}</span>
            </div>
            <div role="button" aria-label="Switch to time panel" :class="switchTimeCls" @click="handleShowTimePicker">
                <IconClock v-if="showSwitchIcon" aria-hidden />
                <span :class="`${prefixCls}-switch-text`">{{ switchTimeText }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import classNames from 'classnames';
import { format as formatFn, isSameDay } from 'date-fns';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import { compatibleParse } from '@douyinfe/semi-foundation/datePicker/_utils/parser';
import Navigation from './Navigation.vue';
import Month from './Month.vue';
import YearAndMonth from './YearAndMonth.vue';
import Combobox from '../timePicker/Combobox.vue';
import { IconCalendar, IconClock } from '../icons';

const props = defineProps<{
    month: Date;
    panelType: any;
    panelDetail: any;
    state: any;
    props: any; // Parent props
    foundation: any;
    setCache: Function;
    getCache: Function;
    rangeInputFocus?: 'rangeStart' | 'rangeEnd' | false;
    selected?: Set<string>;
    rangeStart?: string;
    rangeEnd?: string;
    hoverDay?: string;
    weeksRowNum?: number;
    offsetRangeStart?: string;
    offsetRangeEnd?: string;
    onDayClick?: (day: any, panelType: any) => void;
}>();

const prefixCls = cssClasses.PREFIX;

const isYearPickerOpen = computed(() => props.panelDetail.isYearPickerOpen);
const isTimePickerOpen = computed(() => props.panelDetail.isTimePickerOpen);
const pickerDate = computed(() => props.panelDetail.pickerDate);
const showDate = computed(() => props.panelDetail.showDate);

const panelStyle = ref({});
const updatePanelStyle = () => {
    const style: any = {};
    const wrapLeft = props.getCache(`wrap-${strings.PANEL_TYPE_LEFT}`);
    const wrapRight = props.getCache(`wrap-${strings.PANEL_TYPE_RIGHT}`);
    const wrap = props.panelType === strings.PANEL_TYPE_RIGHT ? wrapRight : wrapLeft;

    if (props.foundation?.isRangeType()) {
        if (isYearPickerOpen.value || isTimePickerOpen.value) {
            if (wrap && wrap.getBoundingClientRect) {
                style.minWidth = wrap.getBoundingClientRect().width + 'px';
            }
        }

        const { monthLeft, monthRight } = props.state;
        const leftIsYearOrTime = monthLeft && (monthLeft.isTimePickerOpen || monthLeft.isYearPickerOpen);
        const rightIsYearOrTime = monthRight && (monthRight.isTimePickerOpen || monthRight.isYearPickerOpen);
        const { insetInput } = props.props;

        if (leftIsYearOrTime && rightIsYearOrTime && !insetInput) {
            const currentPanelHeight = props.state.currentPanelHeight;
            style.minHeight = (currentPanelHeight ? currentPanelHeight : calcScrollListHeight()) + 'px';
        }
    }
    panelStyle.value = style;
};

const calcScrollListHeight = () => {
    const wrapLeft = props.getCache(`wrap-${strings.PANEL_TYPE_LEFT}`);
    const wrapRight = props.getCache(`wrap-${strings.PANEL_TYPE_RIGHT}`);
    const switchLeft = props.getCache(`switch-${strings.PANEL_TYPE_LEFT}`);
    const switchRight = props.getCache(`switch-${strings.PANEL_TYPE_RIGHT}`);

    const leftRect = wrapLeft && wrapLeft.getBoundingClientRect();
    const rightRect = wrapRight && wrapRight.getBoundingClientRect();

    let leftHeight = (leftRect && leftRect.height) || 0;
    let rightHeight = (rightRect && rightRect.height) || 0;

    if (switchLeft) {
        leftHeight += switchLeft.getBoundingClientRect().height;
    }
    if (switchRight) {
        rightHeight += switchRight.getBoundingClientRect().height;
    }

    return Math.max(leftHeight, rightHeight);
};

watch([isYearPickerOpen, isTimePickerOpen], () => {
    nextTick(() => {
        updatePanelStyle();
    });
});

const monthCls = computed(() => {
    let cls = classNames(`${prefixCls}-month-grid-${props.panelType}`);
    if (
        props.props.type !== 'year' &&
        props.props.type !== 'month' &&
        (isTimePickerOpen.value || isYearPickerOpen.value)
    ) {
        cls = classNames(cls, `${prefixCls}-yam-showing`);
    }
    return cls;
});

const style = computed(() => panelStyle.value);

const xOpenType = computed(() => {
    const _isDatePanelOpen = !(isYearPickerOpen.value || isTimePickerOpen.value);
    return _isDatePanelOpen ? 'date' : isYearPickerOpen.value ? 'year' : 'time';
});

const year = computed(() => pickerDate.value.getFullYear());
const monthNumber = computed(() => pickerDate.value.getMonth() + 1);

const handleYearMonthSelect = (item: any) => {
    props.foundation?.toYearMonth(props.panelType, new Date(item.currentYear.left, item.currentMonth.left - 1));
};

const handleBackToMain = () => {
    props.foundation?.showDatePanel(props.panelType);
};

const timePlaceholder = computed(() => props.props.locale.selectTime);
const timeFormat = computed(() => props.props.format || strings.FORMAT_TIME_PICKER);

const timePickerProps = computed(() => {
    const { type, hideDisabledOptions, timePickerOpts, dateFnsLocale } = props.props;
    const restProps = {
        ...timePickerOpts,
        hideDisabledOptions,
    };

    const disabledOptions = props.foundation?.calcDisabledTime(props.panelType);
    if (disabledOptions) {
        ['disabledHours', 'disabledMinutes', 'disabledSeconds'].forEach((key) => {
            if (disabledOptions[key]) {
                restProps[key] = disabledOptions[key];
            }
        });
    }

    const { rangeStart, rangeEnd } = props.state;
    const dateFormat = props.foundation?.getValidDateFormat();
    let startDate, endDate;

    if (
        type === 'dateTimeRange' &&
        rangeStart &&
        rangeEnd &&
        compatibleParse(rangeStart, dateFormat, undefined, dateFnsLocale) &&
        compatibleParse(rangeEnd, dateFormat, undefined, dateFnsLocale) &&
        isSameDay(
            (startDate = compatibleParse(rangeStart, dateFormat, undefined, dateFnsLocale)),
            (endDate = compatibleParse(rangeEnd, dateFormat, undefined, dateFnsLocale))
        )
    ) {
        if (props.panelType === strings.PANEL_TYPE_RIGHT) {
            if (rangeStart) restProps.startDate = startDate;
        } else {
            if (rangeEnd) restProps.endDate = endDate;
        }
    }
    return restProps;
});

const handleTimeChange = (newTime: { timeStampValue: number }) => {
    props.foundation?.handleTimeChange(newTime, props.panelType);
};

const getMonthText = () => {
    if (props.month) {
        const yearNumber = formatFn(props.month, 'yyyy');
        const monthNum = parseInt(formatFn(props.month, 'L'), 10);
        const mText = props.props?.locale?.months?.[monthNum] || `${monthNum}月`;
        const monthFormatToken = props.props?.locale?.monthText || '${year}年${month}';
        return monthFormatToken.replace('${year}', yearNumber).replace('${month}', mText);
    }
    return '';
};

const shouldBimonthSwitch = computed(() => {
    return props.foundation?.isRangeType() && props.props.syncSwitchMonth;
});

const wrapStyle = computed(() => {
    const s: any = {};
    if (props.foundation?.isRangeType() && (isYearPickerOpen.value || isTimePickerOpen.value)) {
        s.visibility = 'hidden';
        s.position = 'absolute';
        s.pointerEvents = 'none';
    }
    return s;
});

const handleShowYearPicker = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    props.foundation?.showYearPicker(props.panelType);
};

const handlePrevMonth = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    props.foundation?.prevMonth(props.panelType);
};
const handleNextMonth = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    props.foundation?.nextMonth(props.panelType);
};
const handleNextYear = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    props.foundation?.nextYear(props.panelType);
};
const handlePrevYear = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    props.foundation?.prevYear(props.panelType);
};
const handleDayClick = (day: any) => {
    if (props.onDayClick) {
        props.onDayClick(day, props.panelType);
    } else if (props.foundation && props.foundation.handleDayClick) {
        props.foundation.handleDayClick(day, props.panelType);
    }
};
const handleDayHover = (day: any) => props.foundation?.handleDayHover(day, props.panelType);
const handleWeeksRowNumChange = (weeksRowNum: number) => {
    const { monthLeft, monthRight } = props.state;
    const leftIsYearOrTime = monthLeft && (monthLeft.isTimePickerOpen || monthLeft.isYearPickerOpen);
    const rightIsYearOrTime = monthRight && (monthRight.isTimePickerOpen || monthRight.isYearPickerOpen);
    const allIsYearOrTime = leftIsYearOrTime && rightIsYearOrTime;

    if (props.foundation?.isRangeType() && !allIsYearOrTime) {
        props.state.maxWeekNum = weeksRowNum;
    }
};

const showSwitch = computed(() => {
    const { type, insetInput } = props.props;
    if (!type.includes('Time') || insetInput) {
        return false;
    }
    return true;
});

const showSwitchIcon = computed(() => props.props.density === 'default');

const switchDateText = computed(() => {
    const { rangeStart, rangeEnd } = props.state;
    const { locale, dateFnsLocale } = props.props;
    const { FORMAT_SWITCH_DATE } = locale.localeFormatToken;
    const dateFormat = props.foundation?.getValidDateFormat();

    if (props.panelType === strings.PANEL_TYPE_LEFT) {
        return rangeStart
            ? formatFn(compatibleParse(rangeStart, dateFormat, undefined, dateFnsLocale), FORMAT_SWITCH_DATE)
            : '';
    } else {
        return rangeEnd
            ? formatFn(compatibleParse(rangeEnd, dateFormat, undefined, dateFnsLocale), FORMAT_SWITCH_DATE)
            : '';
    }
});

const switchMonthText = computed(() => {
    const { FORMAT_SWITCH_DATE } = props.props.locale.localeFormatToken;
    return showDate.value ? formatFn(showDate.value, FORMAT_SWITCH_DATE) : '';
});

const switchTimeText = computed(() => {
    const formatTimePicker = props.foundation?.getValidTimeFormat();
    return showDate.value ? formatFn(showDate.value, formatTimePicker) : '';
});

const switchDateCls = computed(() =>
    classNames({
        [`${prefixCls}-switch-date`]: true,
        [`${prefixCls}-switch-date-active`]: !isTimePickerOpen.value,
    })
);

const switchTimeCls = computed(() =>
    classNames({
        [`${prefixCls}-switch-time`]: true,
        [`${prefixCls}-switch-time-disabled`]: props.props.disabledTimePicker,
        [`${prefixCls}-switch-date-active`]: isTimePickerOpen.value,
    })
);

const handleShowDatePanel = () => {
    props.foundation?.showDatePanel(props.panelType);
};

const handleShowTimePicker = () => {
    props.foundation?.showTimePicker(props.panelType, true);
};
</script>
