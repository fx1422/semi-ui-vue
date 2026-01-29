<template>
    <div style="display: flex">
        <QuickControl
            v-if="presetPosition === 'left' && renderQuickControls"
            :presets="presets"
            :presetPosition="presetPosition"
            :onPresetClick="handlePresetClick"
            :type="type"
            :insetInput="insetInput"
            :locale="locale"
        />
        <div>
            <component :is="renderDateInput" v-if="renderDateInput" />
            <div
                :ref="
                    (el) => {
                        monthGridRef = el as HTMLDivElement | null;
                    }
                "
                :class="monthGridCls"
                :x-type="type"
                :x-panel-yearandmonth-open-type="yearOpenType"
                :x-insetinput="insetInput ? 'true' : 'false'"
                :x-preset-position="renderQuickControls === null ? 'null' : presetPosition"
            >
                <Panel
                    v-if="type === 'date' || type === 'dateTime'"
                    :month="monthLeft.pickerDate"
                    :panelType="panelTypeLeft"
                    :panelDetail="monthLeft"
                    :state="state"
                    :props="mergedProps"
                    :foundation="foundation"
                    :setCache="adapter.setCache"
                    :getCache="adapter.getCache"
                    :rangeInputFocus="props.rangeInputFocus"
                    :selected="state.selected"
                    :rangeStart="state.rangeStart"
                    :rangeEnd="state.rangeEnd"
                    :hoverDay="state.hoverDay"
                    :weeksRowNum="state.maxWeekNum"
                    :offsetRangeStart="state.offsetRangeStart"
                    :offsetRangeEnd="state.offsetRangeEnd"
                    :onDayClick="handleDayClick"
                >
                    <template v-if="$slots.date" #date="slotProps">
                        <slot name="date" v-bind="slotProps" />
                    </template>
                    <template v-if="$slots.fullDate" #fullDate="slotProps">
                        <slot name="fullDate" v-bind="slotProps" />
                    </template>
                </Panel>
                <template v-else-if="type === 'dateRange' || type === 'dateTimeRange'">
                    <Panel
                        :month="monthLeft.pickerDate"
                        :panelType="panelTypeLeft"
                        :panelDetail="monthLeft"
                        :state="state"
                        :props="mergedProps"
                        :foundation="foundation"
                        :setCache="adapter.setCache"
                        :getCache="adapter.getCache"
                        :rangeInputFocus="props.rangeInputFocus"
                        :selected="state.selected"
                        :rangeStart="state.rangeStart"
                        :rangeEnd="state.rangeEnd"
                        :hoverDay="state.hoverDay"
                        :weeksRowNum="state.maxWeekNum"
                        :offsetRangeStart="state.offsetRangeStart"
                        :offsetRangeEnd="state.offsetRangeEnd"
                        :onDayClick="handleDayClick"
                    >
                        <template v-if="$slots.date" #date="slotProps">
                            <slot name="date" v-bind="slotProps" />
                        </template>
                    </Panel>
                    <Panel
                        :month="monthRight.pickerDate"
                        :panelType="panelTypeRight"
                        :panelDetail="monthRight"
                        :state="state"
                        :props="mergedProps"
                        :foundation="foundation"
                        :setCache="adapter.setCache"
                        :getCache="adapter.getCache"
                        :rangeInputFocus="props.rangeInputFocus"
                        :selected="state.selected"
                        :rangeStart="state.rangeStart"
                        :rangeEnd="state.rangeEnd"
                        :hoverDay="state.hoverDay"
                        :weeksRowNum="state.maxWeekNum"
                        :offsetRangeStart="state.offsetRangeStart"
                        :offsetRangeEnd="state.offsetRangeEnd"
                        :onDayClick="handleDayClick"
                    >
                        <template v-if="$slots.date" #date="slotProps">
                            <slot name="date" v-bind="slotProps" />
                        </template>
                    </Panel>
                </template>
            </div>
        </div>
        <QuickControl
            v-if="presetPosition === 'right' && renderQuickControls"
            :presets="presets"
            :presetPosition="presetPosition"
            :onPresetClick="handlePresetClick"
            :type="type"
            :insetInput="insetInput"
            :locale="locale"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick, useAttrs } from 'vue';
