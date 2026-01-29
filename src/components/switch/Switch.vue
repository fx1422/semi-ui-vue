<template>
    <div
        :class="wrapperCls"
        :style="props.style"
        v-bind="getDataAttr(restProps)"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <Spin
            v-if="props.loading"
            :wrapper-class-name="cssClasses.LOADING_SPIN"
            :size="props.size === 'default' ? 'middle' : props.size"
        />
        <div v-else :class="cssClasses.KNOB" aria-hidden="true" />

        <div v-if="showCheckedText" :class="cssClasses.CHECKED_TEXT" x-semi-prop="checkedText">
            <slot v-if="$slots.checkedText" name="checkedText"></slot>
            <template v-else>{{ checkedText }}</template>
        </div>

        <div v-if="showUncheckedText" :class="cssClasses.UNCHECKED_TEXT" x-semi-prop="uncheckedText">
            <slot v-if="$slots.uncheckedText" name="uncheckedText"></slot>
            <template v-else>{{ uncheckedText }}</template>
        </div>

        <input
            :id="props.id"
            ref="switchRef"
            type="checkbox"
            :class="cssClasses.NATIVE_CONTROL"
            :disabled="state.nativeControlDisabled || props.loading"
            :checked="state.nativeControlChecked || false"
            role="switch"
            :aria-checked="state.nativeControlChecked"
            :aria-invalid="props['aria-invalid']"
            :aria-errormessage="props['aria-errormessage']"
            :aria-label="props['aria-label']"
            :aria-labelledby="props['aria-labelledby']"
            :aria-describedby="props['aria-describedby']"
            :aria-disabled="props.disabled"
            @change="handleChange"
            @focus="handleFocusVisible"
            @blur="handleBlur"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/switch/constants';
import SwitchFoundation, { SwitchAdapter } from '@douyinfe/semi-foundation/switch/foundation';
import Spin from '../spin/Spin.vue';
import type { SwitchProps, SwitchState } from './interface';

const modelValue = defineModel<boolean>();

const props = withDefaults(defineProps<SwitchProps>(), {
    disabled: false,
    className: '',
    loading: false,
    size: 'default',
});

const emit = defineEmits<{
    change: [checked: boolean, e: Event];
    'update:modelValue': [checked: boolean];
    'update:checked': [checked: boolean];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
}>();

const effectiveChecked = computed(() => {
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    if (props.checked !== undefined) {
        return props.checked;
    }
    return props.defaultChecked ?? false;
});

const state = reactive<SwitchState>({
    nativeControlChecked: effectiveChecked.value,
    nativeControlDisabled: props.disabled || false,
    focusVisible: false,
});

const switchRef = ref<HTMLInputElement>();
const slots = useSlots();

const adapter: SwitchAdapter<SwitchProps, SwitchState> = {
    setNativeControlChecked: (nativeControlChecked: boolean | undefined) => {
        state.nativeControlChecked = nativeControlChecked !== undefined ? nativeControlChecked : false;
    },
    setNativeControlDisabled: (nativeControlDisabled: boolean | undefined) => {
        state.nativeControlDisabled = nativeControlDisabled || false;
    },
    setFocusVisible: (focusVisible: boolean) => {
        state.focusVisible = focusVisible;
    },
    notifyChange: (checked: boolean, e: Event) => {
        emit('change', checked, e);
        emit('update:modelValue', checked);
        emit('update:checked', checked);
    },
    getProps: () => props,
    getState: () => state,
    getContext: () => undefined,
    getContexts: () => undefined,
    getProp: (key: string) => (props as Record<string, unknown>)[key],
    getStates: () => state,
    setState: (states: Partial<SwitchState>) => {
        Object.assign(state, states);
    },
    getCache: () => undefined,
    getCaches: () => undefined,
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
};

const foundation = new SwitchFoundation(adapter);

onUnmounted(() => {
    foundation.destroy();
});

let isInitialized = false;
watch(effectiveChecked, (newChecked) => {
    if (isInitialized && typeof newChecked === 'boolean') {
        foundation.setChecked(newChecked);
    }
});

onMounted(() => {
    foundation.init();
    isInitialized = true;
    if (typeof effectiveChecked.value === 'boolean') {
        foundation.setChecked(effectiveChecked.value);
    }
});

watch(
    () => props.disabled,
    (newDisabled) => {
        foundation.setDisabled(newDisabled);
    }
);

const wrapperCls = computed(() => {
    return classNames(props.className, {
        [cssClasses.PREFIX]: true,
        [cssClasses.CHECKED]: state.nativeControlChecked,
        [cssClasses.DISABLED]: state.nativeControlDisabled,
        [cssClasses.LARGE]: props.size === 'large',
        [cssClasses.SMALL]: props.size === 'small',
        [cssClasses.LOADING]: props.loading,
        [cssClasses.FOCUS]: state.focusVisible,
    });
});

const showCheckedText = computed(() => {
    return (props.checkedText || slots.checkedText) && state.nativeControlChecked && props.size !== 'small';
});

const showUncheckedText = computed(() => {
    return (props.uncheckedText || slots.uncheckedText) && !state.nativeControlChecked && props.size !== 'small';
});

function getDataAttr(propsData: Record<string, unknown>) {
    const dataAttrs: Record<string, unknown> = {};
    Object.keys(propsData).forEach((key) => {
        if (key.startsWith('data-')) {
            dataAttrs[key] = propsData[key];
        }
    });
    return dataAttrs;
}

const restProps = computed(() => {
    const propsData = props as unknown as Record<string, unknown>;
    const omitKeys = [
        'className',
        'style',
        'size',
        'checkedText',
        'uncheckedText',
        'loading',
        'defaultChecked',
        'checked',
        'disabled',
        'id',
        'aria-label',
        'aria-describedby',
        'aria-errormessage',
        'aria-invalid',
        'aria-labelledby',
    ];
    const rest: Record<string, unknown> = {};
    Object.keys(propsData).forEach((key) => {
        if (!omitKeys.includes(key)) {
            rest[key] = propsData[key];
        }
    });
    return rest;
});

function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    foundation.handleChange(target.checked, e);
}

function handleFocusVisible(e: FocusEvent) {
    foundation.handleFocusVisible(e);
}

function handleBlur() {
    foundation.handleBlur();
}

function handleMouseEnter(e: MouseEvent) {
    emit('mouseenter', e);
}

function handleMouseLeave(e: MouseEvent) {
    emit('mouseleave', e);
}

defineExpose({
    focus: () => {
        switchRef.value?.focus();
    },
    blur: () => {
        switchRef.value?.blur();
    },
});
</script>
