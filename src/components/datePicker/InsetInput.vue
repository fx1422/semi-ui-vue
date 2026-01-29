<template>
    <div :class="wrapperCls">
        <!-- 左侧面板 -->
        <div :class="panelCls">
            <InsetDateInput
                :ref="dateInputStartRef"
                :insetInputValue="props.insetInputValue"
                :placeholder="datePlaceholder.dateStart"
                valuePath="monthLeft.dateInput"
                :onChange="handleDateInputChange"
                :onFocus="handleDateInputFocus"
            />
            <InsetTimeInput
                v-if="isTimeType"
                :disabled="!hasDateStart"
                :insetInputValue="props.insetInputValue"
                :placeholder="datePlaceholder.timeStart"
                valuePath="monthLeft.timeInput"
                :type="props.type"
                :onChange="handleTimeInputChange"
                :onFocus="handleTimeInputFocus"
            />
        </div>
        <!-- 右侧面板（范围选择时显示） -->
        <template v-if="isRangeType">
            <span :class="separatorCls">{{ props.rangeSeparator || '-' }}</span>
            <div :class="panelCls">
                <InsetDateInput
                    :ref="dateInputEndRef"
                    :insetInputValue="props.insetInputValue"
                    :placeholder="datePlaceholder.dateEnd"
                    valuePath="monthRight.dateInput"
                    :onChange="handleDateInputChange"
                    :onFocus="handleDateInputFocus"
                />
                <InsetTimeInput
                    v-if="isTimeType"
                    :disabled="!hasDateEnd"
                    :insetInputValue="props.insetInputValue"
                    :placeholder="datePlaceholder.timeEnd"
                    valuePath="monthRight.timeInput"
                    :type="props.type"
                    :onChange="handleTimeInputChange"
                    :onFocus="handleTimeInputFocus"
                />
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, defineComponent, type PropType } from 'vue';
import { get, isObject } from 'lodash-es';
import classNames from 'classnames';
import Input from '../input/Input.vue';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import type { InsetInputProps, InsetInputValue, InsetInputChangeProps } from './interface';

