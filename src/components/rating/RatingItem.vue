<template>
    <li :class="starClasses" :style="sizeStyle">
        <div :class="starWrapClasses" @click="handleClick" @keydown="handleKeyDown" @mousemove="handleHover">
            <div
                v-if="allowHalf && !isEmpty"
                ref="firstStarRef"
                role="radio"
                :aria-checked="value === index + 0.5"
                :aria-posinset="2 * index + 1"
                :aria-setsize="ariaSetSize"
                :aria-disabled="disabled"
                :aria-label="`${index + 0.5} ${ariaLabelPrefix}s`"
                :aria-labelledby="props['aria-describedby']"
                :aria-describedby="props['aria-describedby']"
                :class="firstStarClasses"
                :style="{ width: `${firstWidth * 100}%` }"
                :tabindex="!disabled && value === index + 0.5 ? 0 : -1"
                @focus="handleFirstStarFocus"
                @blur="handleFirstStarBlur"
            >
                <component
                    :is="isComponent ? props.character : renderContent()"
                    v-if="!isComponent || props.character"
                    :size="isComponent ? iconSize : undefined"
                    :style="isComponent ? { display: 'block' } : undefined"
                />
            </div>
            <div
                ref="secondStarRef"
                role="radio"
                :aria-checked="isEmpty ? value === 0 : value === index + 1"
                :aria-posinset="allowHalf ? 2 * (index + 1) : index + 1"
                :aria-setsize="ariaSetSize"
                :aria-disabled="disabled"
                :aria-label="`${isEmpty ? 0 : index + 1} ${ariaLabelPrefix}${index === 0 ? '' : 's'}`"
                :aria-labelledby="props['aria-describedby']"
                :aria-describedby="props['aria-describedby']"
                :class="secondStarClasses"
                :tabindex="secondStarTabIndex"
                @focus="handleSecondStarFocus"
                @blur="handleSecondStarBlur"
            >
                <component
                    :is="isComponent ? props.character : renderContent()"
                    v-if="!isComponent || props.character"
                    :size="isComponent ? iconSize : undefined"
                    :style="isComponent ? { display: 'block' } : undefined"
                />
            </div>
        </div>
    </li>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, onUnmounted, type PropType, type VNode, type Component } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/rating/constants';
import { IconStar } from '../icons';
import type { RatingItemProps } from './interface';
import { RatingItemFoundation } from '@douyinfe/semi-foundation/rating/foundation';
import { isEnterPressed } from '../_utils';

const props = defineProps({
    value: {
        type: Number,
        required: true,
    },
    index: {
        type: Number,
        required: true,
    },
    prefixCls: {
        type: String,
        required: true,
    },
    allowHalf: {
        type: Boolean,
        default: false,
    },
    character: {
        type: [Object, String, Function] as PropType<Component | VNode | string>,
        required: false,
    },
    focused: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    count: {
        type: Number,
        required: true,
    },
    ariaLabelPrefix: {
        type: String,
        required: true,
    },
    size: {
        type: [Number, String] as PropType<number | 'default' | 'small'>,
        required: true,
    },
    'aria-describedby': {
        type: String,
        required: false,
    },
    preventScroll: {
        type: Boolean,
        required: false,
    },
});

const emit = defineEmits<{
    hover: [e: MouseEvent, index: number];
    click: [e: MouseEvent | KeyboardEvent, index: number];
    focus: [e: FocusEvent];
    blur: [e: FocusEvent];
}>();

const firstStarRef = ref<HTMLDivElement>();
const secondStarRef = ref<HTMLDivElement>();

const state = ref({
    firstStarFocus: false,
    secondStarFocus: false,
});

const adapter = {
    setFirstStarFocus: (value: boolean) => {
        state.value.firstStarFocus = value;
    },
    setSecondStarFocus: (value: boolean) => {
        state.value.secondStarFocus = value;
    },
    getState: () => state.value,
    getStates: () => state.value,
    getProps: () => props,
    getProp: (key: string) => props[key as keyof RatingItemProps],
    setState: (states: any) => {
        Object.assign(state.value, states);
    },
    getContext: () => undefined,
    getContexts: () => undefined,
    getCache: () => undefined,
    getCaches: () => undefined,
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
};

