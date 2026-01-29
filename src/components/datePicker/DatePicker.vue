<template>
    <div
        ref="datePickerRef"
        :class="wrapperClass"
        :style="props.style"
        :aria-invalid="props['aria-invalid']"
        :aria-errormessage="props['aria-errormessage']"
        :aria-labelledby="props['aria-labelledby']"
        :aria-describedby="props['aria-describedby']"
        :aria-required="props['aria-required']"
        v-bind="getDataAttr(attrs)"
    >
        <Popover
            ref="popoverRef"
            :getPopupContainer="props.getPopupContainer"
            :zIndex="props.zIndex as any"
            :trigger="'custom'"
            :position="position"
            :visible="isOpen"
            :motion="props.motion as any"
            :margin="props.dropdownMargin as any"
            :autoAdjustOverflow="props.autoAdjustOverflow"
            :stopPropagation="props.stopPropagation"
            :spacing="props.spacing as any"
            @visible-change="handlePanelVisibleChange"
        >
            <template #content>
                <div ref="panelRef" :class="panelWrapCls" :style="props.dropdownStyle">
                    <div :class="`${props.prefixCls}-container`">
                        <div
                            v-if="slots.leftSlot || props.leftSlot"
                            :class="`${props.prefixCls}-leftSlot`"
                            x-semi-prop="leftSlot"
                        >
                            <slot v-if="slots.leftSlot" name="leftSlot" />
                            <component :is="props.leftSlot" v-else-if="props.leftSlot" />
                        </div>

                        <div>
                            <div
                                v-if="slots.topSlot || props.topSlot"
                                :class="`${props.prefixCls}-topSlot`"
                                x-semi-prop="topSlot"
                            >
                                <slot v-if="slots.topSlot" name="topSlot" />
                                <component :is="props.topSlot" v-else-if="props.topSlot" />
                            </div>

                            <YearAndMonth
                                v-if="adapter.typeIsYearOrMonth()"
                                :locale="localeValue"
                                :localeCode="localeCodeValue"
                                :disabledDate="disabledDisposeDate"
                                :monthCycled="true"
                                :onSelect="handleYMSelectedChange"
                                :currentYear="yearMonthPanelYear"
                                :currentMonth="yearMonthPanelMonth"
                                :density="props.density"
                                :presetPosition="props.presetPosition"
                                :renderQuickControls="renderQuickControls()"
                                :renderDateInput="renderDateInput()"
                                :startYear="props.startYear"
                                :endYear="props.endYear"
                                :type="props.type"
                                :noBackBtn="true"
                                v-bind="yearAndMonthOptsFiltered"
                            />

                            <MonthsGrid
                                v-else
                                ref="monthGridRef"
                                :locale="localeValue"
                                :localeCode="localeCodeValue"
                                :dateFnsLocale="dateFnsLocaleValue"
                                :weekStartsOn="props.weekStartsOn"
                                :type="props.type"
                                :multiple="props.multiple"
                                :max="props.max"
                                :format="props.format"
                                :disabledDate="disabledDisposeDate"
                                :hideDisabledOptions="props.hideDisabledOptions"
                                :disabledTimePicker="props.disabledTimePicker"
                                :disabledTime="disabledDisposeTime"
                                :initialValue="defaultValueForGrid"
                                :defaultPickerValue="props.defaultPickerValue"
                                :timePickerOpts="props.timePickerOpts"
                                :isControlledComponent="!adapter.needConfirm() && isControlled('value')"
                                :onChange="handleSelectedChange"
                                :renderDate="props.renderDate"
                                :renderFullDate="props.renderFullDate"
                                :startDateOffset="props.startDateOffset"
                                :endDateOffset="props.endDateOffset"
                                :autoSwitchDate="props.autoSwitchDate"
                                :density="props.density"
                                :rangeInputFocus="state.rangeInputFocus"
                                :setRangeInputFocus="handleSetRangeFocus"
                                :isAnotherPanelHasOpened="isAnotherPanelHasOpened"
                                :syncSwitchMonth="props.syncSwitchMonth"
                                :onPanelChange="props.onPanelChange"
                                :timeZone="props.timeZone"
                                :focusRecordsRef="focusRecordsRef"
                                :triggerRender="props.triggerRender"
                                :insetInput="props.insetInput"
                                :presetPosition="props.presetPosition"
                                :renderQuickControls="renderQuickControls()"
                                :renderDateInput="renderDateInput()"
                                :yearAndMonthOpts="props.yearAndMonthOpts"
                                :startYear="props.startYear"
                                :endYear="props.endYear"
                            >
                                <template v-if="slots.date" #date="slotProps">
                                    <slot name="date" v-bind="slotProps" />
                                </template>
                                <template v-if="slots.fullDate" #fullDate="slotProps">
                                    <slot name="fullDate" v-bind="slotProps" />
                                </template>
                            </MonthsGrid>

                            <div
                                v-if="slots.bottomSlot || props.bottomSlot"
                                :class="`${props.prefixCls}-bottomSlot`"
                                x-semi-prop="bottomSlot"
                            >
                                <slot v-if="slots.bottomSlot" name="bottomSlot" />
                                <component :is="props.bottomSlot" v-else-if="props.bottomSlot" />
                            </div>
                        </div>

                        <div
                            v-if="slots.rightSlot || props.rightSlot"
                            :class="`${props.prefixCls}-rightSlot`"
                            x-semi-prop="rightSlot"
                        >
                            <slot v-if="slots.rightSlot" name="rightSlot" />
                            <component :is="props.rightSlot" v-else-if="props.rightSlot" />
                        </div>
                    </div>

                    <Footer
                        v-if="adapter.needConfirm()"
                        :prefixCls="props.prefixCls"
                        :locale="localeValue"
                        :localeCode="localeCodeValue"
                        :onCancel="handleCancel"
                        :onConfirm="handleConfirm"
                    />
                </div>
            </template>
            <div
                role="combobox"
                :aria-label="ariaLabel"
                :aria-disabled="props.disabled"
                :class="inputClass"
                @click="handleInputClick"
            >
                <Trigger
                    v-if="typeof props.triggerRender === 'function'"
                    :triggerRender="props.triggerRender"
                    componentName="DatePicker"
                    :componentProps="props"
                    v-bind="triggerProps"
                />
                <DateInput v-else v-bind="inputProps" :input-value="state.inputValue" />
            </div>
        </Popover>
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
    useAttrs,
    useSlots,
    isRef,
    getCurrentInstance,
    nextTick,
} from 'vue';
import classNames from 'classnames';
import { noop, isFunction, isEqual, stubFalse } from 'lodash-es';
import Popover from '../popover/index';
import DateInput from './DateInput.vue';
import MonthsGrid from './MonthsGrid.vue';
import YearAndMonth from './YearAndMonth.vue';
import Footer from './Footer.vue';
import Trigger from '../trigger/index';
import DatePickerFoundation from '@douyinfe/semi-foundation/datePicker/foundation';
import { cssClasses, strings, numbers } from '@douyinfe/semi-foundation/datePicker/constants';
import { numbers as popoverNumbers } from '@douyinfe/semi-foundation/popover/constants';
import { useBaseComponent, useFoundation } from '../_utils';
import { useConfigContext } from '../configProvider/context';
import { useLocale } from '../_utils/useLocale';
// DatePicker specific constants
const FOCUS_DELAY_MS = 0;
import type { DatePickerProps } from './interface';
import type { DatePickerAdapter } from '@douyinfe/semi-foundation/datePicker/foundation';
import type { Position } from '../tooltip';

