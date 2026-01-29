<template>
    <div
        :class="wrapperClasses"
        :style="style"
        @mousemove="handleMouseMove"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <Input
            ref="inputRef"
            role="spinbutton"
            v-bind="inputProps"
            :value="displayValue"
            :disabled="disabled"
            :size="size"
            :aria-disabled="disabled"
            :aria-valuenow="state.number || undefined"
            :aria-valuemax="max !== Infinity ? max : undefined"
            :aria-valuemin="min !== -Infinity ? min : undefined"
            :step="step"
            :suffix="renderSuffix()"
            @change="handleInputChange"
            @focus="handleFocus"
            @blur="handleBlur"
            @key-down="handleKeyDown"
        />
        <component :is="renderButtons()" v-if="!hideButtons && !innerButtons" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, h } from 'vue';
import classNames from 'classnames';
import { isNaN } from 'lodash-es';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/inputNumber/constants';
import InputNumberFoundation, { BaseInputNumberState } from '@douyinfe/semi-foundation/inputNumber/foundation';
import Input from '../input';
import { IconChevronUp, IconChevronDown } from '../icons';
import type { InputNumberProps } from './interface';
import isNullOrUndefined from '@douyinfe/semi-foundation/utils/isNullOrUndefined';
import isBothNaN from '@douyinfe/semi-foundation/utils/isBothNaN';

/**
 * 使用 defineModel 实现 v-model 双向绑定（Vue 3.5+）
 * 自动处理 modelValue prop 和 update:modelValue emit
 */
const modelValue = defineModel<number | string>();

interface InputNumberPropsWithValue extends InputNumberProps {
    value?: number | string;
}

const props = withDefaults(defineProps<InputNumberPropsWithValue>(), {
    innerButtons: false,
    keepFocus: false,
    max: Infinity,
    min: -Infinity,
    prefixCls: cssClasses.PREFIX,
    pressInterval: numbers.DEFAULT_PRESS_TIMEOUT,
    pressTimeout: numbers.DEFAULT_PRESS_TIMEOUT,
    shiftStep: numbers.DEFAULT_SHIFT_STEP,
    showCurrencySymbol: true,
    size: 'default',
    step: numbers.DEFAULT_STEP,
    hideButtons: false,
});

const emit = defineEmits<{
    blur: [e: FocusEvent];
    change: [value: number | string, e?: Event];
    focus: [e: FocusEvent];
    keydown: [e: KeyboardEvent];
    numberChange: [value: number, e?: Event];
    upClick: [value: string, e: MouseEvent];
    downClick: [value: string, e: MouseEvent];
}>();

const inputRef = ref<InstanceType<typeof Input>>();
const clickUpOrDown = ref(false);
const cursorStart = ref(0);
const cursorEnd = ref(0);
const currentValue = ref<number | string>('');
const cursorBefore = ref('');
const cursorAfter = ref('');

const state = ref<BaseInputNumberState>({
    value: '',
    number: null,
    focusing: Boolean(props.autofocus) || false,
    hovering: false,
});

