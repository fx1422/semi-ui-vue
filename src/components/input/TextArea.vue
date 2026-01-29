<template>
    <div :class="wrapperCls" :style="wrapperStyle" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <ResizeObserver v-if="autosizeEnabled" @resize="handleResize">
            <textarea
                ref="textareaRef"
                :class="textareaCls"
                :style="textareaStyle"
                :disabled="disabled"
                :readonly="readonly"
                :placeholder="placeholder"
                :value="textareaValue"
                :maxlength="computedMaxLength"
                :minlength="stateMinLength"
                :aria-invalid="ariaInvalid"
                :rows="rows"
                :cols="cols"
                v-bind="restAttrs"
                @input="handleInput"
                @change="handleChange"
                @focus="handleFocus"
                @blur="handleBlur"
                @keydown="handleKeyDown"
                @keyup="handleKeyUp"
                @keypress="handleKeyPress"
                @compositionstart="handleCompositionStart"
                @compositionend="handleCompositionEnd"
                @compositionupdate="handleCompositionUpdate"
            />
        </ResizeObserver>
        <textarea
            v-else
            ref="textareaRef"
            :class="textareaCls"
            :style="textareaStyle"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :value="textareaValue"
            :maxlength="computedMaxLength"
            :minlength="stateMinLength"
            :aria-invalid="ariaInvalid"
            :rows="rows"
            :cols="cols"
            v-bind="restAttrs"
            @input="handleInput"
            @change="handleChange"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown="handleKeyDown"
            @keyup="handleKeyUp"
            @keypress="handleKeyPress"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @compositionupdate="handleCompositionUpdate"
        />

        <div v-if="showClear" :class="clearBtnCls" @click="handleClear">
            <IconClear />
        </div>

        <div v-if="showCounter || maxCount" :class="counterCls">
            {{ currentCount }}{{ maxCount ? '/' : null }}{{ totalCount }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useAttrs, markRaw } from 'vue';
import { throttle } from 'lodash-es';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/input/constants';
import TextAreaFoundation from '@douyinfe/semi-foundation/input/textareaFoundation';
import { IconClear } from '../icons';
import { TextAreaProps as _TextAreaProps } from './interface';
import { useFoundation } from '../_utils';
import ResizeObserver from '../_resizeObserver';

const modelValue = defineModel<string>();

interface TextAreaProps extends _TextAreaProps {
    value?: string;
}