defineOptions({
    name: 'DatePicker',
    inheritAttrs: false,
});

// 支持 v-model
const modelValue = defineModel<Date | Date[] | string | string[] | undefined>();

const props = withDefaults(defineProps<DatePickerProps>(), {
    onChangeWithDateFirst: true,
    borderless: false,
    autoAdjustOverflow: true,
    stopPropagation: true,
    motion: true,
    prefixCls: cssClasses.PREFIX,
    presetPosition: 'bottom',
    zIndex: popoverNumbers.DEFAULT_Z_INDEX,
    type: 'date',
    size: 'default',
    density: 'default',
    multiple: false,
    hideDisabledOptions: false,
    showClear: true,
    onBlur: noop,
    onFocus: noop,
    onClear: noop,
    onCancel: noop,
    onConfirm: noop,
    onChange: noop,
    onOpenChange: noop,
    onPanelChange: noop,
    onPresetClick: noop,
    weekStartsOn: numbers.WEEK_START_ON,
    disabledDate: stubFalse,
    disabledTime: () => ({}),
    inputReadOnly: false,
    spacing: numbers.SPACING,
    autoSwitchDate: true,
    syncSwitchMonth: false,
    rangeSeparator: strings.DEFAULT_SEPARATOR_RANGE,
    insetInput: false,
    onClickOutSide: noop,
    getPopupContainer: () => document.body,
    style: () => ({}),
    dropdownStyle: () => ({}),
});

const attrs = useAttrs();
const slots = useSlots();
const instance = getCurrentInstance();
const configContext = useConfigContext();

const getPassedProps = () => {
    const vnode = instance?.vnode;
    const passedProps = vnode?.props || {};
    const result: Record<string, any> = { ...props };

    // 优先使用 modelValue (v-model)，如果没有则使用 value prop
    if (modelValue.value !== undefined) {
        result.value = modelValue.value;
    }

    const controlledKeys = ['open', 'value'];

    for (const key of controlledKeys) {
        const propKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        // 如果使用 v-model，value 已经被设置，不需要删除
        if (key === 'value' && modelValue.value !== undefined) {
            continue;
        }
        if (!(key in passedProps) && !(propKey in passedProps)) {
            delete result[key];
        }
    }

    return result;
};