const adapter = {
    setValue: (value: number | string, cb?: () => void) => {
        state.value.value = value;
        if (cb) cb();
    },
    setNumber: (number: number | null, cb?: () => void) => {
        state.value.number = number;
        if (cb) cb();
    },
    setFocusing: (focusing: boolean, cb?: () => void) => {
        state.value.focusing = focusing;
        if (cb) cb();
    },
    setHovering: (hovering: boolean) => {
        state.value.hovering = hovering;
    },
    /**
     * 通知值变化
     * 自动更新 v-model 绑定的值，并触发 change 事件
     *
     * 注意：change 事件传递的值应该与 React 版本一致
     * - 如果解析后是有效数字，传递数字
     * - 否则传递格式化后的字符串（经过 afterParser 处理）
     *
     * v-model 应该存储原始数字（如果可能）
     */
    notifyChange: (value: number | string, e?: Event) => {
        // 计算要传递给 change 事件的值（与 React 版本一致）
        const changeEventValue: number | string = value;

        // 计算要更新到 v-model 的值（原始数字）
        let parsedValue: number | string = value;

        if (typeof value === 'string') {
            // 尝试解析字符串为数字
            if (props.parser) {
                const parsedStr = props.parser(value);
                const parsedNum = Number(parsedStr);
                if (!isNaN(parsedNum)) {
                    parsedValue = parsedNum;
                } else {
                    parsedValue = parsedStr;
                }
            } else {
                // 如果没有 parser，尝试直接转换为数字
                const parsedNum = Number(value.replace(/[^\d.-]/g, ''));
                if (!isNaN(parsedNum)) {
                    parsedValue = parsedNum;
                }
            }
        }

        // 只有在值真正改变时才更新 v-model，避免初始化时的循环更新
        const currentModelValue = modelValue.value;
        const shouldUpdate =
            parsedValue !== currentModelValue &&
            !(
                typeof parsedValue === 'number' &&
                typeof currentModelValue === 'number' &&
                isBothNaN(parsedValue, currentModelValue)
            );

        if (shouldUpdate) {
            modelValue.value = parsedValue;
        }

        // 触发 change 事件（传递的值与 React 版本一致）
        // 注意：初始化时 e 为 null，不应该触发 change 事件
        if (e !== null) {
            emit('change', changeEventValue, e);
        }
    },
    notifyNumberChange: (value: number, e?: Event) => {
        emit('numberChange', value, e);
    },
    notifyBlur: (e: FocusEvent) => {
        emit('blur', e);
    },
    notifyFocus: (e: FocusEvent) => {
        emit('focus', e);
    },
    notifyUpClick: (value: string, e: MouseEvent) => {
        emit('upClick', value, e);
    },
    notifyDownClick: (value: string, e: MouseEvent) => {
        emit('downClick', value, e);
    },
    notifyKeyDown: (e: KeyboardEvent) => {
        emit('keydown', e);
    },
    registerGlobalEvent: (eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName && typeof handler === 'function') {
            adapter.unregisterGlobalEvent(eventName);
            cacheHandlers.value.set(eventName, handler);
            document.addEventListener(eventName, handler as EventListener);
        }
    },
    unregisterGlobalEvent: (eventName: string) => {
        if (eventName) {
            const handler = cacheHandlers.value.get(eventName);
            if (handler) {
                document.removeEventListener(eventName, handler as EventListener);
                cacheHandlers.value.delete(eventName);
            }
        }
    },
    getInputCharacter: (index: number) => {
        const input = inputRef.value?.$el?.querySelector('input');
        return input?.value[index] || '';
    },
    recordCursorPosition: () => {
        try {
            const input = inputRef.value?.$el?.querySelector('input');
            if (input) {
                cursorStart.value = input.selectionStart || 0;
                cursorEnd.value = input.selectionEnd || 0;
                currentValue.value = input.value;
                cursorBefore.value = input.value.substring(0, cursorStart.value);
                cursorAfter.value = input.value.substring(cursorEnd.value);
            }
        } catch (e) {
            console.warn(e);
        }
    },
    restoreByAfter: (str?: string) => {
        if (isNullOrUndefined(str)) {
            return false;
        }
        const input = inputRef.value?.$el?.querySelector('input');
        if (!input) return false;

        const fullStr = input.value;
        const index = fullStr.lastIndexOf(str);

        if (index === -1) {
            return false;
        }

        if (index + str.length === fullStr.length) {
            adapter.fixCaret(index, index);
            return true;
        }
        return false;
    },
    restoreCursor: (str = cursorAfter.value) => {
        if (isNullOrUndefined(str)) {
            return false;
        }

        return Array.prototype.some.call(str, (_: unknown, start: number) => {
            const partStr = str.substring(start);
            return adapter.restoreByAfter(partStr);
        });
    },
    fixCaret: (start: number, end: number) => {
        if (start === undefined || end === undefined) {
            return;
        }

        try {
            const input = inputRef.value?.$el?.querySelector('input');
            if (!input || !input.value) {
                return;
            }

            const currentStart = input.selectionStart;
            const currentEnd = input.selectionEnd;

            if (start !== currentStart || end !== currentEnd) {
                input.setSelectionRange(start, end);
            }
        } catch (e) {
            // Fix error in Chrome
        }
    },
    setClickUpOrDown: (value: boolean) => {
        clickUpOrDown.value = value;
    },
    updateStates: (states: Partial<BaseInputNumberState>, callback?: () => void) => {
        Object.assign(state.value, states);
        if (callback) callback();
    },
    getState: (key?: string) => {
        return key ? state.value[key as keyof BaseInputNumberState] : state.value;
    },
    getStates: () => {
        return state.value;
    },
    getProps: () => {
        const filteredProps: Record<string, unknown> = {};
        Object.keys(props).forEach((key) => {
            const value = props[key as keyof InputNumberProps];
            if (value !== undefined) {
                filteredProps[key] = value;
            }
        });
        // 如果使用 v-model，将 modelValue 作为 value 传递给 foundation
        // 注意：需要检查 null，因为 null 也是有效值
        if (modelValue.value !== undefined && modelValue.value !== null) {
            filteredProps.value = modelValue.value;
        } else if (modelValue.value === null) {
            // null 也是有效值，需要传递给 foundation
            filteredProps.value = null;
        }
        return filteredProps as Partial<InputNumberProps>;
    },
    getProp: (key: string) => {
        if (key === 'value' && modelValue.value !== undefined) {
            return modelValue.value;
        }
        return props[key as keyof InputNumberProps];
    },
    setState: (states: Partial<BaseInputNumberState>) => {
        Object.assign(state.value, states);
    },
    getContext: () => undefined,
    getContexts: () => undefined,
    getCache: (key: string) => cacheHandlers.value.get(key),
    getCaches: () => cacheHandlers.value,
    setCache: (key: string, value: unknown) => {
        if (value === null || value === undefined) {
            cacheHandlers.value.delete(key);
        } else {
            cacheHandlers.value.set(key, value);
        }
    },
    stopPropagation: () => {},
    persistEvent: () => {},
};

