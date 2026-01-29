<template>
    <div v-if="!noBackBtn" :class="headerCls">
        <IconButton :noHorizontalPadding="false" :size="buttonSize" @click="handleBackToMain">
            <IconChevronLeft :size="iconSize" aria-hidden />
            <span>{{ selectDateText }}</span>
        </IconButton>
    </div>
    <div v-if="props.presetPosition" style="display: flex">
        <QuickControl
            v-if="presetPosition === 'left' && type !== 'monthRange' && renderQuickControls"
            :presets="presets"
            :presetPosition="presetPosition"
            :onPresetClick="handlePresetClick"
            :type="type"
            :insetInput="insetInput"
            :locale="locale"
        />
        <div>
            <component :is="renderDateInput" v-if="renderDateInput" />
            <!-- type === 'month' 时不需要 bodyCls 包裹 -->
            <Panel
                v-if="type === 'month'"
                :panelType="panelTypeLeft"
                :state="state"
                :props="props"
                :foundation="foundation"
            />
            <!-- type === 'year' 或 'monthRange' 时需要 bodyCls 包裹两个面板 -->
            <div v-else :class="bodyCls">
                <Panel :panelType="panelTypeLeft" :state="state" :props="props" :foundation="foundation" />
                <Panel :panelType="panelTypeRight" :state="state" :props="props" :foundation="foundation" />
            </div>
        </div>
        <QuickControl
            v-if="presetPosition === 'right' && type !== 'monthRange' && renderQuickControls"
            :presets="presets"
            :presetPosition="presetPosition"
            :onPresetClick="handlePresetClick"
            :type="type"
            :insetInput="insetInput"
            :locale="locale"
        />
    </div>
    <template v-else>
        <component :is="renderDateInput" v-if="renderDateInput" />
        <!-- type === 'month' 时不需要 bodyCls 包裹 -->
        <Panel
            v-if="type === 'month'"
            :panelType="panelTypeLeft"
            :state="state"
            :props="props"
            :foundation="foundation"
        />
        <!-- type === 'year' 或 'monthRange' 时需要 bodyCls 包裹两个面板 -->
        <div v-else :class="bodyCls">
            <Panel :panelType="panelTypeLeft" :state="state" :props="props" :foundation="foundation" />
            <Panel :panelType="panelTypeRight" :state="state" :props="props" :foundation="foundation" />
        </div>
    </template>
</template>

<script setup lang="ts">
import {
    ref,
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    h,
    defineComponent,
    type PropType,
    useAttrs,
} from 'vue';
import { noop, stubFalse, isEqual, isFunction } from 'lodash-es';
import { setMonth, setYear, set } from 'date-fns';
import IconButton from '../iconButton/IconButton.vue';
import { IconChevronLeft } from '../icons';
import ScrollList from '../scrollList/ScrollList.vue';
import ScrollItem from '../scrollList/ScrollItem.vue';
import QuickControl from './QuickControl.vue';
import YearAndMonthFoundation from '@douyinfe/semi-foundation/datePicker/yearAndMonthFoundation';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import { getYearAndMonth, getYears } from '@douyinfe/semi-foundation/datePicker/_utils/index';
import { useBaseComponent, useFoundation } from '../_utils';
import type { YearAndMonthProps } from './interface';
import type {
    YearAndMonthAdapter,
    YearScrollItem,
    MonthScrollItem,
} from '@douyinfe/semi-foundation/datePicker/yearAndMonthFoundation';
import type { PanelType } from '@douyinfe/semi-foundation/datePicker/monthsGridFoundation';