const localeConfig = useLocale({
    componentName: 'DatePicker',
    locale: props.locale,
    localeCode: props.localeCode,
    dateFnsLocale: props.dateFnsLocale,
});

const isRangeTypeHelper = (type: string, triggerRender?: any) => {
    return /range/i.test(type) && !isFunction(triggerRender);
};

const state = reactive({
    panelShow: props.open || props.defaultOpen || false,
    isRange: false,
    inputValue: null as string | null,
    value: [] as Date[],
    cachedSelectedValue: [] as (Date | null)[],
    prevTimeZone: null as string | number | null,
    rangeInputFocus: undefined as 'rangeStart' | 'rangeEnd' | false | undefined,
    autofocus:
        props.autoFocus ||
        (isRangeTypeHelper(props.type || '', props.triggerRender) && (props.open || props.defaultOpen)) ||
        false,
    insetInputValue: null as any,
    triggerDisabled: undefined as boolean | undefined,
});

const datePickerRef = ref<HTMLDivElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const popoverRef = ref<any>(null);
const inputRef = ref<any>(null);
const rangeInputStartRef = ref<HTMLInputElement | null>(null);
const rangeInputEndRef = ref<HTMLInputElement | null>(null);
const monthGridRef = ref<InstanceType<typeof MonthsGrid> | null>(null);
const focusRecordsRef = ref<{ rangeStart: boolean; rangeEnd: boolean }>({
    rangeStart: false,
    rangeEnd: false,
});

let clickOutSideHandler: ((e: MouseEvent) => void) | null = null;

const emit = defineEmits<{
    (e: 'change', date?: Date | Date[] | string | string[], dateStr?: string | string[] | Date | Date[]): void;
    (e: 'openChange', open: boolean): void;
    (e: 'focus', evt: MouseEvent, rangeType: any): void;
    (e: 'blur', evt: MouseEvent): void;
    (e: 'clear', evt: MouseEvent): void;
    (e: 'cancel', date: Date | Date[], dateStr: string | string[]): void;
    (e: 'confirm', date: Date | Date[], dateStr: string | string[]): void;
    (e: 'panelChange', date: Date | Date[], dateStr: string | string[]): void;
    (e: 'presetClick', item: any, evt: MouseEvent): void;
    (e: 'clickOutSide', evt: MouseEvent): void;
}>();

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const isControlled = (key: string) => {
    return props[key as keyof DatePickerProps] !== undefined;
};

const isRangeType = (type: string, triggerRender?: any) => {
    return /range/i.test(type) && !isFunction(triggerRender);
};

