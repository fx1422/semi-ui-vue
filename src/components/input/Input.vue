<template>
    <div
        :class="wrapperCls"
        :style="wrapperStyle"
        @mouseenter="handleMouseOver"
        @mouseleave="handleMouseLeave"
        @click="handleClick"
    >
        <div v-if="addonBeforeNode" :class="prependCls" x-semi-prop="addonBefore">
            <slot v-if="slots.addonBefore" name="addonBefore"></slot>
            <template v-else-if="!isString(addonBeforeNode)">
                <component :is="addonBeforeNode" />
            </template>
            <template v-else>{{ addonBeforeNode }}</template>
        </div>

        <div
            v-if="labelNode"
            :id="props.insetLabelId"
            :class="prefixWrapperCls"
            x-semi-prop="prefix,insetLabel"
            @mousedown="handlePreventMouseDown"
            @click="handleClickPrefixOrSuffix"
        >
            <slot v-if="slots.prefix" name="prefix"></slot>
            <template v-else-if="!isString(labelNode)">
                <component :is="labelNode" />
            </template>
            <template v-else>{{ labelNode }}</template>
        </div>

        <input
            :id="props.id"
            ref="inputRef"
            :name="props.name"
            :class="inputCls"
            :style="inputStyle"
            :disabled="mergedDisabled"
            :readonly="readonly"
            :type="inputType"
            :placeholder="placeholder as string"
            :value="inputValue"
            :maxlength="computedMaxLength"
            :minlength="stateMinLength"
            :aria-invalid="ariaInvalid"
            v-bind="restAttrs"
            @input="handleInput"
            @change="handleChange"
            @focus="handleFocus"
            @blur="handleBlur"
            @keyup="handleKeyUp"
            @keydown="handleKeyDown"
            @keypress="handleKeyPress"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @compositionupdate="handleCompositionUpdate"
        />

        <div v-if="allowClear" :class="`${prefixCls}-clearbtn`" @mousedown="handleClear">
            <template v-if="props.clearIcon">
                <component :is="props.clearIcon" />
            </template>
            <IconClear v-else />
        </div>

        <div
            v-if="suffixNode"
            :class="suffixWrapperCls"
            x-semi-prop="suffix"
            @mousedown="handlePreventMouseDown"
            @click="handleClickPrefixOrSuffix"
        >
            <slot v-if="slots.suffix" name="suffix"></slot>
            <template v-else-if="!isString(suffixNode)">
                <component :is="suffixNode" />
            </template>
            <template v-else>{{ suffixNode }}</template>
        </div>

        <div
            v-if="showModeBtn"
            role="button"
            tabindex="0"
            :aria-label="modeAriaLabel"
            :class="`${prefixCls}-modebtn`"
            @click="handleClickEye"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @keypress="handleModeEnterPress"
        >
            <IconEyeClosedSolid v-if="eyeClosed" />
            <IconEyeOpened v-else />
        </div>

        <div v-if="addonAfterNode" :class="appendCls" x-semi-prop="addonAfter">
            <slot v-if="slots.addonAfter" name="addonAfter"></slot>
            <template v-else-if="!isString(addonAfterNode)">
                <component :is="addonAfterNode" />
            </template>
            <template v-else>{{ addonAfterNode }}</template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useAttrs, useSlots, markRaw } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/input/constants';
import InputFoundation from '@douyinfe/semi-foundation/input/foundation';
import { IconClear, IconEyeOpened, IconEyeClosedSolid } from '../icons';
import { InputProps as _InputProps } from './interface';
import { useFoundation } from '../_utils';
import { isSemiIcon } from '../../_utils';
import { useInputGroup } from './context';

const modelValue = defineModel<string | number>();

interface InputProps extends _InputProps {
    value?: string | number;
}