defineOptions({
    name: 'SemiTextArea',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<TextAreaProps>(), {
    rows: 4,
    cols: 20,
    showCounter: false,
    showClear: false,
    disabled: false,
    readonly: false,
    validateStatus: 'default',
    borderless: false,
});

const rows = computed(() => (typeof props.rows === 'string' ? parseInt(props.rows, 10) : props.rows));
const cols = computed(() => (typeof props.cols === 'string' ? parseInt(props.cols, 10) : props.cols));
const maxCount = computed(() => (typeof props.maxCount === 'string' ? parseInt(props.maxCount, 10) : props.maxCount));
const maxLength = computed(() =>
    typeof props.maxLength === 'string' ? parseInt(props.maxLength, 10) : props.maxLength
);
const minLength = computed(() =>
    typeof props.minLength === 'string' ? parseInt(props.minLength, 10) : props.minLength
);

const emit = defineEmits<{
    'update:value': [value: string];
    clear: [e: MouseEvent];
    change: [value: string, e: Event];
    blur: [e: FocusEvent];
    focus: [e: FocusEvent];
    input: [e: Event];
    keydown: [e: KeyboardEvent];
    keyup: [e: KeyboardEvent];
    keypress: [e: KeyboardEvent];
    'enter-press': [e: KeyboardEvent];
    resize: [data: { height: number }];
    'composition-start': [e: CompositionEvent];
    'composition-end': [e: CompositionEvent];
    'composition-update': [e: CompositionEvent];
}>();

const attrs = useAttrs();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

/**
 * 获取初始值
 * 优先级：modelValue (v-model) > value (受控) > 默认值
 */
const getInitialValue = () => {
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    if (props.value !== undefined) {
        return props.value;
    }
    return '';
};

const textValue = ref<string>(getInitialValue());
const isFocus = ref<boolean>(false);
const isHover = ref<boolean>(false);
const height = ref<number>(0);
const stateMinLength = ref<number | undefined>(minLength.value !== undefined ? minLength.value : undefined);

const throttledResizeTextarea = throttle(() => {
    (foundation as any).resizeTextarea();
}, 10);

/**
 * 监听 v-model 值变化
 * 当外部通过 v-model 更新值时，同步到内部状态
 */
watch(
    () => modelValue.value,
    (newValue) => {
        if (newValue !== undefined) {
            textValue.value = newValue !== null ? newValue : '';
            if (props.autosize) {
                setTimeout(() => {
                    throttledResizeTextarea();
                }, 0);
            }
        } else {
            textValue.value = '';
            if (props.autosize) {
                setTimeout(() => {
                    throttledResizeTextarea();
                }, 0);
            }
        }
    }
);

/**
 * 监听受控组件模式下的 value 变化
 * 仅在未使用 v-model 时生效，保持向后兼容
 */
watch(
    () => props.value,
    (newValue) => {
        if (modelValue.value === undefined && newValue !== undefined) {
            textValue.value = newValue !== null ? newValue : '';
            if (props.autosize) {
                setTimeout(() => {
                    throttledResizeTextarea();
                }, 0);
            }
        }
    }
);

const adapter = markRaw({
    setValue: (val: string) => {
        textValue.value = val;
        if (props.autosize) {
            throttledResizeTextarea();
        }
    },
    getRef: () => textareaRef.value,
    toggleFocusing: (focusing: boolean) => {
        isFocus.value = focusing;
    },
    toggleHovering: (hovering: boolean) => {
        isHover.value = hovering;
    },
    /**
     * 通知值变化
     * 自动更新 v-model 绑定的值，并触发 change 事件
     */
    notifyChange: (cbValue: string, e: Event) => {
        modelValue.value = cbValue;
        emit('update:value', cbValue);
        emit('change', cbValue, e);
    },
    notifyClear: (e: MouseEvent) => {
        emit('clear', e);
    },
    notifyBlur: (val: string, e: FocusEvent) => {
        emit('blur', e);
    },
    notifyFocus: (val: string, e: FocusEvent) => {
        emit('focus', e);
    },
    notifyInput: (e: Event) => {
        emit('input', e);
    },
    notifyKeyDown: (e: KeyboardEvent) => {
        emit('keydown', e);
    },
    notifyKeyUp: (e: KeyboardEvent) => {
        emit('keyup', e);
    },
    notifyKeyPress: (e: KeyboardEvent) => {
        emit('keypress', e);
    },
    notifyPressEnter: (e: KeyboardEvent) => {
        emit('enter-press', e);
    },
    notifyHeightUpdate: (newHeight: number) => {
        height.value = newHeight;
        emit('resize', { height: newHeight });
    },
    notifyCompositionStart: (e: CompositionEvent) => {
        emit('composition-start', e);
    },
    notifyCompositionEnd: (e: CompositionEvent) => {
        emit('composition-end', e);
    },
    notifyCompositionUpdate: (e: CompositionEvent) => {
        emit('composition-update', e);
    },
    setMinLength: (minLength: number) => {
        stateMinLength.value = minLength;
    },
    _isControlledComponent: (key: string = 'value') => {
        if (key === 'value') {
            return modelValue.value !== undefined || props.value !== undefined;
        }
        return props[key] !== undefined;
    },
    getProp: (key: string) => props[key],
    getProps: () => props,
    getState: (key: string) => {
        const states = {
            value: textValue.value,
            isFocus: isFocus.value,
            isHover: isHover.value,
            height: height.value,
            minLength: stateMinLength.value,
        };
        return states[key];
    },
    getStates: () => ({
        value: textValue.value,
        isFocus: isFocus.value,
        isHover: isHover.value,
        height: height.value,
        minLength: stateMinLength.value,
    }),
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    setState: () => {},
    stopPropagation: (e?: Event) => e?.stopPropagation(),
    persistEvent: () => {},
});

const { foundation } = useFoundation(TextAreaFoundation as any, adapter);

const textareaValue = computed(() => {
    if (modelValue.value !== undefined) {
        return modelValue.value === null ? '' : modelValue.value;
    } else if (props.value !== undefined) {
        return props.value === null ? '' : props.value;
    } else {
        return textValue.value === null || textValue.value === undefined ? '' : textValue.value;
    }
});

const autosizeEnabled = computed(() => {
    return props.autosize;
});

const allowClear = computed(() => {
    const { showClear, disabled, readonly } = props;
    return textValue.value && showClear && !disabled && (isFocus.value || isHover.value) && !readonly;
});

const computedMaxLength = computed(() => {
    const { getValueLength } = props;
    if (typeof getValueLength === 'function') {
        return undefined;
    }
    return maxLength.value;
});

const currentCount = computed(() => {
    const { getValueLength } = props;
    if (textValue.value) {
        return typeof getValueLength === 'function' ? getValueLength(textValue.value) : textValue.value.length;
    }
    return 0;
});

const totalCount = computed(() => {
    return maxCount.value || null;
});

const ariaInvalid = computed(() => (props.validateStatus === 'error' ? true : undefined));

const restAttrs = computed(() => {
    const { class: _, style: __, ...rest } = attrs;
    return rest;
});

const wrapperCls = computed(() => {
    const { disabled, readonly, validateStatus, borderless } = props;
    return cls(`${prefixCls}-textarea-wrapper`, props.className, {
        [`${prefixCls}-textarea-wrapper-disabled`]: disabled,
        [`${prefixCls}-textarea-wrapper-readonly`]: readonly,
        [`${prefixCls}-textarea-wrapper-${validateStatus}`]: Boolean(validateStatus),
        [`${prefixCls}-textarea-wrapper-focus`]: isFocus.value,
        [`${prefixCls}-textarea-borderless`]: borderless,
    });
});

const textareaCls = computed(() => {
    const { disabled, readonly, showClear } = props;
    const autosizeValue = autosizeEnabled.value;
    return cls(`${prefixCls}-textarea`, {
        [`${prefixCls}-textarea-disabled`]: disabled,
        [`${prefixCls}-textarea-readonly`]: readonly,
        [`${prefixCls}-textarea-autosize`]:
            typeof autosizeValue === 'object' ? autosizeValue?.maxRows === undefined : autosizeValue,
        [`${prefixCls}-textarea-showClear`]: showClear,
    });
});

const clearBtnCls = computed(() => {
    const displayClearBtn = allowClear.value;
    return cls(`${prefixCls}-clearbtn`, {
        [`${prefixCls}-clearbtn-hidden`]: !displayClearBtn,
    });
});

const counterCls = computed(() => {
    return cls(`${prefixCls}-textarea-counter`, {
        [`${prefixCls}-textarea-counter-exceed`]: currentCount.value > totalCount.value,
    });
});

const wrapperStyle = computed(() => {
    return { ...props.style };
});

const textareaStyle = computed(() => {
    if (!autosizeEnabled.value || height.value === 0) {
        return {};
    }
    return {
        height: `${height.value}px`,
    };
});

const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    (foundation as any).handleChange(target.value, e);
    emit('input', e);
    if (props.autosize) {
        throttledResizeTextarea();
    }
};

const handleChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    (foundation as any).handleChange(target.value, e);
};

const handleFocus = (e: FocusEvent) => {
    (foundation as any).handleFocus(e);
};

const handleBlur = (e: FocusEvent) => {
    (foundation as any).handleBlur(e);
};

const handleKeyDown = (e: KeyboardEvent) => {
    (foundation as any).handleKeyDown?.(e);
};

const handleKeyUp = (e: KeyboardEvent) => {
    (foundation as any).handleKeyUp?.(e);
};

const handleKeyPress = (e: KeyboardEvent) => {
    (foundation as any).handleKeyPress?.(e);
};

const handleCompositionStart = (e: CompositionEvent) => {
    (foundation as any).handleCompositionStart(e);
};

const handleCompositionEnd = (e: CompositionEvent) => {
    (foundation as any).handleCompositionEnd(e);
};

const handleCompositionUpdate = (e: CompositionEvent) => {
    (foundation as any).handleCompositionUpdate(e);
};

const handleClear = (e: MouseEvent) => {
    (foundation as any).handleClear(e);
};

const handleMouseEnter = (e: MouseEvent) => {
    (foundation as any).handleMouseEnter(e);
};

const handleMouseLeave = (e: MouseEvent) => {
    (foundation as any).handleMouseLeave(e);
};

const handleResize = () => {
    if (autosizeEnabled.value) {
        throttledResizeTextarea();
    }
};

onMounted(() => {
    const { disabled, autoFocus } = props;
    if (!disabled && autoFocus && textareaRef.value) {
        textareaRef.value.focus();
    }

    if (autosizeEnabled.value) {
        throttledResizeTextarea();
    }
});

defineExpose({
    focus: () => {
        if (textareaRef.value) {
            textareaRef.value.focus();
        }
    },
    blur: () => {
        if (textareaRef.value) {
            textareaRef.value.blur();
        }
    },
    textareaRef,
});
</script>
