<template>
    <div :class="dividerClasses" :style="dividerStyle" v-bind="$attrs">
        <span v-if="hasTextChild && layout === 'horizontal'" class="semi-divider_inner-text" x-semi-prop="children">
            <slot></slot>
        </span>
        <slot v-else></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots, CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/divider/constants';
import type { DividerProps } from './interface';

defineOptions({
    inheritAttrs: false,
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<DividerProps>(), {
    layout: 'horizontal',
    align: 'center',
});

const slots = useSlots();

const hasTextChild = computed(() => {
    const children = slots.default?.();
    if (!children || children.length === 0) {
        return false;
    }
    return children.some((child) => {
        return typeof child.children === 'string' || typeof child.children === 'number';
    });
});

const dividerClasses = computed(() => {
    const { layout, dashed, align, className } = props;
    const children = slots.default?.();
    const hasChildren = children && children.length > 0;

    return classNames(`${prefixCls}-divider`, className, {
        [`${prefixCls}-divider-horizontal`]: layout === 'horizontal',
        [`${prefixCls}-divider-vertical`]: layout === 'vertical',
        [`${prefixCls}-divider-dashed`]: !!dashed,
        [`${prefixCls}-divider-with-text`]: hasChildren && layout === 'horizontal',
        [`${prefixCls}-divider-with-text-${align}`]: hasChildren && layout === 'horizontal',
    });
});

const dividerStyle = computed(() => {
    const { margin, layout, style } = props;
    const overrideDefaultStyle: CSSProperties = {};

    if (margin !== undefined) {
        if (layout === 'vertical') {
            overrideDefaultStyle.marginLeft = typeof margin === 'number' ? `${margin}px` : margin;
            overrideDefaultStyle.marginRight = typeof margin === 'number' ? `${margin}px` : margin;
        } else if (layout === 'horizontal') {
            overrideDefaultStyle.marginTop = typeof margin === 'number' ? `${margin}px` : margin;
            overrideDefaultStyle.marginBottom = typeof margin === 'number' ? `${margin}px` : margin;
        }
    }

    return { ...overrideDefaultStyle, ...style };
});
</script>