defineOptions({
    name: 'DatePickerYearAndMonth',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<YearAndMonthProps>(), {
    disabledDate: stubFalse,
    monthCycled: false,
    yearCycled: false,
    noBackBtn: false,
    onSelect: noop,
    onBackToMain: noop,
    type: 'month',
    locale: () => ({}) as any,
    localeCode: '',
    density: 'default',
    presetPosition: undefined,
    renderQuickControls: null,
    renderDateInput: null,
    yearAndMonthOpts: undefined,
    startYear: undefined,
    endYear: undefined,
});

const attrs = useAttrs();

const prefixCls = cssClasses.PREFIX;
const now = new Date();

const { currentYear, currentMonth } = props;
const defaultYear = { left: now.getFullYear(), right: now.getFullYear() };
const defaultMonth = { left: now.getMonth() + 1, right: now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2 };
const { year, month } = getYearAndMonth(currentYear || defaultYear, currentMonth || defaultMonth);

// State
const state = reactive({
    years: getYears(props.startYear, props.endYear).map((year) => ({
        value: year,
        year,
    })),
    months: Array(12)
        .fill(0)
        .map((v, idx) => ({
            value: idx + 1,
            month: idx + 1,
        })),
    currentYear: { left: year.left, right: year.right },
    currentMonth: { left: month.left, right: month.right },
});

const yearRef = ref<any>(null);
const monthRef = ref<any>(null);

const { adapter: baseAdapter } = useBaseComponent(props, state);

// Adapter
const adapter: YearAndMonthAdapter = {
    ...baseAdapter,
    getProps: () => {
        const allProps = baseAdapter.getProps() as any;
        // 确保 disabledDate 始终是函数
        if (typeof allProps.disabledDate !== 'function') {
            allProps.disabledDate = stubFalse;
        }
        return allProps;
    },
    setCurrentYear: (currentYear: { left: number; right: number }, cb?: () => void) => {
        state.currentYear = currentYear;
        if (cb) cb();
    },
    setCurrentMonth: (currentMonth: { left: number; right: number }) => {
        state.currentMonth = currentMonth;
    },
    setCurrentYearAndMonth: (
        currentYear: { left: number; right: number },
        currentMonth: { left: number; right: number }
    ) => {
        state.currentYear = currentYear;
        state.currentMonth = currentMonth;
    },
    notifySelectYear: (year: { left: number; right: number }) => {
        props.onSelect?.({
            currentMonth: state.currentMonth,
            currentYear: year,
        });
    },
    notifySelectMonth: (month: { left: number; right: number }) => {
        props.onSelect?.({
            currentYear: state.currentYear,
            currentMonth: month,
        });
    },
    notifySelectYearAndMonth: (year: { left: number; right: number }, month: { left: number; right: number }) => {
        props.onSelect?.({
            currentYear: year,
            currentMonth: month,
        });
    },
    notifyBackToMain: () => props.onBackToMain?.(),
};

const { foundation } = useFoundation(YearAndMonthFoundation, adapter);

// Computed
const headerCls = computed(() => `${prefixCls}-yearmonth-header`);
const bodyCls = computed(() => `${prefixCls}-yearmonth-body`);

const selectDateText = computed(() => props.locale?.selectDate || '');
const iconSize = computed(() => (props.density === 'compact' ? 'default' : 'large'));
const buttonSize = computed(() => (props.density === 'compact' ? 'small' : 'default'));

const panelTypeLeft = strings.PANEL_TYPE_LEFT;
const panelTypeRight = strings.PANEL_TYPE_RIGHT;

const presets = computed(() => (props as any).presets || []);
const presetPosition = computed(() => props.presetPosition);
const insetInput = computed(() => (props as any).insetInput || false);
const locale = computed(() => props.locale || {});
const renderQuickControls = computed(() => props.renderQuickControls);
const renderDateInput = computed(() => props.renderDateInput);
const type = computed(() => {
    // 优先使用 props.type，如果不存在则使用 attrs.type，最后使用默认值
    return props.type || (attrs.type as string) || 'month';
});

// 使用 attrs.noBackBtn 作为后备，但只在主面板（type 是 month/year/monthRange）时使用
const noBackBtn = computed(() => {
    // 如果 props.noBackBtn 有值，直接使用
    if (props.noBackBtn !== undefined) {
        return props.noBackBtn;
    }
    // 如果 attrs.noBackBtn 有值，使用它
    if (attrs.noBackBtn !== undefined) {
        return attrs.noBackBtn as boolean;
    }
    // 默认值：只有在主面板（type 是 month/year/monthRange）时才隐藏按钮
    // 从日期选择面板中打开的年月选择应该显示按钮
    return false;
});

const Panel = defineComponent({
    name: 'YearAndMonthPanel',
    props: {
        panelType: { type: String as PropType<PanelType>, required: true },
        state: { type: Object, required: true },
        props: { type: Object, required: true },
        foundation: { type: Object, required: true },
    },
    setup(panelProps) {
        const renderColYear = (panelType: PanelType) => {
            const { state, props: propsData, foundation: foundationInstance } = panelProps;
            const { years, currentYear, currentMonth, months } = state;
            const { disabledDate, localeCode, yearCycled, yearAndMonthOpts } = propsData;
            const currentDate = setMonth(new Date(), currentMonth[panelType] - 1);
            const left = strings.PANEL_TYPE_LEFT;
            const right = strings.PANEL_TYPE_RIGHT;

            const needDisabled = (year: number) => {
                if (panelType === right && currentYear[left]) {
                    return currentYear[left] > year;
                }
                return false;
            };

            const list: any[] = years.map(({ value, year }) => {
                const isAllMonthDisabled =
                    typeof disabledDate === 'function' &&
                    months.every(({ month }) => {
                        return disabledDate(set(currentDate, { year, month: month - 1 }));
                    });
                const isRightPanelDisabled = needDisabled(year);
                return {
                    year,
                    value,
                    disabled: isAllMonthDisabled || isRightPanelDisabled,
                };
            });

            let transform = (val: string) => val;
            if (localeCode === 'zh-CN' || localeCode === 'zh-TW') {
                transform = (val) => `${val}年`;
            }

            return h(ScrollItem, {
                ref: panelType === left ? 'yearRefLeft' : 'yearRefRight',
                cycled: yearCycled,
                list,
                transform,
                selectedIndex: years.findIndex((item) => item.value === currentYear[panelType]),
                type: 'year',
                onSelect: (item: YearScrollItem) => {
                    foundationInstance.selectYear?.(item, panelType);
                },
                mode: 'normal',
                ...yearAndMonthOpts,
            });
        };

        const renderColMonth = (panelType: PanelType) => {
            const { state, props: propsData, foundation: foundationInstance } = panelProps;
            const { months, currentMonth, currentYear } = state;
            const { locale, localeCode, monthCycled, disabledDate, yearAndMonthOpts } = propsData;
            let transform = (val: string) => val;
            const currentDate = setYear(new Date(), currentYear[panelType]);
            const left = strings.PANEL_TYPE_LEFT;
            const right = strings.PANEL_TYPE_RIGHT;

            if (localeCode === 'zh-CN' || localeCode === 'zh-TW') {
                transform = (val) => `${val}月`;
            }

            const list: MonthScrollItem[] = months.map(({ value, month }) => {
                const isRightPanelDisabled =
                    panelType === right &&
                    currentMonth[left] &&
                    currentYear[left] === currentYear[right] &&
                    currentMonth[left] > month;
                const isDisabled =
                    typeof disabledDate === 'function' ? disabledDate(setMonth(currentDate, month - 1)) : false;
                return {
                    month,
                    disabled: isDisabled || isRightPanelDisabled,
                    value: locale.fullMonths?.[value] || value.toString(),
                };
            });

            const selectedIndex = list.findIndex((item) => item.month === currentMonth[panelType]);

            return h(ScrollItem, {
                ref: panelType === left ? 'monthRefLeft' : 'monthRefRight',
                cycled: monthCycled,
                list,
                transform,
                selectedIndex,
                type: 'month',
                onSelect: (item: MonthScrollItem) => {
                    foundationInstance.selectMonth?.(item, panelType);
                },
                mode: 'normal',
                ...yearAndMonthOpts,
            });
        };

        return () => {
            const { panelType } = panelProps;
            return h(
                ScrollList,
                {},
                {
                    default: () => [renderColYear(panelType), renderColMonth(panelType)],
                }
            );
        };
    },
});

const handleBackToMain = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    const onBackToMain = (attrs.onBackToMain as (() => void) | undefined) || props.onBackToMain;
    if (onBackToMain && onBackToMain !== noop) {
        onBackToMain();
    } else {
        foundation.backToMain?.();
    }
};

