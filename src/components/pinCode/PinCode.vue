<template>
    <div ref="wrapperRef" :class="[`${cssClasses.PREFIX}-wrapper`, props.className]" :style="props.style">
        <Input
            v-for="(_, index) in inputCount"
            :key="`input-${index}`"
            :ref="(el) => setInputRef(el, index)"
            :auto-focus="props.autoFocus && index === 0"
            :input-mode="props.format === 'number' ? 'numeric' : 'text'"
            :value="getInputValue(index)"
            :size="props.size"
            :disabled="props.disabled"
            :data-pincode-index="index"
            @blur="() => foundation.handleCurrentActiveIndexChange(index, 'blur')"
            @focus="(e) => handleFocus(e, index)"
            @paste="(e) => handlePaste(e, index)"
            @keydown="(e) => handleKeyDown(e, index)"
            @input="(e) => handleInput(e, index)"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import PinCodeFoundation from '@douyinfe/semi-foundation/pincode/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/pincode/constants';
import { useFoundation, useBaseComponent } from '../_utils';
import Input from '../input';
import type { PinCodeState } from './interface';

const modelValue = defineModel<string>({
    default: undefined,
});

// Provide explicit runtime prop definitions so Vue's runtime prop checks
// accept RegExp as a valid type for `format` (RegExp instances are checked via instanceof).
// We cast to `any` to keep TypeScript happy with the runtime-style prop declaration.
const props = defineProps({
    value: String,
    format: { type: [String, RegExp, Function], default: 'number' },
    onChange: Function,
    defaultValue: String,
    count: { type: Number, default: 6 },
    className: String,
    style: Object,
    autoFocus: { type: Boolean, default: true },
    onComplete: Function,
    disabled: Boolean,
    size: String,
}) as any;

const emit = defineEmits<{
    change: [value: string];
    complete: [value: string];
}>();

const inputDOMList = ref<(HTMLInputElement | null)[]>([]);
const wrapperRef = ref<HTMLElement | null>(null);

const actualValue = computed(() => {
    return modelValue.value ?? props.value ?? props.defaultValue;
});

const getInitialValueList = (): string[] => {
    const value = actualValue.value;
    return value ? value.split('') : [];
};