const adapter: DatePickerAdapter = {
    ...baseAdapter,
    getProp: (key: string) => {
        // 特殊处理 value prop，优先返回 modelValue (v-model)
        if (key === 'value') {
            return modelValue.value !== undefined ? modelValue.value : props.value;
        }
        return baseAdapter.getProp(key);
    },
    getProps: () => {
        const passedProps = getPassedProps();
        // 如果使用 v-model，确保 value 在 props 中，即使值是 undefined
        // 这样 _isControlledComponent('value') 才能正确识别为受控组件
        if (modelValue.value !== undefined || 'modelValue' in (instance?.vnode?.props || {})) {
            passedProps.value = modelValue.value;
        }
        return passedProps as any;
    },
    togglePanel: (panelShow: boolean, cb?: () => void) => {
        state.panelShow = panelShow;
        if (cb) cb();
        if (!panelShow) {
            focusRecordsRef.value.rangeEnd = false;
            focusRecordsRef.value.rangeStart = false;
        }
    },
    registerClickOutSide: () => {
        if (clickOutSideHandler) {
            adapter.unregisterClickOutSide();
            clickOutSideHandler = null;
        }
        clickOutSideHandler = (e: MouseEvent) => {
            const triggerEl = datePickerRef.value;
            const panelEl = panelRef.value;
            const target = e.target as Element;
            const path = (e.composedPath && e.composedPath()) || [target];
            if (
                !(triggerEl && triggerEl.contains(target)) &&
                !(panelEl && panelEl.contains(target)) &&
                !(path.includes(triggerEl as any) || path.includes(panelEl as any))
            ) {
                props.onClickOutSide(e as any);
                if (!adapter.needConfirm()) {
                    foundation.closePanel();
                }
            }
        };
        document.addEventListener('mousedown', clickOutSideHandler);
    },
    unregisterClickOutSide: () => {
        if (clickOutSideHandler) {
            document.removeEventListener('mousedown', clickOutSideHandler);
            clickOutSideHandler = null;
        }
    },
    notifyBlur: (e: MouseEvent) => {
        props.onBlur?.(e);
        emit('blur', e);
    },
    notifyFocus: (e: MouseEvent, rangeType: any) => {
        props.onFocus?.(e, rangeType);
        emit('focus', e, rangeType);
    },
    notifyClear: (e: MouseEvent) => {
        props.onClear?.(e);
        emit('clear', e);
    },
    notifyChange: (date?: Date | Date[] | string | string[], dateStr?: string | string[] | Date | Date[]) => {
        console.log('[DatePicker notifyChange] 开始', {
            date,
            dateStr,
            dateType: Array.isArray(date) ? 'array' : typeof date,
            dateStrType: Array.isArray(dateStr) ? 'array' : typeof dateStr,
            modelValueBefore: modelValue.value,
            type: props.type,
            multiple: props.multiple,
            onChangeWithDateFirst: props.onChangeWithDateFirst,
        });

        // 如果使用 v-model，更新 modelValue
        // 检查 modelValue 是否有值，或者是否有 onUpdate:modelValue 事件监听器（说明使用了 v-model）
        if (
            modelValue.value !== undefined ||
            (instance?.vnode?.props &&
                ('modelValue' in instance.vnode.props || 'onUpdate:modelValue' in instance.vnode.props))
        ) {
            // 根据 onChangeWithDateFirst 确定参数顺序
            // 如果 onChangeWithDateFirst 为 true（默认），第一个参数是 Date，第二个是 string
            // 如果 onChangeWithDateFirst 为 false，第一个参数是 string，第二个是 Date
            const onChangeWithDateFirst = props.onChangeWithDateFirst !== false; // 默认为 true
            let actualDate: Date | Date[] | string | string[] | undefined;
            let actualDateStr: string | string[] | Date | Date[] | undefined;

            if (onChangeWithDateFirst) {
                // 第一个参数是日期，第二个是字符串
                actualDate = date;
                actualDateStr = dateStr;
            } else {
                // 第一个参数是字符串，第二个是日期
                actualDate = dateStr;
                actualDateStr = date;
            }

            console.log('[DatePicker notifyChange] 参数解析后', {
                onChangeWithDateFirst,
                actualDate,
                actualDateStr,
                actualDateType: Array.isArray(actualDate) ? 'array' : typeof actualDate,
                actualDateStrType: Array.isArray(actualDateStr) ? 'array' : typeof actualDateStr,
            });

            // 根据 type 和 multiple 转换值的格式
            let convertedDate: Date | Date[] | string | string[] | null = null;

            if (actualDate === undefined || actualDate === null || actualDate === '') {
                convertedDate = null;
            } else if (Array.isArray(actualDate)) {
                // 数组格式：可能是范围选择或多选
                if (props.type === 'dateRange' || props.type === 'dateTimeRange' || props.type === 'monthRange') {
                    // 范围选择：保持数组格式，但确保有开始和结束日期
                    convertedDate =
                        actualDate.length >= 2
                            ? ([actualDate[0], actualDate[1]] as any)
                            : actualDate.length === 1
                              ? ([actualDate[0]] as any)
                              : null;
                } else if (props.multiple) {
                    // 多选：保持数组格式
                    convertedDate = actualDate.length > 0 ? actualDate : null;
                } else {
                    // 单个日期选择但收到数组：取第一个元素
                    convertedDate = actualDate.length > 0 ? actualDate[0] : null;
                }
            } else {
                // 单个值：直接使用
                convertedDate = actualDate;
            }

            console.log('[DatePicker notifyChange] 转换后的值', {
                convertedDate,
                convertedDateType: Array.isArray(convertedDate) ? 'array' : typeof convertedDate,
            });

            modelValue.value = convertedDate as any;

            console.log('[DatePicker notifyChange] modelValue 更新后', {
                modelValueAfter: modelValue.value,
            });

            // 当使用 v-model 时，需要同步更新输入框的显示值
            // 因为 handleSelectedChange 在受控模式下不会更新输入框
            // actualDateStr 是 foundation 格式化后的字符串，直接使用它
            if (actualDateStr !== undefined && actualDateStr !== null && actualDateStr !== '') {
                if (typeof actualDateStr === 'string') {
                    state.inputValue = actualDateStr;
                } else if (Array.isArray(actualDateStr) && actualDateStr.length > 0) {
                    // 如果是数组，根据类型处理
                    if (typeof actualDateStr[0] === 'string') {
                        state.inputValue = actualDateStr.join(props.rangeSeparator || ' ~ ');
                    }
                }
            } else if (actualDate !== undefined && actualDate !== null && actualDate !== '') {
                // 如果没有 dateStr，说明可能是从外部设置的值，需要通过 watch 来处理
                // 这里不做处理，让 watch modelValue 来处理
            }
        }
        // 如果使用 value prop（受控模式），只触发事件，不更新值
        if (props.value !== undefined && modelValue.value === undefined) {
            props.onChange?.(date, dateStr);
            emit('change', date, dateStr);
            return;
        }
        // 如果使用 v-model 或非受控模式，触发事件
        props.onChange?.(date, dateStr);
        emit('change', date, dateStr);
    },
    notifyCancel: (date: Date | Date[], dateStr: string | string[]) => {
        props.onCancel?.(date, dateStr);
        emit('cancel', date, dateStr);
    },
    notifyConfirm: (date: Date | Date[], dateStr: string | string[]) => {
        props.onConfirm?.(date, dateStr);
        emit('confirm', date, dateStr);
    },
    notifyOpenChange: (open: boolean) => {
        props.onOpenChange?.(open);
        emit('openChange', open);
    },
    notifyPresetsClick: (item: any, e: MouseEvent) => {
        props.onPresetClick?.(item, e);
        emit('presetClick', item, e);
    },
    updateValue: (value: Date[]) => {
        state.value = value;
    },
    updatePrevTimezone: (prevTimeZone: string | number) => {
        state.prevTimeZone = prevTimeZone;
    },
    updateCachedSelectedValue: (cachedSelectedValue: Date[]) => {
        let _cachedSelectedValue = cachedSelectedValue;
        if (cachedSelectedValue && !Array.isArray(cachedSelectedValue)) {
            _cachedSelectedValue = [...(cachedSelectedValue as any)];
        }
        state.cachedSelectedValue = _cachedSelectedValue;
    },
    updateInputValue: (inputValue: string) => {
        state.inputValue = inputValue;
    },
    needConfirm: () => {
        return ['dateTime', 'dateTimeRange'].includes(props.type) && props.needConfirm === true;
    },
    typeIsYearOrMonth: () => {
        return ['month', 'year', 'monthRange'].includes(props.type);
    },
    setRangeInputFocus: (rangeInputFocus: any) => {
        const { preventScroll } = props;
        if (rangeInputFocus !== state.rangeInputFocus) {
            state.rangeInputFocus = rangeInputFocus;
        }
        nextTick(() => {
            const rootEl = datePickerRef.value;
            if (!rootEl) return;

            const cls = props.prefixCls;
            const container = rootEl.querySelector(`.${cls}-range-input`);
            if (!container) return;

            switch (rangeInputFocus) {
                case 'rangeStart':
                    const startWrapper = container.querySelector(`.${cls}-range-input-wrapper-start`);
                    const inputStart = startWrapper?.querySelector('input');
                    inputStart && inputStart.focus({ preventScroll } as any);
                    setTimeout(() => {
                        focusRecordsRef.value.rangeStart = true;
                    }, FOCUS_DELAY_MS);
                    break;
                case 'rangeEnd':
                    const endWrapper = container.querySelector(`.${cls}-range-input-wrapper-end`);
                    const inputEnd = endWrapper?.querySelector('input');
                    inputEnd && inputEnd.focus({ preventScroll } as any);
                    setTimeout(() => {
                        focusRecordsRef.value.rangeEnd = true;
                    }, FOCUS_DELAY_MS);
                    break;
                default:
                    return;
            }
        });
    },
    couldPanelClosed: () => {
        return focusRecordsRef.value.rangeStart && focusRecordsRef.value.rangeEnd;
    },
    isEventTarget: (e: any) => {
        return e && e.target === e.currentTarget;
    },
    updateInsetInputValue: (insetInputValue: any) => {
        const { insetInput } = props;
        if (insetInput && !isEqual(insetInputValue, state.insetInputValue)) {
            state.insetInputValue = insetInputValue;
        }
    },
    setInsetInputFocus: () => {
        const { preventScroll } = props;
        const { rangeInputFocus } = state;
        switch (rangeInputFocus) {
            case 'rangeEnd':
                if (document.activeElement !== rangeInputEndRef.value) {
                    const inputEndNode = rangeInputEndRef.value;
                    inputEndNode && inputEndNode.focus({ preventScroll } as any);
                }
                break;
            case 'rangeStart':
            default:
                if (document.activeElement !== rangeInputStartRef.value) {
                    const inputStartNode = rangeInputStartRef.value;
                    inputStartNode && inputStartNode.focus({ preventScroll } as any);
                }
                break;
        }
    },
    setTriggerDisabled: (disabled: boolean) => {
        state.triggerDisabled = disabled;
    },
    setInputFocus: () => {
        const { preventScroll } = props;
        const inputNode = inputRef.value;
        inputNode && inputNode.focus({ preventScroll } as any);
    },
    setInputBlur: () => {
        const inputNode = inputRef.value;
        inputNode && inputNode.blur();
    },
    setRangeInputBlur: () => {
        const { rangeInputFocus } = state;
        if (rangeInputFocus === 'rangeStart') {
            const inputStartNode = rangeInputStartRef.value;
            inputStartNode && inputStartNode.blur();
        } else if (rangeInputFocus === 'rangeEnd') {
            const inputEndNode = rangeInputEndRef.value;
            inputEndNode && inputEndNode.blur();
        }
        adapter.setRangeInputFocus(false);
    },
};