defineOptions({
    name: 'DatePickerInsetInput',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<InsetInputProps>(), {
    type: 'date',
    rangeSeparator: '-',
    insetInputValue: () => ({
        monthLeft: { dateInput: '', timeInput: '' },
        monthRight: { dateInput: '', timeInput: '' },
    }),
    placeholder: () => ({
        dateStart: '',
        dateEnd: '',
        timeStart: '',
        timeEnd: '',
    }),
});

const emit = defineEmits<{
    (e: 'insetInputChange', options: InsetInputChangeProps): void;
    (e: 'dateFocus', panelType: string): void;
    (e: 'timeFocus', panelType: string): void;
}>();

const prefixCls = cssClasses.PREFIX;

const dateInputStartRef = ref<any>(null);
const dateInputEndRef = ref<any>(null);

// Computed
const wrapperCls = computed(() => classNames(`${prefixCls}-inset-input-wrapper`));
const panelCls = computed(() => classNames(`${prefixCls}-inset-input-panel`));
const separatorCls = computed(() => classNames(`${prefixCls}-inset-input-separator`));

const isTimeType = computed(() => {
    return props.type?.includes('Time') || false;
});

const isRangeType = computed(() => {
    return props.type?.includes('Range') || false;
});

const hasDateStart = computed(() => {
    return !!get(props.insetInputValue, 'monthLeft.dateInput');
});

const hasDateEnd = computed(() => {
    return !!get(props.insetInputValue, 'monthRight.dateInput');
});

const datePlaceholder = computed(() => {
    const defaultPlaceholder = {
        dateStart: 'YYYY-MM-DD',
        dateEnd: 'YYYY-MM-DD',
        timeStart: 'HH:mm:ss',
        timeEnd: 'HH:mm:ss',
    };

    if (isObject(props.placeholder)) {
        return { ...defaultPlaceholder, ...props.placeholder };
    }

    return defaultPlaceholder;
});

// Methods
const handleDateInputChange = (options: any) => {
    const { value, insetInputValue, valuePath } = options;
    const format = props.format || strings.FORMAT_FULL_DATE;
    const newInsetInputValue = { ...insetInputValue };

    // Update the value at the path
    const keys = valuePath.split('.');
    if (keys.length === 2) {
        newInsetInputValue[keys[0]] = {
            ...newInsetInputValue[keys[0]],
            [keys[1]]: value,
        };
    }

    emit('insetInputChange', {
        insetInputStr: value,
        format,
        insetInputValue: newInsetInputValue,
    });
};

const handleTimeInputChange = (options: any) => {
    const { value, insetInputValue, valuePath } = options;
    const format = props.format || strings.FORMAT_TIME_PICKER;
    const newInsetInputValue = { ...insetInputValue };

    // Update the value at the path
    const keys = valuePath.split('.');
    if (keys.length === 2) {
        newInsetInputValue[keys[0]] = {
            ...newInsetInputValue[keys[0]],
            [keys[1]]: value,
        };
    }

    emit('insetInputChange', {
        insetInputStr: value,
        format,
        insetInputValue: newInsetInputValue,
    });
};

const handleDateInputFocus = (e: FocusEvent, valuePath: string) => {
    const panelType = valuePath.startsWith('monthLeft') ? 'left' : 'right';
    emit('dateFocus', panelType);
};

const handleTimeInputFocus = (e: FocusEvent, valuePath: string) => {
    const panelType = valuePath.startsWith('monthLeft') ? 'left' : 'right';
    emit('timeFocus', panelType);
};

// Sub-components
const InsetDateInput = defineComponent({
    name: 'InsetDateInput',
    props: {
        insetInputValue: { type: Object as PropType<InsetInputValue>, required: true },
        placeholder: { type: String, default: '' },
        valuePath: { type: String, required: true },
        onChange: { type: Function as PropType<(options: any) => void>, required: true },
        onFocus: { type: Function as PropType<(e: FocusEvent, valuePath: string) => void>, required: true },
    },
    setup(dateInputProps) {
        const value = computed(() => get(dateInputProps.insetInputValue, dateInputProps.valuePath) || '');

        return () =>
            h(Input, {
                value: value.value,
                placeholder: dateInputProps.placeholder,
                onChange: (val: string, e: Event) => {
                    dateInputProps.onChange?.({
                        value: val,
                        event: e,
                        insetInputValue: dateInputProps.insetInputValue,
                        valuePath: dateInputProps.valuePath,
                    });
                },
                onFocus: (e: FocusEvent) => {
                    dateInputProps.onFocus?.(e, dateInputProps.valuePath);
                },
                class: `${prefixCls}-inset-input-date`,
            });
    },
});

const InsetTimeInput = defineComponent({
    name: 'InsetTimeInput',
    props: {
        disabled: { type: Boolean, default: false },
        insetInputValue: { type: Object as PropType<InsetInputValue>, required: true },
        placeholder: { type: String, default: '' },
        valuePath: { type: String, required: true },
        type: { type: String, required: true },
        onChange: { type: Function as PropType<(options: any) => void>, required: true },
        onFocus: { type: Function as PropType<(e: FocusEvent, valuePath: string) => void>, required: true },
    },
    setup(timeInputProps) {
        const value = computed(() => get(timeInputProps.insetInputValue, timeInputProps.valuePath) || '');

        return () =>
            h(Input, {
                value: value.value,
                placeholder: timeInputProps.placeholder,
                disabled: timeInputProps.disabled,
                onChange: (val: string, e: Event) => {
                    timeInputProps.onChange?.({
                        value: val,
                        event: e,
                        insetInputValue: timeInputProps.insetInputValue,
                        valuePath: timeInputProps.valuePath,
                    });
                },
                onFocus: (e: FocusEvent) => {
                    timeInputProps.onFocus?.(e, timeInputProps.valuePath);
                },
                class: `${prefixCls}-inset-input-time`,
            });
    },
});

defineExpose({
    dateInputStartRef,
    dateInputEndRef,
});
</script>
