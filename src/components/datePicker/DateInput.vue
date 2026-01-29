<template>
    <template v-if="isRenderMultipleInputs()">
        <div v-if="prefix || insetLabel" :class="`${props.prefixCls}-range-input-prefix`" @click="handlePrefixClick">
            <slot name="prefix" />
            <slot name="insetLabel" />
        </div>
        <div :class="inputLeftWrapperClass" @click="handleRangeStartFocus">
            <Input
                :ref="setRangeInputStartRef"
                :borderless="props.borderless"
                :size="rangeSize"
                :style="props.inputStyle"
                :disabled="props.disabled"
                :readonly="props.inputReadOnly"
                :placeholder="rangeStartPlaceholder"
                :value="rangeStart"
                @change="(val, e) => handleRangeInputChange(val, rangeEnd, e)"
                @enter-press="(e) => handleRangeInputEnterPress(e, rangeStart, rangeEnd)"
                @focus="handleRangeInputFocus($event, 'rangeStart')"
            />
        </div>
        <span :class="separatorClass" @click="handleRangeStartFocus">
            {{ props.rangeSeparator }}
        </span>
        <div :class="inputRightWrapperClass" @click="handleRangeEndFocus">
            <Input
                :ref="setRangeInputEndRef"
                :borderless="props.borderless"
                :size="rangeSize"
                :style="props.inputStyle"
                :disabled="props.disabled"
                :readonly="props.inputReadOnly"
                :placeholder="rangeEndPlaceholder"
                :value="rangeEnd"
                @change="(val, e) => handleRangeInputChange(rangeStart, val, e)"
                @enter-press="(e) => handleRangeInputEnterPress(e, rangeStart, rangeEnd)"
                @focus="handleRangeInputFocus($event, 'rangeEnd')"
                @keydown="handleRangeInputEndKeyPress"
            />
        </div>
        <div
            v-if="allowClear"
            role="button"
            tabindex="0"
            aria-label="Clear range input value"
            :class="`${props.prefixCls}-range-input-clearbtn`"
            @mousedown="handleRangeInputClear"
        >
            <IconClear v-if="!props.clearIcon" aria-hidden />
            <component :is="props.clearIcon" v-else />
        </div>
        <div v-if="suffix" :class="`${props.prefixCls}-range-input-suffix`" @click="handleSuffixClick">
            <component :is="suffix" />
        </div>
    </template>
    <Input
        v-else
        :ref="setInputRef"
        :insetLabel="props.insetLabel"
        :disabled="props.disabled"
        :showClearIgnoreDisabled="props.showClearIgnoreDisabled"
        :readonly="props.inputReadOnly"
        :class="inputClass"
        :style="props.inputStyle"
        :hideSuffix="props.showClear"
        :placeholder="placeholderText"
        :suffix="suffix as any"
        :showClear="props.showClear"
        :value="text"
        :validateStatus="props.validateStatus"
        :prefix="props.prefix"
        :autoFocus="props.autofocus"
        :size="props.size"
        @enter-press="handleEnterPress"
        @change="handleChange"
        @clear="handleInputClear"
        @click="props.onClick"
        @blur="handleBlur"
        @focus="handleFocus"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useAttrs } from 'vue';
import classNames from 'classnames';
import { noop, get } from 'lodash-es';
import Input from '../input/Input.vue';
import { IconCalendar, IconCalendarClock, IconClear } from '../icons';
import DateInputFoundation from '@douyinfe/semi-foundation/datePicker/inputFoundation';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import { useBaseComponent, useFoundation } from '../_utils';
import type { DateInputProps } from './interface';
import type { DateInputAdapter } from '@douyinfe/semi-foundation/datePicker/inputFoundation';

