<template>
    <ul
        :id="id"
        ref="rateRef"
        :class="ratingClasses"
        :style="style"
        :aria-label="ariaLabel"
        :aria-labelledby="props['aria-labelledby']"
        :aria-describedby="props['aria-describedby']"
        :tabindex="disabled ? -1 : tabIndex"
        @mouseleave="handleMouseLeave"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeyDown"
    >
        <template v-for="ind in count + 1" :key="ind">
            <Tooltip
                v-if="tooltips && tooltips[ind - 1]"
                :visible="hoverValue - 1 === ind - 1"
                trigger="custom"
                :content="tooltips[ind - 1]"
            >
                <RatingItem
                    :ref="(el) => saveStarRef(ind - 1, el)"
                    :index="ind - 1"
                    :count="count"
                    :prefixCls="`${prefixCls}-star`"
                    :allowHalf="allowHalf"
                    :value="hoverValue === undefined ? value : hoverValue"
                    :disabled="disabled"
                    :character="character"
                    :focused="focused"
                    :size="ind - 1 === count ? 0 : size"
                    :ariaLabelPrefix="ariaLabelPrefix"
                    :aria-describedby="props['aria-describedby']"
                    :preventScroll="preventScroll"
                    @click="handleItemClick"
                    @hover="handleItemHover"
                    @focus="ind - 1 === count ? handleStarFocusVisible : undefined"
                    @blur="ind - 1 === count ? handleStarBlur : undefined"
                />
            </Tooltip>
            <RatingItem
                v-else
                :ref="(el) => saveStarRef(ind - 1, el)"
                :index="ind - 1"
                :count="count"
                :prefixCls="`${prefixCls}-star`"
                :allowHalf="allowHalf"
                :value="hoverValue === undefined ? value : hoverValue"
                :disabled="disabled"
                :character="character"
                :focused="focused"
                :size="ind - 1 === count ? 0 : size"
                :ariaLabelPrefix="ariaLabelPrefix"
                :aria-describedby="props['aria-describedby']"
                :preventScroll="preventScroll"
                @click="handleItemClick"
                @hover="handleItemHover"
                @focus="ind - 1 === count ? handleStarFocusVisible : undefined"
                @blur="ind - 1 === count ? handleStarBlur : undefined"
            />
        </template>
    </ul>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/rating/constants';
import RatingFoundation from '@douyinfe/semi-foundation/rating/foundation';
import RatingItem from './RatingItem.vue';
import Tooltip from '../tooltip';
import type { RatingProps } from './interface';

const modelValue = defineModel<number>();

const props = withDefaults(defineProps<RatingProps>(), {
    defaultValue: 0,
    count: 5,
    allowHalf: false,
    allowClear: true,
    style: () => ({}),
    prefixCls: cssClasses.PREFIX,
    tabIndex: -1,
    size: 'default',
});

const emit = defineEmits<{
    change: [value: number];
    'update:modelValue': [value: number];
    'update:value': [value: number];
    hoverChange: [value: number];
    focus: [e: FocusEvent];
    blur: [e: FocusEvent];
    keydown: [e: KeyboardEvent];
}>();

const rateRef = ref<HTMLUListElement>();
const starsRef = ref<Record<number, InstanceType<typeof RatingItem>>>({});

const effectiveValue = computed(() => {
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    if (props.value !== undefined) {
        return props.value;
    }
    return props.defaultValue ?? 0;
});

const isControlled = computed(() => modelValue.value !== undefined || props.value !== undefined);
const internalValue = ref(effectiveValue.value);

watch(effectiveValue, (newValue) => {
    if (!isControlled.value) {
        internalValue.value = newValue;
    }
});

const value = computed(() => (isControlled.value ? effectiveValue.value : internalValue.value));

const state = ref({
    value: value.value,
    focused: false,
    hoverValue: undefined as number | undefined,
    clearedValue: null as number | null,
    emptyStarFocusVisible: false,
});

let isInitialized = false;
watch(value, (newValue) => {
    if (isInitialized && state.value.value !== newValue) {
        state.value.value = newValue;
    }
});