const state = ref<PinCodeState>({
    valueList: getInitialValueList(),
    currentActiveIndex: 0,
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const wrappedOnComplete = (value: string) => {
    emit('complete', value);
    props.onComplete?.(value);
};

const adapter = {
    ...baseAdapter,
    getProp: (key: string) => {
        if (key === 'onComplete') {
            return wrappedOnComplete;
        }
        if (key === 'value') {
            return modelValue.value ?? baseAdapter.getProp(key);
        }
        return baseAdapter.getProp(key);
    },
    getProps: () => {
        const filteredProps = baseAdapter.getProps();
        if (modelValue.value !== undefined) {
            return {
                ...filteredProps,
                value: modelValue.value,
            };
        }
        return filteredProps;
    },
    onCurrentActiveIndexChange: async (i: number) => {
        state.value.currentActiveIndex = i;
    },
    notifyValueChange: (values: string[]) => {
        const value = values.join('');
        state.value.valueList = [...values];
        const currentModelValue = modelValue.value ?? '';
        if (currentModelValue !== value) {
            modelValue.value = value;
        }
        emit('change', value);
        props.onChange?.(value);
    },
    changeSpecificInputFocusState: (index: number, focusState: 'focus' | 'blur') => {
        nextTick(() => {
            const inputDOM = getInputDOMByIndex(index);
            if (inputDOM) {
                if (focusState === 'focus') {
                    inputDOM.focus();
                    nextTick(() => {
                        try {
                            inputDOM.setSelectionRange(1, 1);
                        } catch (e) {
                            // ignore
                        }
                    });
                } else if (focusState === 'blur') {
                    inputDOM.blur();
                }
            } else {
                nextTick(() => {
                    const retryDOM = getInputDOMByIndex(index);
                    if (retryDOM && focusState === 'focus') {
                        retryDOM.focus();
                    }
                });
            }
        });
    },
    updateValueList: async (valueList: string[]) => {
        state.value.valueList = [...valueList];
    },
};

const { foundation } = useFoundation(PinCodeFoundation, adapter);

const inputCount = Array.from({ length: props.count }, (_, i) => i);

const updateInputDOMFromEvent = (target: EventTarget | null, index: number) => {
    if (target instanceof HTMLInputElement) {
        inputDOMList.value[index] = target;
    }
};

const getInputDOMByIndex = (index: number): HTMLInputElement | null => {
    const inputDOM = inputDOMList.value[index];
    if (inputDOM instanceof HTMLInputElement) {
        return inputDOM;
    }
    if (wrapperRef.value) {
        const foundByAttr = wrapperRef.value.querySelector(
            `input[data-pincode-index="${index}"]`
        ) as HTMLInputElement | null;
        if (foundByAttr) {
            inputDOMList.value[index] = foundByAttr;
            return foundByAttr;
        }
        const allInputs = wrapperRef.value.querySelectorAll('input');
        if (allInputs.length > index && allInputs[index]) {
            const dom = allInputs[index] as HTMLInputElement;
            inputDOMList.value[index] = dom;
            return dom;
        }
    }
    return null;
};

const getInputValue = (index: number): string => {
    if (state.value.valueList[index] !== undefined) {
        return state.value.valueList[index] || '';
    }
    const value = actualValue.value;
    if (value && value.length > index) {
        return value[index];
    }
    return '';
};

const setInputRef = (el: any, index: number) => {
    if (el) {
        const getInputDOM = (): HTMLInputElement | null => {
            try {
                const inputComponent = el as InstanceType<typeof Input> & { inputRef?: { value: HTMLInputElement } };
                const inputRef = inputComponent.inputRef;
                if (inputRef) {
                    const dom = inputRef.value;
                    if (dom instanceof HTMLInputElement) {
                        return dom;
                    }
                }
            } catch (e) {
                // ignore
            }
            return null;
        };

        const inputDOM = getInputDOM();
        if (inputDOM) {
            inputDOMList.value[index] = inputDOM;
        } else {
            nextTick(() => {
                const retryDOM = getInputDOM();
                if (retryDOM) {
                    inputDOMList.value[index] = retryDOM;
                }
            });
        }
    } else {
        inputDOMList.value[index] = null;
    }
};

const handleInput = (e: Event, index: number) => {
    const target = e.target as HTMLInputElement;
    updateInputDOMFromEvent(target, index);
    const v = target.value;
    const userInputChar = v.length > 0 ? v[v.length - 1] : '';

    if (v.length === 0) {
        return;
    }

    const isValid = foundation.validateValue(userInputChar);
    if (userInputChar && isValid) {
        foundation.completeSingleInput(index, userInputChar);
    } else {
        const currentValue = getInputValue(index);
        nextTick(() => {
            if (target.value !== currentValue) {
                target.value = currentValue;
            }
        });
    }
};

const handleFocus = (e: Event, index: number) => {
    updateInputDOMFromEvent(e.target, index);
    foundation.handleCurrentActiveIndexChange(index, 'focus');
};

const handlePaste = (e: Event, index: number) => {
    updateInputDOMFromEvent(e.target, index);
    foundation.handlePaste(e as ClipboardEvent, index);
};

const handleKeyDown = (e: Event, index: number) => {
    updateInputDOMFromEvent(e.target, index);
    foundation.handleKeyDownOnSingleInput(e as KeyboardEvent, index);
};

watch(
    () => actualValue.value,
    (newValue, prevValue) => {
        if (prevValue !== newValue) {
            const newValueList = newValue ? newValue.split('') : [];
            foundation.updateValueList(newValueList);
        }
    }
);

defineExpose({
    focus: (index: number) => {
        nextTick(() => {
            const inputDOM = getInputDOMByIndex(index);
            if (inputDOM) {
                inputDOM.focus();
                nextTick(() => {
                    try {
                        const valueLength = inputDOM.value.length;
                        if (valueLength > 0) {
                            inputDOM.setSelectionRange(valueLength, valueLength);
                        } else {
                            inputDOM.setSelectionRange(0, 0);
                        }
                    } catch (e) {
                        // ignore
                    }
                });
            } else {
                nextTick(() => {
                    const retryDOM = getInputDOMByIndex(index);
                    if (retryDOM) {
                        retryDOM.focus();
                    }
                });
            }
        });
    },
    blur: (index: number) => {
        nextTick(() => {
            const inputDOM = getInputDOMByIndex(index);
            if (inputDOM) {
                inputDOM.blur();
            }
        });
    },
});
</script>
