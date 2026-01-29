<template>
    <span
        :class="badgeCls"
        v-bind="restProps"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <slot></slot>
        <span :class="wrapper" :style="finalCountStyle">
            {{ dot ? null : content }}
        </span>
    </span>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/badge/constants';
import { BadgeProps } from './interface';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<BadgeProps>(), {
    dot: false,
    type: 'primary',
    theme: 'solid',
    position: 'rightTop',
    className: '',
});

const emit = defineEmits<{
    click: [e: MouseEvent];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
}>();

const attrs = useAttrs();
const slots = useSlots();

// Filter out event listeners from attrs to avoid duplication
const restProps = computed(() => {
    const { onClick, onMouseenter, onMouseleave, ...rest } = attrs as any;
    return rest;
});

const isNumber = (val: any): val is number => typeof val === 'number';
const isString = (val: any): val is string => typeof val === 'string';

const custom = computed(() => props.count && !(isNumber(props.count) || isString(props.count)));

const showBadge = computed(() => props.count !== null && typeof props.count !== 'undefined');

const wrapper = computed(() =>
    cls(props.countClassName, {
        [`${prefixCls}-${props.type}`]: !custom.value,
        [`${prefixCls}-${props.theme}`]: !custom.value,
        [`${prefixCls}-${props.position}`]: Boolean(props.position) && Boolean(slots.default),
        [`${prefixCls}-block`]: !slots.default,
        [`${prefixCls}-dot`]: props.dot,
        [`${prefixCls}-count`]: !props.dot && !custom.value && showBadge.value,
        [`${prefixCls}-custom`]: custom.value,
    })
);

const badgeCls = computed(() => cls(prefixCls, props.className));

const content = computed(() => {
    if (isNumber(props.count)) {
        return props.overflowCount && props.overflowCount < props.count ? `${props.overflowCount}+` : `${props.count}`;
    }
    return props.count;
});

const finalCountStyle = computed(() => props.style || props.countStyle);

const handleClick = (e: MouseEvent) => {
    emit('click', e);
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
};

const handleMouseLeave = (e: MouseEvent) => {
    emit('mouseleave', e);
};
</script>