const { foundation } = useFoundation(DatePickerFoundation, adapter);

const yearAndMonthOptsFiltered = computed(() => {
    if (!props.yearAndMonthOpts) {
        return {};
    }
    // 从 yearAndMonthOpts 中排除 type 和 noBackBtn 属性，确保这些属性不会被覆盖
    const { type, noBackBtn, ...rest } = props.yearAndMonthOpts as any;
    // 确保 rest 中不包含 noBackBtn
    delete (rest as any).noBackBtn;
    return rest;
});

const isOpen = computed(() => state.panelShow);

const wrapperClass = computed(() => classNames({ [props.prefixCls]: true }, props.className));

const position = computed(() => {
    const direction = isRef(configContext.direction) ? configContext.direction.value : configContext.direction || 'ltr';
    const defaultPosition = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';
    return (props.position || defaultPosition) as Position;
});

const panelWrapCls = computed(() =>
    classNames(
        cssClasses.PREFIX,
        {
            [cssClasses.PANEL_YAM]: adapter.typeIsYearOrMonth(),
            [`${cssClasses.PREFIX}-compact`]: props.density === 'compact',
        },
        props.dropdownClassName
    )
);

const inputClass = computed(() => {
    const isRange = isRangeType(props.type, props.triggerRender);
    return classNames(`${cssClasses.PREFIX}-input`, {
        [`${cssClasses.PREFIX}-range-input`]: isRange,
        [`${cssClasses.PREFIX}-range-input-${props.size}`]: isRange && props.size,
        [`${cssClasses.PREFIX}-range-input-active`]: isRange && state.rangeInputFocus && !props.disabled,
        [`${cssClasses.PREFIX}-range-input-disabled`]: isRange && props.disabled,
        [`${cssClasses.PREFIX}-range-input-${props.validateStatus}`]: isRange && props.validateStatus,
        [`${cssClasses.PREFIX}-borderless`]: props.borderless,
    });
});