const foundation = new RatingItemFoundation(adapter);

const starValue = computed(() => props.index + 1);
const diff = computed(() => starValue.value - props.value);
const isHalf = computed(() => props.allowHalf && diff.value < 1 && diff.value > 0);
const firstWidth = computed(() => 1 - diff.value);
const isFull = computed(() => starValue.value <= props.value);
const isEmpty = computed(() => props.index === props.count);
const isCustomSize = computed(() => typeof props.size === 'number');

const starClasses = computed(() => {
    return classNames(props.prefixCls, {
        [`${props.prefixCls}-half`]: isHalf.value,
        [`${props.prefixCls}-full`]: isFull.value,
        [`${props.prefixCls}-${props.size}`]: !isCustomSize.value,
    });
});

const sizeStyle = computed(() => {
    if (isCustomSize.value) {
        const size = props.size as number;
        return {
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${size}px`,
        };
    }
    return {};
});

const starWrapClasses = computed(() => {
    return classNames(`${props.prefixCls}-wrapper`, {
        [`${props.prefixCls}-disabled`]: props.disabled,
        [`${cssClasses.PREFIX}-focus`]:
            (state.value.firstStarFocus || state.value.secondStarFocus) && props.value !== 0,
    });
});

const firstStarClasses = computed(() => {
    return classNames(`${props.prefixCls}-first`, `${cssClasses.PREFIX}-no-focus`);
});

const secondStarClasses = computed(() => {
    return classNames(`${props.prefixCls}-second`, `${cssClasses.PREFIX}-no-focus`);
});

const ariaSetSize = computed(() => {
    return props.allowHalf ? props.count * 2 + 1 : props.count + 1;
});

const secondStarTabIndex = computed(() => {
    return !props.disabled && (props.value === props.index + 1 || (isEmpty.value && props.value === 0)) ? 0 : -1;
});

const iconSize = computed(() => {
    return isCustomSize.value ? 'inherit' : props.size === 'small' ? 'default' : 'extra-large';
});

const isComponent = computed(() => {
    if (!props.character || typeof props.character === 'string') {
        return false;
    }
    // 判断是否是 Component：有 __name、name 属性，或者是函数
    const char = props.character as any;
    return (
        typeof char === 'function' ||
        (typeof char === 'object' && (char.__name || char.name || char.setup || char.render))
    );
});

const renderContent = () => {
    if (props.character && !isComponent.value) {
        return () => props.character;
    }
    return () => h(IconStar, { size: iconSize.value, style: { display: 'block' } });
};

const handleHover = (e: MouseEvent) => {
    if (!props.disabled) {
        emit('hover', e, props.index);
    }
};

const handleClick = (e: MouseEvent) => {
    if (!props.disabled) {
        emit('click', e, props.index);
    }
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (!props.disabled && isEnterPressed(e)) {
        emit('click', e, props.index);
    }
};

const handleFirstStarFocus = (e: FocusEvent) => {
    emit('focus', e);
    foundation.handleFocusVisible(e, 'first');
};

const handleFirstStarBlur = (e: FocusEvent) => {
    emit('blur', e);
    foundation.handleBlur(e, 'first');
};

const handleSecondStarFocus = (e: FocusEvent) => {
    emit('focus', e);
    foundation.handleFocusVisible(e, 'second');
};

const handleSecondStarBlur = (e: FocusEvent) => {
    emit('blur', e);
    foundation.handleBlur(e, 'second');
};

const starFocus = () => {
    if (props.value - props.index === 0.5) {
        firstStarRef.value?.focus({ preventScroll: props.preventScroll });
    } else {
        secondStarRef.value?.focus({ preventScroll: props.preventScroll });
    }
};

onMounted(() => {
    // RatingItemFoundation doesn't have init method
});

onUnmounted(() => {
    // RatingItemFoundation doesn't have destroy method
});

defineExpose({
    starFocus,
});
</script>