const cacheHandlers = ref(new Map<string, unknown>());
const foundation = new InputNumberFoundation(adapter);

const displayValue = computed(() => state.value.value);

const wrapperClasses = computed(() => {
    return classNames(props.className, `${props.prefixCls}-number`, {
        [`${props.prefixCls}-number-size-${props.size}`]: props.size,
    });
});

const renderButtons = () => {
    const { disabled, innerButtons, max, min, prefixCls } = props;
    const { hovering, focusing, number } = state.value;

    const notAllowedUp = disabled ? disabled : number === max;
    const notAllowedDown = disabled ? disabled : number === min;

    const suffixChildrenCls = classNames(`${prefixCls}-number-suffix-btns`, {
        [`${prefixCls}-number-suffix-btns-inner`]: innerButtons,
        [`${prefixCls}-number-suffix-btns-inner-hover`]: innerButtons && hovering && !focusing,
    });

    const upClassName = classNames(`${prefixCls}-number-button`, `${prefixCls}-number-button-up`, {
        [`${prefixCls}-number-button-up-disabled`]: disabled,
        [`${prefixCls}-number-button-up-not-allowed`]: notAllowedUp,
    });

    const downClassName = classNames(`${prefixCls}-number-button`, `${prefixCls}-number-button-down`, {
        [`${prefixCls}-number-button-down-disabled`]: disabled,
        [`${prefixCls}-number-button-down-not-allowed`]: notAllowedDown,
    });

    const handleUpClick = (e: MouseEvent) => {
        if (!notAllowedUp) {
            handleUpMouseDown(e);
        }
    };

    const handleDownClick = (e: MouseEvent) => {
        if (!notAllowedDown) {
            handleDownMouseDown(e);
        }
    };

    return h('div', { class: suffixChildrenCls }, [
        h(
            'span',
            {
                class: upClassName,
                onMousedown: handleUpClick,
                onMouseup: handleMouseUp,
                onMouseleave: handleMouseLeave,
            },
            h(IconChevronUp, { size: 'extra-small' })
        ),
        h(
            'span',
            {
                class: downClassName,
                onMousedown: handleDownClick,
                onMouseup: handleMouseUp,
                onMouseleave: handleMouseLeave,
            },
            h(IconChevronDown, { size: 'extra-small' })
        ),
    ]);
};

const renderSuffix = () => {
    const { innerButtons, suffix } = props;
    const { hovering, focusing } = state.value;

    if (innerButtons && (hovering || focusing)) {
        const buttons = renderButtons();
        return buttons;
    }

    return suffix;
};