defineOptions({
    name: 'DateInput',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<DateInputProps>(), {
    borderless: false,
    showClear: true,
    onClick: noop,
    onChange: noop,
    onEnterPress: noop,
    onBlur: noop,
    onClear: noop,
    onFocus: noop,
    type: 'date',
    inputStyle: () => ({}),
    inputReadOnly: false,
    prefixCls: cssClasses.PREFIX,
    rangeSeparator: strings.DEFAULT_SEPARATOR_RANGE,
});

const attrs = useAttrs();

const localInputRef = ref<InstanceType<typeof Input> | null>(null);
const localRangeInputStartRef = ref<HTMLInputElement | null>(null);
const localRangeInputEndRef = ref<HTMLInputElement | null>(null);

const setRangeInputStartRef = (el: any) => {
    localRangeInputStartRef.value = el;
    if (props.rangeInputStartRef?.ref) {
        props.rangeInputStartRef.ref.value = el;
    }
};

const setRangeInputEndRef = (el: any) => {
    localRangeInputEndRef.value = el;
    if (props.rangeInputEndRef?.ref) {
        props.rangeInputEndRef.ref.value = el;
    }
};

const setInputRef = (el: any) => {
    localInputRef.value = el;
    if (props.inputRef?.ref) {
        props.inputRef.ref.value = el;
    }
};

const { adapter: baseAdapter } = useBaseComponent(props, {});

const adapter: DateInputAdapter = {
    ...baseAdapter,
    updateIsFocusing: (isFocusing: boolean) => {
        // Not needed for Vue
    },
    notifyClick: (...args) => props.onClick(...args),
    notifyChange: (...args) => props.onChange(...args),
    notifyEnter: (...args) => props.onEnterPress(...args),
    notifyBlur: (...args) => props.onBlur(...args),
    notifyClear: (...args) => props.onClear(...args),
    notifyFocus: (...args) => props.onFocus(...args),
    notifyRangeInputClear: (...args) => props.onRangeClear?.(...args),
    notifyRangeInputFocus: (...args) => props.onFocus(...args),
    notifyTabPress: (...args) => props.onRangeEndTabPress?.(...args),
    notifyInsetInputChange: (options) => props.onInsetInputChange?.(options),
};

const { foundation } = useFoundation(DateInputFoundation, adapter);

const isRenderMultipleInputs = () => {
    const { type } = props;
    return type.includes('Range') && type !== 'monthRange';
};

const formatText = (value: any) => {
    return value && value.length ? foundation.formatShowText(value) : '';
};

const inputValueFromAttrs = computed(() => {
    return (attrs as any).inputValue ?? (attrs as any)['input-value'] ?? null;
});

const text = computed(() => {
    const inputValue = props.inputValue ?? inputValueFromAttrs.value;
    if (inputValue !== null && inputValue !== undefined) {
        return inputValue;
    } else if (props.value && props.value.length > 0) {
        return formatText(props.value);
    }
    return '';
});

const suffix = computed(() => {
    return props.type.includes('Time') ? IconCalendarClock : IconCalendar;
});

const placeholderText = computed(() => {
    if (props.type === 'monthRange' && Array.isArray(props.placeholder)) {
        return props.placeholder[0] + props.rangeSeparator + props.placeholder[1];
    }
    return props.placeholder as string;
});

const inputClass = computed(() => {
    return classNames({
        [`${props.prefixCls}-input-readonly`]: props.inputReadOnly,
        [`${props.prefixCls}-monthRange-input`]: props.type === 'monthRange',
    });
});

const rangeSize = computed(() => {
    return props.size === 'large' ? 'default' : 'small';
});

const rangePlaceholder = computed(() => {
    return Array.isArray(props.placeholder) ? props.placeholder : [props.placeholder, props.placeholder];
});

const rangeStartPlaceholder = computed(() => rangePlaceholder.value[0]);
const rangeEndPlaceholder = computed(() => rangePlaceholder.value[1]);

const rangeStart = computed(() => {
    const parts = (text.value as string).split(props.rangeSeparator) || [];
    return parts[0] || '';
});

const rangeEnd = computed(() => {
    const parts = (text.value as string).split(props.rangeSeparator) || [];
    return parts[1] || '';
});

const inputCls = computed(() => {
    return classNames({
        [`${props.prefixCls}-input-readonly`]: props.inputReadOnly,
        [`${props.prefixCls}-monthRange-input`]: props.type === 'monthRange',
    });
});

const inputLeftWrapperClass = computed(() => {
    return classNames(
        inputCls.value,
        `${props.prefixCls}-range-input-wrapper-start`,
        `${props.prefixCls}-range-input-wrapper`,
        {
            [`${props.prefixCls}-range-input-wrapper-active`]:
                props.rangeInputFocus === 'rangeStart' && !props.disabled,
            [`${props.prefixCls}-range-input-wrapper-focus`]: props.rangeInputFocus === 'rangeStart' && !props.disabled,
            [`${props.prefixCls}-range-input-wrapper-start-with-prefix`]: props.prefix || props.insetLabel,
            [`${props.prefixCls}-borderless`]: props.borderless,
        }
    );
});

const inputRightWrapperClass = computed(() => {
    return classNames(
        inputCls.value,
        `${props.prefixCls}-range-input-wrapper-end`,
        `${props.prefixCls}-range-input-wrapper`,
        {
            [`${props.prefixCls}-range-input-wrapper-active`]: props.rangeInputFocus === 'rangeEnd' && !props.disabled,
            [`${props.prefixCls}-range-input-wrapper-focus`]: props.rangeInputFocus === 'rangeEnd' && !props.disabled,
            [`${props.prefixCls}-borderless`]: props.borderless,
        }
    );
});

const separatorClass = computed(() => {
    return classNames(`${props.prefixCls}-range-input-separator`, {
        [`${props.prefixCls}-range-input-separator-active`]: (rangeStart.value || rangeEnd.value) && !props.disabled,
    });
});

const allowClear = computed(() => {
    const isRealDisabled = props.disabled && !props.showClearIgnoreDisabled;
    return (rangeStart.value || rangeEnd.value) && props.showClear && !isRealDisabled;
});

const handleChange = (value: string, e: Event) => {
    foundation.handleChange(value, e);
};

const handleEnterPress = (e: KeyboardEvent) => {
    foundation.handleInputComplete(e);
};

const handleInputClear = (e: MouseEvent) => {
    foundation.handleInputClear(e);
};

const getRangeInputValue = (rangeStart: string, rangeEnd: string) => {
    return `${rangeStart}${props.rangeSeparator}${rangeEnd}`;
};

const handleRangeInputChange = (start: string, end: string, e: Event) => {
    const rangeInputValue = getRangeInputValue(start, end);
    foundation.handleChange(rangeInputValue, e);
};

const handleRangeInputClear = (e: MouseEvent) => {
    foundation.handleRangeInputClear(e);
};

const handleRangeInputEnterPress = (e: KeyboardEvent, rangeStart: string, rangeEnd: string) => {
    const rangeInputValue = getRangeInputValue(rangeStart, rangeEnd);
    foundation.handleRangeInputEnterPress(e, rangeInputValue);
};

const handleRangeInputEndKeyPress = (e: KeyboardEvent) => {
    foundation.handleRangeInputEndKeyPress(e);
};

const handleRangeInputFocus = (e: FocusEvent, rangeType: 'rangeStart' | 'rangeEnd') => {
    foundation.handleRangeInputFocus(e, rangeType);
};

const handleRangeStartFocus = (e: MouseEvent) => {
    if (!props.disabled) {
        props.onClick?.(e);
        handleRangeInputFocus(e as any, 'rangeStart');
    }
};

const handleRangeEndFocus = (e: MouseEvent) => {
    if (!props.disabled) {
        props.onClick?.(e);
        handleRangeInputFocus(e as any, 'rangeEnd');
    }
};

const handlePrefixClick = (e: MouseEvent) => {
    if (!props.disabled && !props.rangeInputFocus) {
        props.onClick?.(e);
        handleRangeInputFocus(e as any, 'rangeStart');
    }
};

const handleSuffixClick = (e: MouseEvent) => {
    if (!props.disabled && !props.rangeInputFocus) {
        props.onClick?.(e);
        handleRangeInputFocus(e as any, 'rangeStart');
    }
};

const handleBlur = (e: FocusEvent) => {
    props.onBlur?.(e as any);
};

const handleFocus = (e: FocusEvent) => {
    props.onFocus?.(e as any, props.rangeInputFocus || 'rangeStart');
};

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});
</script>

<style>
.semi-datepicker-range-input-wrapper-end.semi-datepicker-range-input-wrapper-focus {
    border-top-right-radius: var(--semi-border-radius-small) !important;
    border-bottom-right-radius: var(--semi-border-radius-small) !important;
}
</style>