const handlePresetClick = (item: any, e: MouseEvent) => {
    (props as any).onPresetClick?.(item, e);
};

const selectYear = (item: YearScrollItem, panelType?: PanelType) => {
    foundation.selectYear?.(item, panelType);
};

const selectMonth = (item: MonthScrollItem, panelType?: PanelType) => {
    foundation.selectMonth?.(item, panelType);
};

const reselect = () => {
    const refKeys = ['yearRef', 'monthRef'];
    refKeys.forEach((key) => {
        const ref = (key === 'yearRef' ? yearRef : monthRef).value;
        if (ref && ref.scrollToIndex) {
            ref.scrollToIndex();
        }
    });
};

onMounted(() => {
    foundation.init?.();
});

onUnmounted(() => {
    foundation.destroy?.();
});

watch(
    () => props.currentYear,
    (val) => {
        if (val && !isEqual(val, state.currentYear)) {
            const { year } = getYearAndMonth(val, props.currentMonth || defaultMonth);
            state.currentYear = year;
        }
    },
    { deep: true }
);

watch(
    () => props.currentMonth,
    (val) => {
        if (val && !isEqual(val, state.currentMonth)) {
            const { month } = getYearAndMonth(props.currentYear || defaultYear, val);
            state.currentMonth = month;
        }
    },
    { deep: true }
);

defineExpose({
    yearRef,
    monthRef,
    reselect,
    foundation,
});
</script>