import classNames from 'classnames';
import { noop, stubFalse, isFunction } from 'lodash-es';
import { addMonths, isSameDay, parse } from 'date-fns';
import MonthsGridFoundation from '@douyinfe/semi-foundation/datePicker/monthsGridFoundation';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import { getDefaultFormatTokenByType } from '@douyinfe/semi-foundation/datePicker/_utils/getDefaultFormatToken';
import getDefaultPickerDate from '@douyinfe/semi-foundation/datePicker/_utils/getDefaultPickerDate';
import { useBaseComponent, useFoundation } from '../_utils';
import Month from './Month.vue';
import QuickControl from './QuickControl.vue';
import YearAndMonth from './YearAndMonth.vue';
import Combobox from '../timePicker/Combobox.vue';
import type { MonthsGridProps } from './interface';
import type {
    MonthsGridAdapter,
    MonthInfo,
    PanelType,
} from '@douyinfe/semi-foundation/datePicker/monthsGridFoundation';

import Panel from './Panel.vue';

defineOptions({
    name: 'MonthsGrid',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<MonthsGridProps>(), {
    type: 'date',
    multiple: false,
    weekStartsOn: 0,
    disabledDate: stubFalse,
    disabledTime: () => ({}),
    onMaxSelect: noop,
    onChange: noop,
    onPanelChange: noop,
    rangeStart: '',
    isControlledComponent: false,
    locale: undefined,
    localeCode: '',
    autoSwitchDate: true,
    density: 'default',
    syncSwitchMonth: false,
    rangeInputFocus: false,
    initialValue: () => [],
    setRangeInputFocus: noop,
    isAnotherPanelHasOpened: () => false,
});

const attrs = useAttrs();

const mergedProps = computed(() => ({
    ...props,
    ...(attrs as any),
}));

const prefixCls = cssClasses.PREFIX;
const monthGridRef = ref<HTMLDivElement | null>(null);

const validFormat = computed(() => props.format || getDefaultFormatTokenByType(props.type));
const { nowDate, nextDate: rawNextDate } = getDefaultPickerDate({
    defaultPickerValue: props.defaultPickerValue,
    format: validFormat.value,
    dateFnsLocale: props.dateFnsLocale,
});
const nextDate =
    isSameDay(nowDate, rawNextDate) ||
    (rawNextDate.getFullYear() === nowDate.getFullYear() && rawNextDate.getMonth() === nowDate.getMonth())
        ? addMonths(nowDate, 1)
        : rawNextDate;

const state = reactive({
    selected: new Set<string>(),
    monthLeft: {
        pickerDate: nowDate,
        showDate: nowDate,
        isTimePickerOpen: false,
        isYearPickerOpen: false,
    } as MonthInfo,
    monthRight: {
        pickerDate: nextDate,
        showDate: nextDate,
        isTimePickerOpen: false,
        isYearPickerOpen: false,
    } as MonthInfo,
    maxWeekNum: 0,
    hoverDay: '',
    rangeStart: props.rangeStart,
    rangeEnd: '',
    currentPanelHeight: 0,
    offsetRangeStart: '',
    offsetRangeEnd: '',
});

// 保存最近点击的 day 对象，用于在解析失败时恢复
const lastClickedDay = ref<{ fullDate: string; fullValidDate?: Date } | null>(null);

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter: MonthsGridAdapter = {
    ...baseAdapter,
    getStates: () => state,
    getProps: () => {
        const p = { ...props, ...(attrs as any) };
        if (p.initialValue) {
            (p as any).defaultValue = p.initialValue;
            (p as any).value = p.initialValue;
        }
        return p;
    },
    getState: (key: string) => (state as any)[key],
    updateDaySelected: (selected: Set<string>) => {
        state.selected.clear();
        selected.forEach((item) => state.selected.add(item));
    },
    setRangeStart: (rangeStart: string) => {
        state.rangeStart = rangeStart;
    },
    setRangeEnd: (rangeEnd: string) => {
        state.rangeEnd = rangeEnd;
    },
    setHoverDay: (hoverDay: string) => {
        state.hoverDay = hoverDay;
    },
    setWeeksHeight: (maxWeekNum: number) => {
        state.maxWeekNum = maxWeekNum;
    },
    setOffsetRangeStart: (offsetRangeStart: string) => {
        state.offsetRangeStart = offsetRangeStart;
    },
    setOffsetRangeEnd: (offsetRangeEnd: string) => {
        state.offsetRangeEnd = offsetRangeEnd;
    },
    updateMonthOnLeft: (v: MonthInfo) => {
        if (v.pickerDate !== undefined) state.monthLeft.pickerDate = v.pickerDate;
        if (v.showDate !== undefined) state.monthLeft.showDate = v.showDate;
        if (v.isTimePickerOpen !== undefined) state.monthLeft.isTimePickerOpen = v.isTimePickerOpen;
        if (v.isYearPickerOpen !== undefined) state.monthLeft.isYearPickerOpen = v.isYearPickerOpen;
    },
    updateMonthOnRight: (v: MonthInfo) => {
        if (v.pickerDate !== undefined) state.monthRight.pickerDate = v.pickerDate;
        if (v.showDate !== undefined) state.monthRight.showDate = v.showDate;
        if (v.isTimePickerOpen !== undefined) state.monthRight.isTimePickerOpen = v.isTimePickerOpen;
        if (v.isYearPickerOpen !== undefined) state.monthRight.isYearPickerOpen = v.isYearPickerOpen;
    },
    notifySelectedChange: (value, options) => {
        console.log('[MonthsGrid notifySelectedChange]', {
            value,
            valueLength: value?.length,
            valueDetails: value?.map((v, i) => ({
                index: i,
                value: v,
                type: typeof v,
                isDate: v instanceof Date,
                isDateObject: Object.prototype.toString.call(v) === '[object Date]',
                isValid: v instanceof Date ? !isNaN(v.getTime()) : false,
                time: v instanceof Date ? v.getTime() : 'N/A',
            })),
            options,
            dateFnsLocale: props.dateFnsLocale,
            type: props.type,
            format: props.format,
            selected: Array.from(state.selected),
        });

        // 如果 value 包含 null，尝试从 selected 状态或最近点击的 day 对象中重新解析日期
        let fixedValue = value;
        if (value && value.length > 0 && value.some((v) => v === null || v === undefined)) {
            console.log('[MonthsGrid notifySelectedChange] 检测到 null 值，尝试重新解析', {
                selected: Array.from(state.selected),
                lastClickedDay: lastClickedDay.value,
            });

            // 优先使用 lastClickedDay 的 fullValidDate
            if (lastClickedDay.value?.fullValidDate) {
                console.log(
                    '[MonthsGrid notifySelectedChange] 使用 lastClickedDay.fullValidDate',
                    lastClickedDay.value.fullValidDate
                );
                fixedValue = [lastClickedDay.value.fullValidDate];
            } else if (lastClickedDay.value?.fullDate) {
                // 如果没有 fullValidDate，尝试解析 fullDate
                try {
                    const parsed = parse(lastClickedDay.value.fullDate, strings.FORMAT_FULL_DATE, new Date(), {
                        locale: props.dateFnsLocale,
                    });
                    if (!isNaN(parsed.getTime())) {
                        console.log('[MonthsGrid notifySelectedChange] 从 fullDate 解析成功', parsed);
                        fixedValue = [parsed];
                    }
                } catch (e) {
                    console.warn(
                        '[MonthsGrid notifySelectedChange] 从 fullDate 解析失败',
                        lastClickedDay.value.fullDate,
                        e
                    );
                }
            } else {
                // 尝试从 selected 状态中重新解析
                const selectedArray = Array.from(state.selected);
                if (selectedArray.length > 0 && selectedArray[0]) {
                    try {
                        const parsed = parse(selectedArray[0], strings.FORMAT_FULL_DATE, new Date(), {
                            locale: props.dateFnsLocale,
                        });
                        if (!isNaN(parsed.getTime())) {
                            console.log('[MonthsGrid notifySelectedChange] 从 selected 状态解析成功', parsed);
                            fixedValue = [parsed];
                        }
                    } catch (e) {
                        console.warn('[MonthsGrid notifySelectedChange] 从 selected 状态解析失败', selectedArray[0], e);
                    }
                }
            }

            console.log('[MonthsGrid notifySelectedChange] 重新解析后的值', {
                fixedValue,
                fixedValueLength: fixedValue?.length,
            });

            // 重要：如果是引用传递，尝试修改原数组，以便 Foundation 后续逻辑（如 _mergeDateAndTime）能使用正确的值
            if (fixedValue !== value && Array.isArray(value) && Array.isArray(fixedValue)) {
                try {
                    value.splice(0, value.length, ...fixedValue);
                    console.log('[MonthsGrid notifySelectedChange] 已修改原数组引用', value);
                } catch (e) {
                    console.error('[MonthsGrid notifySelectedChange] 修改原数组失败', e);
                }
            }
        }

        props.onChange(fixedValue, options);
    },
    notifyMaxLimit: (v) => props.onMaxSelect(v),
    notifyPanelChange: (date, dateString) => props.onPanelChange(date, dateString),
    setRangeInputFocus: (rangeInputFocus) => {
        const fn = (attrs as any).setRangeInputFocus || props.setRangeInputFocus;
        fn?.(rangeInputFocus);
    },
    isAnotherPanelHasOpened: (currentRangeInput) => {
        const fn = (attrs as any).isAnotherPanelHasOpened || props.isAnotherPanelHasOpened;
        return fn?.(currentRangeInput) || false;
    },
};

const { foundation } = useFoundation(MonthsGridFoundation, adapter);

const monthGridCls = computed(() => classNames(`${prefixCls}-month-grid`));

const panelTypeLeft = strings.PANEL_TYPE_LEFT;
const panelTypeRight = strings.PANEL_TYPE_RIGHT;

const yearOpenType = computed(() => foundation.getYAMOpenType?.() || '');

const presets = computed(() => props.presets || []);
const presetPosition = computed(() => props.presetPosition || 'bottom');
const insetInput = computed(() => props.insetInput || false);
const locale = computed(() => props.locale || {});
const renderQuickControls = computed(() => props.renderQuickControls);
const renderDateInput = computed(() => props.renderDateInput);

const monthLeft = computed(() => state.monthLeft);
const monthRight = computed(() => state.monthRight);
const type = computed(() => props.type || (attrs as any).type);

const handlePresetClick = (item: any, e: MouseEvent) => {
    props.onPresetClick?.(item, e);
};

const handleShowYearPicker = (panelType: PanelType, e: MouseEvent) => {
    e.stopImmediatePropagation();
    foundation.showYearPicker(panelType);
};

const handleDayClick = (day: any, panelType: PanelType) => {
    // 保存最近点击的 day 对象，用于在解析失败时恢复
    lastClickedDay.value = day;
    foundation.handleDayClick(day, panelType);
};

const handleDayHover = (day: any, panelType: PanelType) => {
    foundation.handleDayHover(day, panelType);
};

const handleWeeksRowNumChange = (weeksRowNum: number, panelType: PanelType) => {
    const isLeft = panelType === panelTypeLeft;
    const isRight = panelType === panelTypeRight;
    const allIsYearOrTime = leftIsYearOrTime() && rightIsYearOrTime();

    if (foundation.isRangeType?.() && !allIsYearOrTime) {
        state.maxWeekNum = weeksRowNum;
    }
};

const leftIsYearOrTime = () => {
    const { monthLeft } = state;
    return monthLeft && (monthLeft.isTimePickerOpen || monthLeft.isYearPickerOpen);
};

const rightIsYearOrTime = () => {
    const { monthRight } = state;
    return monthRight && (monthRight.isTimePickerOpen || monthRight.isYearPickerOpen);
};

const handlePrevMonth = (panelType: PanelType) => {
    foundation.prevMonth(panelType);
};

const handleNextMonth = (panelType: PanelType) => {
    foundation.nextMonth(panelType);
};

const handlePrevYear = (panelType: PanelType) => {
    foundation.prevYear(panelType);
};

const handleNextYear = (panelType: PanelType) => {
    foundation.nextYear(panelType);
};

const handleShowDatePanel = (panelType: PanelType) => {
    foundation.showDatePanel(panelType);
};

const handleShowTimePicker = (panelType: PanelType, open: boolean) => {
    foundation.showTimePicker(panelType, open);
};

const handleTimeChange = (newTime: any, panelType: PanelType) => {
    foundation.handleTimeChange(newTime, panelType);
};

const handleYearMonthSelect = (item: any, panelType: PanelType) => {
    foundation.toYearMonth(panelType, new Date(item.currentYear.left, item.currentMonth.left - 1));
};

onMounted(() => {
    nextTick(() => {
        const initialValue = props.initialValue || (attrs as any).initialValue;
        if (initialValue && Array.isArray(initialValue) && initialValue.length > 0) {
            foundation.updateSelectedFromProps(initialValue);
        }
    });
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => props.initialValue || (attrs as any).initialValue,
    (newVal) => {
        if (newVal && Array.isArray(newVal) && newVal.length > 0) {
            foundation.updateSelectedFromProps(newVal);
        }
    },
    { deep: true }
);

defineExpose({
    monthGridRef,
    foundation,
});
</script>