const ariaLabel = computed(() => {
    return Array.isArray(state.value) && state.value.length ? 'Change date' : 'Choose date';
});

const localeValue = computed(() => localeConfig.value.locale);
const localeCodeValue = computed(() => localeConfig.value.localeCode);
const dateFnsLocaleValue = computed(() => localeConfig.value.dateFnsLocale);

const triggerProps = computed(() => {
    const phText = props.placeholder || localeValue.value?.placeholder?.[props.type] || '';
    const inputDisabled = props.disabled || (props.insetInput && state.triggerDisabled);

    const result: Record<string, any> = {
        showClearIgnoreDisabled: Boolean(props.insetInput),
        placeholder: phText,
        disabled: inputDisabled,
        inputValue: state.inputValue,
        value: state.value as Date[],
        defaultPickerValue: props.defaultPickerValue,
        onChange: handleInputChange,
        onEnterPress: handleInputComplete,
        block: true,
        inputStyle: props.inputStyle,
        showClear: props.showClear,
        type: props.type,
        format: props.format,
        multiple: props.multiple,
        validateStatus: props.validateStatus,
        inputReadOnly: props.inputReadOnly || Boolean(props.insetInput),
        onBlur: handleInputBlur,
        onFocus: handleInputFocus,
        onClear: handleInputClear,
        size: props.size,
        autofocus: state.autofocus,
        dateFnsLocale: dateFnsLocaleValue.value,
        rangeInputFocus: state.rangeInputFocus,
        rangeSeparator: props.rangeSeparator,
        onRangeBlur: handleRangeInputBlur,
        onRangeClear: handleRangeInputClear,
        onRangeEndTabPress: handleRangeEndTabPress,
        rangeInputStartRef: props.insetInput ? null : { ref: rangeInputStartRef },
        rangeInputEndRef: props.insetInput ? null : { ref: rangeInputEndRef },
        inputRef: { ref: inputRef },
    };

    if (props.clearIcon !== undefined) {
        result.clearIcon = props.clearIcon;
    }
    if (props.insetLabel !== undefined) {
        result.insetLabel = props.insetLabel;
    }
    if (props.insetLabelId !== undefined) {
        result.insetLabelId = props.insetLabelId;
    }
    if (props.prefix !== undefined) {
        result.prefix = props.prefix;
    }

    return result;
});