provide('direction', 'ltr');

const adapter = {
    focus: () => {
        if (!props.disabled) {
            const index = Math.ceil(value.value) - 1;
            const targetIndex = index < 0 ? props.count : index;
            starsRef.value[targetIndex]?.starFocus();
        }
    },
    getStarDOM: (index: number) => {
        return starsRef.value[index]?.$el;
    },
    notifyHoverChange: (hoverValue: number, clearedValue: number) => {
        state.value.hoverValue = hoverValue;
        state.value.clearedValue = clearedValue;
        emit('hoverChange', hoverValue);
    },
    updateValue: (newValue: number) => {
        if (!isControlled.value) {
            internalValue.value = newValue;
        }
        state.value.value = newValue;
        emit('change', newValue);
        emit('update:modelValue', newValue);
        emit('update:value', newValue);
    },
    clearValue: (clearedValue: number) => {
        state.value.clearedValue = clearedValue;
    },
    notifyFocus: (e: FocusEvent) => {
        state.value.focused = true;
        emit('focus', e);
    },
    notifyBlur: (e: FocusEvent) => {
        state.value.focused = false;
        emit('blur', e);
    },
    notifyKeyDown: (e: KeyboardEvent) => {
        state.value.focused = false;
        emit('keydown', e);
    },
    setEmptyStarFocusVisible: (focusVisible: boolean) => {
        state.value.emptyStarFocusVisible = focusVisible;
    },
    getState: () => state.value,
    getStates: () => state.value,
    getProps: () => props,
    getProp: (key: string) => props[key as keyof RatingProps],
    setState: (states: any) => {
        Object.assign(state.value, states);
    },
    getContext: (key: string) => {
        if (key === 'direction') return 'ltr';
        return undefined;
    },
    getContexts: () => undefined,
    getCache: () => undefined,
    getCaches: () => undefined,
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
};

const foundation = new RatingFoundation(adapter);

const hoverValue = computed(() => state.value.hoverValue);
const focused = computed(() => state.value.focused);

const ariaLabelPrefix = computed(() => {
    if (props['aria-label']) {
        return props['aria-label'];
    }
    let prefix = 'star';
    if (typeof props.character === 'string') {
        prefix = props.character;
    }
    return prefix;
});

const ariaLabel = computed(() => {
    return `Rating: ${value.value} of ${props.count} ${ariaLabelPrefix.value}${value.value === 1 ? '' : 's'},`;
});

const ratingClasses = computed(() => {
    return classNames(
        props.prefixCls,
        {
            [`${props.prefixCls}-disabled`]: props.disabled,
            [`${props.prefixCls}-focus`]: state.value.emptyStarFocusVisible,
        },
        props.className
    );
});

const saveStarRef = (index: number, el: any) => {
    if (el) {
        starsRef.value[index] = el;
    }
};

const handleItemHover = (e: MouseEvent, index: number) => {
    foundation.handleHover(e, index);
};

const handleMouseLeave = () => {
    foundation.handleMouseLeave();
};

const handleItemClick = (e: MouseEvent | KeyboardEvent, index: number) => {
    foundation.handleClick(e, index);
};

const handleFocus = (e: FocusEvent) => {
    foundation.handleFocus(e);
};

const handleBlur = (e: FocusEvent) => {
    foundation.handleBlur(e);
};

const handleKeyDown = (e: KeyboardEvent) => {
    foundation.handleKeyDown(e, value.value);
};

const handleStarFocusVisible = (e: FocusEvent) => {
    foundation.handleStarFocusVisible(e);
};

const handleStarBlur = (e: FocusEvent) => {
    foundation.handleStarBlur(e);
};

const focus = () => {
    if (!props.disabled) {
        rateRef.value?.focus({ preventScroll: props.preventScroll });
    }
};

const blur = () => {
    if (!props.disabled) {
        rateRef.value?.blur();
    }
};

onMounted(() => {
    foundation.init();
    isInitialized = true;
    state.value.value = value.value;
    if (props.autoFocus) {
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
