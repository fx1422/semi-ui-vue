<template>
    <div
        ref="timePickerRef"
        :class="wrapperClass"
        :style="props.style"
        v-bind="mergedAttrs"
        @click="handleWrapperClick"
    >
        <Popover
            ref="popoverRef"
            :getPopupContainer="props.getPopupContainer"
            :zIndex="props.zIndex as any"
            :prefixCls="panelPrefix"
            :contentClassName="popupClassName"
            :style="props.popupStyle"
            :trigger="'custom'"
            :position="position as any"
            :visible="props.disabled ? false : Boolean(isOpen)"
            :motion="props.motion as any"
            :margin="props.dropdownMargin as any"
            :autoAdjustOverflow="props.autoAdjustOverflow"
            :stopPropagation="props.stopPropagation"
            @visible-change="handlePanelVisibleChange"
        >
            <template #content>
                <div ref="savePanelRef" :class="panelWrapClass">
                    <Combobox
                        v-for="(panel, index) in timePanels"
                        :key="index"
                        v-bind="getComboboxProps(index)"
                        @change="(v) => handlePanelChange(v, index)"
                        @current-select-panel-change="onCurrentSelectPanelChange"
                    />
                </div>
            </template>

            <template #default>
                <template v-if="useCustomTrigger">
                    <slot name="trigger" v-bind="triggerProps">
                        <component :is="props.triggerRender" v-if="props.triggerRender" v-bind="triggerProps" />
                    </slot>
                </template>
                <span v-else :class="headerPrefix">
                    <TimeInput ref="timeInputRef" v-bind="inputProps" />
                </span>
            </template>
        </Popover>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, useAttrs, useSlots, unref } from 'vue';
import classNames from 'classnames';
import { noop, get } from 'lodash-es';
import Popover from '../popover/index';
import TimeInput from './TimeInput.vue';
import Combobox from './Combobox.vue';
import TimePickerFoundation from '@douyinfe/semi-foundation/timePicker/foundation';
import { strings, cssClasses } from '@douyinfe/semi-foundation/timePicker/constants';
import { numbers as popoverNumbers } from '@douyinfe/semi-foundation/popover/constants';
import { useBaseComponent } from '../_utils/useBaseComponent';
import { useLocaleContext } from '../locale/context';
import type { TimePickerProps, ComboboxProps } from './interface';
import type { TimePickerAdapter } from '@douyinfe/semi-foundation/timePicker/foundation';
import type { Position } from '@douyinfe/semi-foundation/tooltip/foundation';

defineOptions({
    name: 'TimePicker',
    inheritAttrs: false,
});

const modelValue = defineModel<TimePickerProps['value']>();

const props = withDefaults(defineProps<TimePickerProps>(), {
    autoAdjustOverflow: true,
    borderless: false,
    getPopupContainer: () => document.body,
    showClear: true,
    zIndex: popoverNumbers.DEFAULT_Z_INDEX,
    rangeSeparator: strings.DEFAULT_RANGE_SEPARATOR,
    onOpenChange: noop,
    clearText: 'clear',
    prefixCls: cssClasses.PREFIX,
    inputReadOnly: false,
    style: () => ({}),
    stopPropagation: true,
    className: '',
    popupClassName: '',
    popupStyle: () => ({ left: '0px', top: '0px' }),
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
    hideDisabledOptions: false,
    onFocus: noop,
    onBlur: noop,
    onChange: noop,
    onChangeWithDateFirst: true,
    use12Hours: false,
    focusOnOpen: false,
    size: 'default',
    type: strings.DEFAULT_TYPE,
    motion: true,
});

const attrs = useAttrs();
const slots = useSlots();

const initialFormat = props.format || strings.DEFAULT_FORMAT;

const state = reactive({
    open: props.open || props.defaultOpen || false,
    value: [] as Date[],
    inputValue: '',
    currentSelectPanel: 0 as string | number,
    isAM: [true, false] as [boolean, boolean],
    showHour: Boolean(initialFormat.match(/HH|hh|H|h/g)),
    showMinute: Boolean(initialFormat.match(/mm/g)),
    showSecond: Boolean(initialFormat.match(/ss/g)),
    invalid: false,
});

const { adapter: baseAdapter } = useBaseComponent(props, state);
const locale = useLocaleContext();

const emit = defineEmits<{
    (e: 'change', date: Date | Date[] | null, dateString: string | string[]): void;
    (e: 'update:modelValue', value: TimePickerProps['value']): void;
    (e: 'focus', event: FocusEvent): void;
    (e: 'blur', event: FocusEvent): void;
    (e: 'openChange', open: boolean): void;
}>();

const timePickerRef = ref<HTMLDivElement | null>(null);
const savePanelRef = ref<HTMLDivElement | null>(null);
const popoverRef = ref<any>(null);
const timeInputRef = ref<InstanceType<typeof TimeInput> | null>(null);

let clickOutSideHandler: ((e: MouseEvent) => void) | null = null;