const inputProps = computed(() => {
    const phText = props.placeholder || localeValue.value?.placeholder?.[props.type] || '';
    const inputDisabled = props.disabled || (props.insetInput && state.triggerDisabled);

    return {
        ...props,
        showClearIgnoreDisabled: Boolean(props.insetInput),
        placeholder: phText,
        disabled: inputDisabled,
        inputValue: state.inputValue,
        value: state.value,
        defaultPickerValue: props.defaultPickerValue,
        onChange: handleInputChange,
        onEnterPress: handleInputComplete,
        block: true,
        inputStyle: props.inputStyle,
        showClear: props.showClear,
        insetLabel: props.insetLabel,
        insetLabelId: props.insetLabelId,
        type: props.type,
        format: props.format,
        multiple: props.multiple,
        validateStatus: props.validateStatus,
        inputReadOnly: props.inputReadOnly || Boolean(props.insetInput),
        onClick: handleInputClick,
        onBlur: handleInputBlur,
        onFocus: handleInputFocus,
        onClear: handleInputClear,
        prefix: props.prefix,
        size: props.size,
        autofocus: state.autofocus,
        dateFnsLocale: dateFnsLocaleValue.value,
        rangeInputFocus: state.rangeInputFocus,
        rangeSeparator: props.rangeSeparator,
        onRangeBlur: handleRangeInputBlur,
        onRangeClear: handleRangeInputClear,
        onRangeEndTabPress: handleRangeEndTabPress,
        rangeInputStartRef: props.insetInput ? null : { ref: rangeInputStartRef },
        rangeInputEndRef: props.insetInput ? null : { ref: rangeInputEndRef },
        inputRef: { ref: inputRef },
        locale: localeValue.value,
        localeCode: localeCodeValue.value,
    };
});

const handleSelectedChange = (value: Date[], options?: any) => {
    console.log('[DatePicker handleSelectedChange] 开始', {
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
        modelValueBefore: modelValue.value,
        type: props.type,
        multiple: props.multiple,
    });

    // 如果 value 是 [null] 或包含 null，可能是清空操作或解析失败
    // 检查是否所有值都是 null
    const allNull = value && value.length > 0 && value.every((v) => v === null || v === undefined);

    if (allNull) {
        console.log('[DatePicker handleSelectedChange] 检测到所有值都是 null，可能是清空操作');
        // 如果所有值都是 null，传递空数组给 foundation
        foundation.handleSelectedChange([], options);
        console.log('[DatePicker handleSelectedChange] foundation.handleSelectedChange 调用完成（空数组）');
        return;
    }

    // Filter out invalid dates to prevent "Invalid time value" errors
    // This can happen when compatibleParse returns an invalid Date object
    // 更宽松的检查：检查是否是 Date 对象或可以转换为 Date 的对象
    const validDates = value
        .filter((date) => {
            // 允许 null 通过，让 foundation 处理
            if (date === null || date === undefined) {
                return false; // 过滤掉 null，但如果是全部 null 已经在上面处理了
            }
            if (date instanceof Date) {
                return !isNaN(date.getTime());
            }
            // 如果不是 Date 对象，尝试转换
            if (date && typeof date === 'object') {
                const dateObj = new Date(date as any);
                return !isNaN(dateObj.getTime());
            }
            return false;
        })
        .map((date) => {
            // 确保返回的是 Date 对象
            if (date instanceof Date) {
                return date;
            }
            return new Date(date as any);
        });

    console.log('[DatePicker handleSelectedChange] 过滤后的有效日期', {
        validDates,
        validDatesLength: validDates.length,
        validDatesDetails: validDates.map((v, i) => ({
            index: i,
            value: v,
            type: typeof v,
            isDate: v instanceof Date,
            time: v.getTime(),
        })),
    });

    // 如果过滤后没有有效日期，可能是解析失败
    // 但仍然传递给 foundation，让它处理
    if (validDates.length === 0 && value.length > 0) {
        console.warn('[DatePicker handleSelectedChange] 警告：没有有效的日期对象，但原始值不为空', value);
    }

    // 当使用 v-model 时，在调用 foundation.handleSelectedChange 之前先格式化日期
    // 因为 foundation.handleSelectedChange 在受控模式下不会更新输入框
    if (modelValue.value !== undefined && validDates.length > 0) {
        // 使用 foundation 的格式化方法（如果可访问）
        // 注意：这些方法可能不是公开的，我们需要通过其他方式获取格式化后的值
        // 暂时先调用 foundation.handleSelectedChange，然后在 notifyChange 中更新
    }

    foundation.handleSelectedChange(validDates, options);

    console.log('[DatePicker handleSelectedChange] foundation.handleSelectedChange 调用完成');
};

const handleSetRangeFocus = (rangeInputFocus: any) => {
    foundation.handleSetRangeFocus(rangeInputFocus);
};

const isAnotherPanelHasOpened = (currentRangeInput: any) => {
    if (currentRangeInput === 'rangeStart') {
        return focusRecordsRef.value.rangeEnd;
    } else {
        return focusRecordsRef.value.rangeStart;
    }
};