const inputProps = computed(() => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
        prefixCls,
        className,
        hideButtons,
        innerButtons,
        formatter,
        parser,
        max,
        min,
        precision,
        shiftStep,
        step,
        pressInterval,
        pressTimeout,
        showCurrencySymbol,
        currency,
        currencyDisplay,
        defaultCurrency,
        localeCode,
        minimumFractionDigits,
        maximumFractionDigits,
        value,
        style,
        ...restProps
    } = props;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as Record<string, unknown>;
});

const handleInputChange = (value: string, e: Event) => {
    adapter.recordCursorPosition();
    foundation.handleInputChange(value, e);
};

const handleFocus = (e: FocusEvent) => {
    foundation.handleInputFocus(e);
};

const handleBlur = (e: FocusEvent) => {
    foundation.handleInputBlur(e);
};

const handleKeyDown = (e: KeyboardEvent) => {
    foundation.handleInputKeyDown(e);
};

const handleMouseMove = () => {
    foundation.handleInputMouseMove();
};

const handleMouseEnter = () => {
    foundation.handleInputMouseEnter();
};

const handleMouseLeave = () => {
    foundation.handleInputMouseLeave();
};

const handleUpMouseDown = (e: MouseEvent) => {
    foundation.handleUpClick(e);
};

const handleDownMouseDown = (e: MouseEvent) => {
    foundation.handleDownClick(e);
};

const handleMouseUp = () => {
    foundation.handleMouseUp();
};

const focus = () => {
    (inputRef.value as any)?.focus?.();
};

const blur = () => {
    (inputRef.value as any)?.blur?.();
};

// 标记是否已经初始化完成，避免初始化时 watch 覆盖格式化后的值
const isInitialized = ref(false);

/**
 * 监听 v-model 值变化
 * 当外部通过 v-model 更新值时，同步到内部状态
 */
watch(
    () => modelValue.value,
    (newValue, prevValue) => {
        // 如果还未初始化完成，跳过 watch（初始化由 foundation.init() 处理）
        if (!isInitialized.value) {
            return;
        }

        if (newValue !== prevValue && !isBothNaN(newValue, prevValue)) {
            let newFormattedValue: string | undefined;
            if (isNullOrUndefined(newValue) || newValue === '') {
                foundation.updateStates({ value: '', number: null });
            } else {
                let valueStr = newValue;
                if (typeof newValue === 'number') {
                    valueStr = foundation.doFormat(newValue);
                }

                const parsedNum = foundation.doParse(valueStr as string, false, true, true);
                const toNum =
                    typeof newValue === 'number'
                        ? newValue
                        : foundation.doParse(valueStr as string, false, false, false);

                if (state.value.focusing) {
                    if (foundation.isValidNumber(parsedNum) && parsedNum !== state.value.number) {
                        const obj: Partial<BaseInputNumberState> = { number: parsedNum };
                        if (clickUpOrDown.value) {
                            obj.value = foundation.doFormat(obj.number!, true);
                            newFormattedValue = obj.value;
                        }
                        foundation.updateStates(obj, () => adapter.restoreCursor());
                    } else if (!isNaN(toNum as number)) {
                        newFormattedValue = foundation.doFormat(toNum as number, false);
                        foundation.updateStates({ value: newFormattedValue });
                    } else {
                        foundation.updateStates({ value: valueStr as string });
                    }
                } else if (foundation.isValidNumber(parsedNum)) {
                    newFormattedValue = foundation.doFormat(parsedNum, true, true);
                    foundation.updateStates({ number: parsedNum, value: newFormattedValue });
                } else {
                    newFormattedValue = '';
                    foundation.updateStates({ number: null, value: newFormattedValue });
                }
            }
            // 注意：这里不应该调用 notifyChange，因为这是从外部 v-model 同步到内部状态
            // notifyChange 应该只在用户交互时调用（如输入、点击按钮等）
            // 如果这里调用 notifyChange，会导致循环更新
        }
    }
);

/**
 * 监听受控组件模式下的 value 变化
 * 仅在未使用 v-model 时生效，保持向后兼容
 */