defineOptions({
    name: 'SemiInput',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<InputProps>(), {
    type: 'text',
    size: 'default',
    showClear: false,
    hideSuffix: false,
    readonly: false,
    validateStatus: 'default',
    borderless: false,
});

const emit = defineEmits<{
    'update:value': [value: string | number];
    clear: [e: MouseEvent];
    change: [value: string, e: Event];
    blur: [e: FocusEvent];
    focus: [e: FocusEvent];
    input: [e: Event];
    keydown: [e: KeyboardEvent];
    keyup: [e: KeyboardEvent];
    keypress: [e: KeyboardEvent];
    'enter-press': [e: KeyboardEvent];
    'composition-start': [e: CompositionEvent];
    'composition-end': [e: CompositionEvent];
    'composition-update': [e: CompositionEvent];
}>();

const attrs = useAttrs();
const slots = useSlots();

const inputGroupContext = useInputGroup();

const mergedSize = computed(() => {
    if (inputGroupContext.inputGroup?.size) {
        return inputGroupContext.inputGroup.size;
    }
    return props.size;
});

const mergedDisabled = computed(() => {
    if (typeof props.disabled === 'boolean') {
        return props.disabled;
    }
    return inputGroupContext.inputGroup?.disabled ?? false;
});

const inputRef = ref<HTMLInputElement | null>(null);

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

const internalValue = ref<string | number>(getInitialValue());
const isFocus = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const eyeClosed = ref<boolean>(props.mode === 'password');
const stateMinLength = ref<number | undefined>(props.minLength !== undefined ? props.minLength : undefined);

/**
 * 监听 v-model 值变化
 * 当外部通过 v-model 更新值时，同步到内部状态
 */
watch(
    () => modelValue.value,
    (newValue) => {
        if (newValue !== undefined) {
            internalValue.value = newValue !== null ? newValue : '';
        } else {
            internalValue.value = '';
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
            internalValue.value = newValue !== null ? newValue : '';
        }
    }
);

const adapter = markRaw({
    setValue: (val: string) => {
        internalValue.value = val;
    },
    setEyeClosed: (val: boolean) => {
        eyeClosed.value = val;
    },
    toggleFocusing: (focused: boolean) => {
        isFocus.value = focused;
    },
    focusInput: () => {
        const { preventScroll } = props;
        if (inputRef.value) {
            inputRef.value.focus({ preventScroll });
        }
    },
    toggleHovering: (hovering: boolean) => {
        isHovering.value = hovering;
    },
    getIfFocusing: () => isFocus.value,
    /**
     * 通知值变化
     * - 如果使用 :value 受控模式，只触发 change 事件，不更新 v-model
     * - 如果使用 v-model，更新 v-model 并触发 change 事件
     * - 如果非受控，更新内部状态并触发 change 事件
     */
    notifyChange: (cbValue: string, e: Event) => {
        const isControlledByValue = props.value !== undefined;
        const isControlledByModel = modelValue.value !== undefined;

        // 受控模式（:value）：只触发事件，不更新值
        if (isControlledByValue) {
            emit('change', cbValue, e);
            return;
        }

        // 双向绑定模式（v-model）：更新 v-model
        if (isControlledByModel) {
            modelValue.value = cbValue;
            emit('update:value', cbValue);
            emit('change', cbValue, e);
            return;
        }

        // 非受控模式：更新内部状态
        internalValue.value = cbValue;
        emit('change', cbValue, e);
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
    notifyKeyPress: (e: KeyboardEvent) => {
        emit('keypress', e);
    },
    notifyKeyDown: (e: KeyboardEvent) => {
        emit('keydown', e);
    },
    notifyKeyUp: (e: KeyboardEvent) => {
        emit('keyup', e);
    },
    notifyEnterPress: (e: KeyboardEvent) => {
        emit('enter-press', e);
    },
    notifyClear: (e: MouseEvent) => {
        emit('clear', e);
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
    isEventTarget: (e: MouseEvent) => e && e.target === e.currentTarget,
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
            value: internalValue.value,
            isFocus: isFocus.value,
            isHovering: isHovering.value,
            eyeClosed: eyeClosed.value,
            stateMinLength: stateMinLength.value,
        };
        return states[key];
    },
    getStates: () => ({
        value: internalValue.value,
        isFocus: isFocus.value,
        isHovering: isHovering.value,
        eyeClosed: eyeClosed.value,
        stateMinLength: stateMinLength.value,
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

const { foundation } = useFoundation(InputFoundation, adapter);

const isString = (val: unknown): val is string => typeof val === 'string';

const labelNode = computed(() => {
    if (slots.prefix) {
        return slots.prefix;
    }
    return props.prefix || props.insetLabel;
});

const suffixNode = computed(() => {
    if (slots.suffix) {
        return slots.suffix;
    }
    return props.suffix;
});

const addonBeforeNode = computed(() => {
    if (slots.addonBefore) {
        return slots.addonBefore;
    }
    return props.addonBefore;
});

const addonAfterNode = computed(() => {
    if (slots.addonAfter) {
        return slots.addonAfter;
    }
    return props.addonAfter;
});

const inputValue = computed(() => {
    // 数据绑定优先级（按使用场景）：
    // 1. :value prop - 受控组件模式，用于 InputNumber 等需要控制显示格式的组件
    // 2. v-model - 标准双向绑定，大多数场景使用
    // 3. 内部状态 - 非受控模式
    //
    // 注意：不要同时使用 :value 和 v-model，:value 优先级更高

    // 受控组件模式：使用 :value prop
    if (props.value !== undefined) {
        return props.value === null ? '' : props.value;
    }

    // 双向绑定模式：使用 v-model
    if (modelValue.value !== undefined) {
        return modelValue.value === null ? '' : modelValue.value;
    }

    // 非受控模式：使用内部状态
    return internalValue.value === null || internalValue.value === undefined ? '' : internalValue.value;
});

const inputType = computed(() => foundation.handleInputType(props.type));

const allowClear = computed(() => foundation.isAllowClear());

const showModeBtn = computed(() => props.mode === 'password' && !mergedDisabled.value);

const modeAriaLabel = computed(() => (eyeClosed.value ? 'Show password' : 'Hidden password'));

const computedMaxLength = computed(() => {
    const { maxLength, getValueLength } = props;
    if (typeof getValueLength === 'function') {
        return undefined;
    }
    return maxLength;
});

const ariaInvalid = computed(() => (props.validateStatus === 'error' ? true : undefined));

const restAttrs = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { class: _, style: __, id: _id, name: _name, ...rest } = attrs;
    return rest;
});

const wrapperCls = computed(() => {
    const { validateStatus, readonly, borderless, mode, type, onlyBorder } = props;
    const size = mergedSize.value;
    const disabled = mergedDisabled.value;
    const wrapperPrefix = `${prefixCls}-wrapper`;
    return cls(wrapperPrefix, props.className, {
        [`${prefixCls}-wrapper__with-prefix`]: labelNode.value,
        [`${prefixCls}-wrapper__with-suffix`]: suffixNode.value,
        [`${prefixCls}-wrapper__with-suffix-hidden`]: allowClear.value && Boolean(props.hideSuffix),
        [`${prefixCls}-wrapper__with-suffix-icon`]: isSemiIcon(suffixNode.value),
        [`${prefixCls}-wrapper__with-append`]: addonBeforeNode.value,
        [`${prefixCls}-wrapper__with-prepend`]: addonAfterNode.value,
        [`${prefixCls}-wrapper__with-append-only`]: addonBeforeNode.value && !addonAfterNode.value,
        [`${prefixCls}-wrapper__with-prepend-only`]: !addonBeforeNode.value && addonAfterNode.value,
        [`${wrapperPrefix}-readonly`]: readonly,
        [`${wrapperPrefix}-disabled`]: disabled,
        [`${wrapperPrefix}-warning`]: validateStatus === 'warning',
        [`${wrapperPrefix}-error`]: validateStatus === 'error',
        [`${wrapperPrefix}-focus`]: isFocus.value,
        [`${wrapperPrefix}-clearable`]: props.showClear,
        [`${wrapperPrefix}-modebtn`]: mode === 'password',
        [`${wrapperPrefix}-hidden`]: type === 'hidden',
        [`${wrapperPrefix}-${size}`]: size,
        [`${prefixCls}-borderless`]: borderless,
        [`${prefixCls}-only_border`]: onlyBorder !== undefined && onlyBorder !== null,
    });
});

const inputCls = computed(() => {
    const { mode } = props;
    const size = mergedSize.value;
    const disabled = mergedDisabled.value;
    return cls(prefixCls, {
        [`${prefixCls}-${size}`]: size,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-sibling-clearbtn`]: allowClear.value,
        [`${prefixCls}-sibling-modebtn`]: mode === 'password',
    });
});

const prependCls = computed(() => {
    return cls({
        [`${prefixCls}-prepend`]: true,
        [`${prefixCls}-prepend-text`]: addonBeforeNode.value && isString(addonBeforeNode.value),
        [`${prefixCls}-prepend-icon`]: isSemiIcon(addonBeforeNode.value),
    });
});

const appendCls = computed(() => {
    return cls({
        [`${prefixCls}-append`]: true,
        [`${prefixCls}-append-text`]: addonAfterNode.value && isString(addonAfterNode.value),
        [`${prefixCls}-append-icon`]: isSemiIcon(addonAfterNode.value),
    });
});

const prefixWrapperCls = computed(() => {
    let isIcon = false;
    let isText = false;

    if (slots.prefix) {
        const slotContent = slots.prefix();
        if (slotContent && slotContent.length > 0) {
            const firstNode = slotContent[0];
            isIcon = isSemiIcon(firstNode);
            isText = typeof firstNode.children === 'string';
        }
    } else {
        isIcon = isSemiIcon(props.prefix || props.insetLabel);
        isText = isString(props.prefix || props.insetLabel);
    }

    return cls({
        [`${prefixCls}-prefix`]: true,
        [`${prefixCls}-inset-label`]: props.insetLabel,
        [`${prefixCls}-prefix-text`]: isText,
        [`${prefixCls}-prefix-icon`]: isIcon,
    });
});

const suffixWrapperCls = computed(() => {
    let isIcon = false;
    let isText = false;

    if (slots.suffix) {
        const slotContent = slots.suffix();
        if (slotContent && slotContent.length > 0) {
            const firstNode = slotContent[0];
            isIcon = isSemiIcon(firstNode);
            isText = typeof firstNode.children === 'string';
        }
    } else {
        isIcon = isSemiIcon(props.suffix);
        isText = isString(props.suffix);
    }

    return cls({
        [`${prefixCls}-suffix`]: true,
        [`${prefixCls}-suffix-text`]: isText,
        [`${prefixCls}-suffix-icon`]: isIcon,
        [`${prefixCls}-suffix-hidden`]: allowClear.value && Boolean(props.hideSuffix),
    });
});

const wrapperStyle = computed(() => {
    let style = { ...props.style };
    if (props.onlyBorder !== undefined) {
        style = {
            borderWidth: props.onlyBorder,
            ...props.style,
        };
    }
    return style;
});

const handleInput = (e: Event) => {
    foundation.handleInput(e);
};

const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    foundation.handleChange(target.value, e);
};

const handleFocus = (e: FocusEvent) => {
    foundation.handleFocus(e);
    if (inputGroupContext.inputGroup?.onFocus) {
        inputGroupContext.inputGroup.onFocus(e);
    }
};

const handleBlur = (e: FocusEvent) => {
    foundation.handleBlur(e);
    if (inputGroupContext.inputGroup?.onBlur) {
        inputGroupContext.inputGroup.onBlur(e);
    }
};

const handleKeyUp = (e: KeyboardEvent) => {
    foundation.handleKeyUp(e);
};

const handleKeyDown = (e: KeyboardEvent) => {
    foundation.handleKeyDown(e);
};

const handleKeyPress = (e: KeyboardEvent) => {
    foundation.handleKeyPress(e);
};

const handleCompositionStart = (e: CompositionEvent) => {
    foundation.handleCompositionStart(e);
};

const handleCompositionEnd = (e: CompositionEvent) => {
    foundation.handleCompositionEnd(e);
};

const handleCompositionUpdate = (e: CompositionEvent) => {
    foundation.handleCompositionUpdate(e);
};

const handleClear = (e: MouseEvent) => {
    foundation.handleClear(e);
};

const handleClick = (e: MouseEvent) => {
    foundation.handleClick(e);
};

const handleMouseOver = () => {
    isHovering.value = true;
};

const handleMouseLeave = () => {
    isHovering.value = false;
};

const handleClickEye = (e: MouseEvent) => {
    foundation.handleClickEye(e);
};

const handleMouseDown = (e: MouseEvent) => {
    foundation.handleMouseDown(e);
};

const handleMouseUp = (e: MouseEvent) => {
    foundation.handleMouseUp(e);
};

const handleModeEnterPress = (e: KeyboardEvent) => {
    foundation.handleModeEnterPress(e);
};

const handleClickPrefixOrSuffix = (e: MouseEvent) => {
    foundation.handleClickPrefixOrSuffix(e);
};

const handlePreventMouseDown = (e: MouseEvent) => {
    foundation.handlePreventMouseDown(e);
};

onMounted(() => {
    const { disabled, autoFocus, preventScroll } = props;
    const shouldAutoFocus = autoFocus || attrs['autofocus'];
    if (!disabled && shouldAutoFocus && inputRef.value) {
        inputRef.value.focus({ preventScroll });
    }
});

watch(
    () => props.mode,
    (newMode, oldMode) => {
        if (newMode !== oldMode) {
            foundation.handleModeChange(newMode);
        }
    }
);

defineExpose({
    focus: () => {
        if (inputRef.value) {
            inputRef.value.focus({ preventScroll: props.preventScroll });
        }
    },
    blur: () => {
        if (inputRef.value) {
            inputRef.value.blur();
        }
    },
    inputRef,
});
</script>