const disabledDisposeDate = (date: Date, ...rest: any[]) => {
    if (typeof props.disabledDate !== 'function') {
        return false;
    }
    return foundation.disabledDisposeDate(date, ...rest);
};

const disabledDisposeTime = (date: Date, ...rest: any[]) => {
    return foundation.disabledDisposeTime(date, ...rest);
};

const renderQuickControls = () => {
    if (!props.presets || props.presets.length === 0) {
        return null;
    }
    return true;
};

const renderDateInput = () => {
    if (!props.insetInput) {
        return null;
    }
    return DateInput;
};

const defaultValueForGrid = computed(() => {
    const value =
        state.value && state.value.length > 0
            ? [...state.value].filter((v) => v)
            : state.cachedSelectedValue && state.cachedSelectedValue.length > 0
              ? [...state.cachedSelectedValue].filter((v) => v)
              : [];
    return value as Date[];
});

const yearMonthPanelYear = computed(() => {
    const now = new Date();
    const year = { left: now.getFullYear(), right: now.getFullYear() };
    const date = state.value[0];
    if (date instanceof Date && !isNaN(date.getTime())) {
        year.left = date.getFullYear();
    }
    if (props.type === 'monthRange') {
        const dateRight = state.value[1];
        if (dateRight instanceof Date && !isNaN(dateRight.getTime())) {
            year.right = dateRight.getFullYear();
        } else {
            year.right = year.left;
        }
    }
    return year;
});

const yearMonthPanelMonth = computed(() => {
    const now = new Date();
    const month = { left: now.getMonth() + 1, right: now.getMonth() + 2 };
    const date = state.value[0];
    if (date instanceof Date && !isNaN(date.getTime())) {
        month.left = date.getMonth() + 1;
    }
    if (props.type === 'monthRange') {
        const dateRight = state.value[1];
        if (dateRight instanceof Date && !isNaN(dateRight.getTime())) {
            month.right = dateRight.getMonth() + 1;
        } else {
            month.right = month.left + 1 > 12 ? 1 : month.left + 1;
        }
    }
    return month;
});

const handleYMSelectedChange = (item: {
    currentMonth?: { left: number; right: number };
    currentYear?: { left: number; right: number };
}) => {
    foundation.handleYMSelectedChange(item);
};

watch(
    () => state.panelShow,
    (newVal) => {
        if (newVal && monthGridRef.value) {
            monthGridRef.value.foundation.init();
        }
    }
);

const handleConfirm = (e: MouseEvent) => {
    foundation.handleConfirm();
};

const handleCancel = (e: MouseEvent) => {
    foundation.handleCancel();
};

const handlePanelVisibleChange = (visible: boolean) => {
    foundation.handlePanelVisibleChange(visible);
};

const handleInputChange = (value: string, e: Event) => {
    foundation.handleInputChange(value, e);
};

const handleInputComplete = (v: string) => {
    foundation.handleInputComplete(v);
};

const handleInputBlur = (value: string, e: MouseEvent) => {
    foundation.handleInputBlur(value, e);
};

const handleInputFocus = (e: MouseEvent, rangeType?: any) => {
    foundation.handleInputFocus(e, rangeType);
};

const handleInputClick = (e: MouseEvent) => {
    foundation.handleTriggerWrapperClick(e);
};

const handleInputClear = (e: MouseEvent) => {
    foundation.handleInputClear(e);
};

const handleRangeInputBlur = (value: any, e: any) => {
    foundation.handleRangeInputBlur(value, e);
};

const handleRangeInputClear = (e: MouseEvent) => {
    foundation.handleRangeInputClear(e);
};

const handleRangeEndTabPress = (e: KeyboardEvent) => {
    foundation.handleRangeEndTabPress(e);
};

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
    adapter.unregisterClickOutSide();
});

watch(
    () => props.open,
    (val) => {
        if (val !== undefined && val !== state.panelShow) {
            state.panelShow = val;
        }
    }
);

// 监听 v-model (modelValue) 变化
watch(
    () => modelValue.value,
    (val) => {
        if (val !== undefined) {
            foundation.initFromProps({
                ...props,
                value: val,
            });
        }
    }
);

// 监听 value prop 变化（受控模式，仅在未使用 v-model 时生效）
watch(
    () => props.value,
    (val) => {
        // 如果使用 v-model，不处理 value prop 的变化
        if (modelValue.value !== undefined) {
            return;
        }
        foundation.initFromProps({
            ...props,
            value: val,
        });
    }
);

watch(
    () => props.timeZone,
    (val, oldVal) => {
        foundation.initFromProps({
            timeZone: val,
            prevTimeZone: oldVal,
            value: state.value,
        });
    }
);

defineExpose({
    open: () => foundation.open(),
    close: () => foundation.close(),
    focus: (focusType?: any) => foundation.focus(focusType),
    blur: () => foundation.blur(),
});
</script>