const adapter: TimePickerAdapter = {
    ...baseAdapter,
    togglePanel: (show: boolean) => {
        state.open = show;
    },
    registerClickOutSide: () => {
        if (clickOutSideHandler) {
            adapter.unregisterClickOutSide();
        }
        clickOutSideHandler = (e: MouseEvent) => {
            const panel = savePanelRef.value;
            const trigger = timePickerRef.value;
            const target = e.target as Element;
            const path = (e.composedPath && e.composedPath()) || [target];

            if (
                !(panel && panel.contains(target)) &&
                !(trigger && trigger.contains(target)) &&
                !(path.includes(trigger) || path.includes(panel))
            ) {
                foundation.handlePanelClose(true, e);
            }
        };
        document.addEventListener('mousedown', clickOutSideHandler);
    },
    setInputValue: (inputValue: string, cb?: () => void) => {
        state.inputValue = inputValue;
        if (cb) cb();
    },
    unregisterClickOutSide: () => {
        if (clickOutSideHandler) {
            document.removeEventListener('mousedown', clickOutSideHandler);
            clickOutSideHandler = null;
        }
    },
    notifyOpenChange: (open: boolean) => {
        props.onOpenChange?.(open);
        emit('openChange', open);
    },
    notifyChange: (arg1: any, arg2: any) => {
        const isControlledByValue = props.value !== undefined;
        const isControlledByModel = modelValue.value !== undefined;

        if (isControlledByValue) {
            props.onChange?.(arg1, arg2);
            emit('change', arg1, arg2);
            return;
        }

        if (isControlledByModel) {
            modelValue.value = arg1;
            emit('update:modelValue', arg1);
            props.onChange?.(arg1, arg2);
            emit('change', arg1, arg2);
            return;
        }

        props.onChange?.(arg1, arg2);
        emit('change', arg1, arg2);
    },
    notifyFocus: (e: FocusEvent) => {
        props.onFocus?.(e);
        emit('focus', e);
    },
    notifyBlur: (e: FocusEvent) => {
        props.onBlur?.(e);
        emit('blur', e);
    },
    isRangePicker: () => props.type === strings.TYPE_TIME_RANGE_PICKER,
    getProps: () => {
        const filteredProps: Record<string, any> = {};
        for (const key in props) {
            if (props[key] === undefined) {
                continue;
            }
            if ((key === 'open' || key === 'defaultOpen') && props[key] === false) {
                continue;
            }
            filteredProps[key] = props[key];
        }
        if (filteredProps.value === undefined && modelValue.value !== undefined) {
            filteredProps.value = modelValue.value;
        }
        return filteredProps;
    },
    getState: (key: string) => state[key],
    getStates: () => state,
    setState: (states: any, cb?: any) => {
        Object.assign(state, states);
        if (cb) cb();
    },
};

const foundation = new TimePickerFoundation(adapter);

const useCustomTrigger = computed(() => {
    return Boolean(slots.trigger) || typeof props.triggerRender === 'function';
});

const isOpen = computed(() => state.open);

const mergedAttrs = computed(() => {
    const merged = { ...attrs };
    // 移除可能冲突的事件处理器，因为我们会在模板中显式处理
    delete merged.onClick;
    return merged;
});

const wrapperClass = computed(() => classNames({ [props.prefixCls]: true }, props.className));

const panelPrefix = computed(() =>
    classNames({
        [`${props.prefixCls}-panel`]: true,
        [`${props.prefixCls}-panel-${props.size}`]: props.size,
    })
);

const headerPrefix = computed(() =>
    classNames({
        [`${props.prefixCls}-header`]: true,
    })
);

const popupClassName = computed(() => {
    const { use12Hours, prefixCls, popupClassName } = props;
    const { showHour, showMinute, showSecond } = state;
    let selectColumnCount = 0;
    if (showHour) selectColumnCount += 1;
    if (showMinute) selectColumnCount += 1;
    if (showSecond) selectColumnCount += 1;
    if (use12Hours) selectColumnCount += 1;

    return classNames(
        `${prefixCls}-panel`,
        popupClassName,
        {
            [`${prefixCls}-panel-narrow`]: (!showHour || !showMinute || !showSecond) && !use12Hours,
            [cssClasses.RANGE_PICKER]: adapter.isRangePicker(),
        },
        `${prefixCls}-panel-column-${selectColumnCount}`
    );
});

const panelWrapClass = computed(() =>
    classNames({
        [cssClasses.RANGE_PANEL_LISTS]: adapter.isRangePicker(),
    })
);

const position = computed(() => foundation.getPosition() as Position);

const format = computed(() => foundation.getDefaultFormatIfNeed());

const timePanels = computed(() => {
    const count = props.type === strings.TYPE_TIME_RANGE_PICKER ? 2 : 1;
    return new Array(count).fill(0);
});