watch(
    () => props.value,
    (newValue, prevValue) => {
        if (modelValue.value === undefined && newValue !== prevValue && !isBothNaN(newValue, prevValue)) {
            let newFormattedValue: string | undefined;
            if (isNullOrUndefined(newValue) || newValue === '') {
                foundation.updateStates({ value: '', number: null });
            } else {
                let valueStr = newValue;
                if (typeof newValue === 'number') {
                    valueStr = foundation.doFormat(newValue);
                }

                const parsedNum = foundation.doParse(valueStr as string, false, true, true);
                const toNum =
                    typeof newValue === 'number'
                        ? newValue
                        : foundation.doParse(valueStr as string, false, false, false);

                if (state.value.focusing) {
                    if (foundation.isValidNumber(parsedNum) && parsedNum !== state.value.number) {
                        const obj: Partial<BaseInputNumberState> = { number: parsedNum };
                        if (clickUpOrDown.value) {
                            obj.value = foundation.doFormat(obj.number!, true);
                            newFormattedValue = obj.value;
                        }
                        foundation.updateStates(obj, () => adapter.restoreCursor());
                    } else if (!isNaN(toNum as number)) {
                        newFormattedValue = foundation.doFormat(toNum as number, false);
                        foundation.updateStates({ value: newFormattedValue });
                    } else {
                        foundation.updateStates({ value: valueStr as string });
                    }
                } else if (foundation.isValidNumber(parsedNum)) {
                    newFormattedValue = foundation.doFormat(parsedNum, true, true);
                    foundation.updateStates({ number: parsedNum, value: newFormattedValue });
                } else {
                    newFormattedValue = '';
                    foundation.updateStates({ number: null, value: newFormattedValue });
                }
            }
            if (
                newFormattedValue !== undefined &&
                typeof newFormattedValue === 'string' &&
                newFormattedValue !== String(props.value)
            ) {
                if ((foundation as any)._isCurrency()) {
                    const parsedNewValue = foundation.doParse(newFormattedValue);
                    const parsedPropValue =
                        typeof props.value === 'string' ? foundation.doParse(props.value) : props.value;

                    if (parsedNewValue !== parsedPropValue) {
                        foundation.notifyChange(newFormattedValue, null);
                    }
                } else {
                    foundation.notifyChange(newFormattedValue, null);
                }
            }
        }
    }
);

watch(
    () => [clickUpOrDown.value, state.value.focusing, props.keepFocus],
    () => {
        if (!clickUpOrDown.value) {
            return;
        }

        if (props.keepFocus && state.value.focusing) {
            const input = inputRef.value?.$el?.querySelector('input');
            if (input && document.activeElement !== input) {
                input.focus({ preventScroll: props.preventScroll });
            }
        }
    },
    { flush: 'post' }
);

onMounted(() => {
    // foundation.init() 会调用 _setInitValue()
    // _setInitValue() 会通过 getProps() 获取 v-model 的值，格式化并设置到 state.value.value
    foundation.init();

    // 如果初始化后显示值仍然是空的或未格式化，手动触发格式化
    // 这通常发生在 v-model 有初始值但 _setInitValue() 没有正确处理的情况
    if (modelValue.value !== undefined && modelValue.value !== null && modelValue.value !== '') {
        const currentDisplayValue = state.value.value;
        const initValue = modelValue.value;

        // 如果显示值是空的，或者是原始数字字符串（未格式化），需要格式化
        const isUnformatted =
            !currentDisplayValue ||
            currentDisplayValue === String(initValue) ||
            (typeof initValue === 'number' && currentDisplayValue === initValue.toString());

        if (isUnformatted) {
            const parsedNum = foundation.doParse(
                typeof initValue === 'number' ? String(initValue) : initValue,
                false,
                true,
                true
            );
            if (foundation.isValidNumber(parsedNum)) {
                const formattedValue = foundation.doFormat(parsedNum, true, true);
                foundation.updateStates({ number: parsedNum, value: formattedValue });
            }
        }
    }

    // 标记初始化完成，允许 watch 监听器工作
    isInitialized.value = true;

    if (props.autofocus) {
        focus();
    }
});

onUnmounted(() => {
    foundation.destroy();
});

defineExpose({
    focus,
    blur,
});
</script>