const inputProps = computed(() => {
    const { prefixCls, placeholder, disabled, size, showClear, inputStyle, insetLabel, insetLabelId, localeCode } =
        props;

    return {
        ...props,
        disabled,
        prefixCls,
        size,
        showClear: disabled ? false : showClear,
        style: inputStyle,
        value: state.inputValue,
        onFocus: handleFocus,
        onClick: openPanel,
        insetLabel,
        insetLabelId,
        format: format.value,
        locale: unref(locale),
        localeCode,
        invalid: state.invalid,
        placeholder,
        onChange: handleInput,
        onBlur: handleBlur,
    };
});

const triggerProps = computed(() => ({
    disabled: props.disabled,
    value: state.value,
    inputValue: state.inputValue,
    onChange: handleInput,
    onClick: openPanel,
    placeholder: props.placeholder,
    componentName: 'TimePicker',
    componentProps: { ...props },
}));

const handlePanelVisibleChange = (visible: boolean) => foundation.handleVisibleChange(visible);

const openPanel = () => foundation.handlePanelOpen();

const handleWrapperClick = () => {
    if (useCustomTrigger.value && !props.disabled) {
        openPanel();
    }
};

const handleFocus = (e: FocusEvent) => foundation.handleFocus(e);

const handleBlur = (e: FocusEvent) => foundation.handleInputBlur(e);

const handleInput = (value: string) => foundation.handleInputChange(value);

const handlePanelChange = (value: { isAM: boolean; value: string; timeStampValue: number }, index: number) => {
    foundation.handlePanelChange(value, index);
};

const onCurrentSelectPanelChange = (currentSelectPanel: string | number) => {
    state.currentSelectPanel = currentSelectPanel;
};

const createPanelProps = (index = 0) => {
    const { panels, panelFooter, panelHeader, locale: propLocale } = props;
    const currentLocale = propLocale || unref(locale)?.TimePicker;

    let finalPanelHeader: any = panelHeader;
    let finalPanelFooter: any = panelFooter;

    if (slots.panelHeader) {
        finalPanelHeader = slots.panelHeader({ index });
    } else if (slots[`panelHeader${index}`]) {
        finalPanelHeader = slots[`panelHeader${index}`]();
    }

    if (slots.panelFooter) {
        finalPanelFooter = slots.panelFooter({ index });
    } else if (slots[`panelFooter${index}`]) {
        finalPanelFooter = slots[`panelFooter${index}`]();
    }

    const panelProps: { panelHeader?: any; panelFooter?: any } = {
        panelHeader: finalPanelHeader,
        panelFooter: finalPanelFooter,
    };

    if (adapter.isRangePicker()) {
        const defaultHeaderMap = {
            0: currentLocale?.begin,
            1: currentLocale?.end,
        };

        if (panelProps.panelHeader === undefined || panelProps.panelHeader === null) {
            panelProps.panelHeader = get(
                panels,
                index,
                panelHeader === undefined || panelHeader === null
                    ? get(defaultHeaderMap, index, null)
                    : Array.isArray(panelHeader)
                      ? panelHeader[index]
                      : panelHeader
            );
        }
        if (panelProps.panelFooter === undefined || panelProps.panelFooter === null) {
            panelProps.panelFooter = get(panels, index, Array.isArray(panelFooter) ? panelFooter[index] : panelFooter);
        }
    }

    return panelProps;
};

const getComboboxProps = (index: number): ComboboxProps => {
    const comboboxBaseProps = {
        ...props,
    };
    delete (comboboxBaseProps as any).onChange;
    delete (comboboxBaseProps as any).onOpenChange;
    delete (comboboxBaseProps as any).onBlur;
    delete (comboboxBaseProps as any).onFocus;
    delete (comboboxBaseProps as any).open;
    delete (comboboxBaseProps as any).defaultOpen;

    return {
        ...comboboxBaseProps,
        format: format.value,
        isAM: state.isAM[index],
        timeStampValue: state.value[index],
        prefixCls: `${props.prefixCls}-panel`,
        ...createPanelProps(index),
    } as any;
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
        if (val !== undefined && val !== state.open) {
            state.open = val;
        }
    }
);

watch(
    () => props.value,
    (val) => {
        foundation.refreshProps({ ...props, value: val });
    }
);

watch(
    () => modelValue.value,
    (val) => {
        if (props.value === undefined && val !== undefined) {
            foundation.refreshProps({ ...props, value: val });
        }
    }
);

watch(
    () => props.defaultValue,
    () => {
        if (props.value === undefined && modelValue.value === undefined) {
            foundation.initDataFromDefaultValue();
        }
    },
    { immediate: true }
);

watch(
    () => props.timeZone,
    (val, oldVal) => {
        foundation.refreshProps({
            timeZone: val,
            __prevTimeZone: oldVal,
            value: state.value,
        });
    }
);

watch(
    () => format.value,
    (newFormat) => {
        if (newFormat) {
            state.showHour = Boolean(newFormat.match(/HH|hh|H|h/g));
            state.showMinute = Boolean(newFormat.match(/mm/g));
            state.showSecond = Boolean(newFormat.match(/ss/g));
        }
    },
    { immediate: true }
);

defineExpose({
    focus: () => {
        timeInputRef.value?.focus();
    },
    blur: () => {
        timeInputRef.value?.blur();
    },
});
</script>
