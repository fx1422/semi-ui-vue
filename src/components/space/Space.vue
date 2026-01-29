<template>
    <div :class="spaceClasses" :style="spaceStyle" x-semi-prop="children">
        <component :is="child" v-for="(child, index) in childrenNodes" :key="index" />
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/space/constants';
import type { SpaceProps } from './interface';
import { flatten } from './utils';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<SpaceProps>(), {
    vertical: false,
    wrap: false,
    spacing: 'tight',
    align: 'center',
});

const slots = useSlots();

const childrenNodes = computed(() => {
    const children = slots.default?.() || [];
    return flatten(children);
});

const spaceStyle = computed(() => {
    const { spacing, style } = props;
    const realStyle = { ...style };

    if (typeof spacing === 'number') {
        realStyle.rowGap = `${spacing}px`;
        realStyle.columnGap = `${spacing}px`;
    } else if (Array.isArray(spacing)) {
        // 数组：[horizontal, vertical]
        const [horizontal, vertical] = spacing;
        if (typeof horizontal === 'number') {
            realStyle.columnGap = `${horizontal}px`;
        }
        if (typeof vertical === 'number') {
            realStyle.rowGap = `${vertical}px`;
        }
    }

    return realStyle;
});

const spacingTypes = computed(() => {
    const { spacing } = props;
    let spacingHorizontalType = '';
    let spacingVerticalType = '';

    if (typeof spacing === 'string') {
        spacingHorizontalType = spacing;
        spacingVerticalType = spacing;
    } else if (Array.isArray(spacing)) {
        const [horizontal, vertical] = spacing;
        if (typeof horizontal === 'string') {
            spacingHorizontalType = horizontal;
        }
        if (typeof vertical === 'string') {
            spacingVerticalType = vertical;
        }
    }

    return { spacingHorizontalType, spacingVerticalType };
});

const spaceClasses = computed(() => {
    const { wrap, align, vertical, className } = props;
    const { spacingHorizontalType, spacingVerticalType } = spacingTypes.value;
    const isWrap = wrap && vertical ? false : wrap;

    return classNames(prefixCls, className, {
        [`${prefixCls}-align-${align}`]: align,
        [`${prefixCls}-vertical`]: vertical,
        [`${prefixCls}-horizontal`]: !vertical,
        [`${prefixCls}-wrap`]: isWrap,
        [`${prefixCls}-tight-horizontal`]: spacingHorizontalType === strings.SPACING_TIGHT,
        [`${prefixCls}-tight-vertical`]: spacingVerticalType === strings.SPACING_TIGHT,
        [`${prefixCls}-medium-horizontal`]: spacingHorizontalType === strings.SPACING_MEDIUM,
        [`${prefixCls}-medium-vertical`]: spacingVerticalType === strings.SPACING_MEDIUM,
        [`${prefixCls}-loose-horizontal`]: spacingHorizontalType === strings.SPACING_LOOSE,
        [`${prefixCls}-loose-vertical`]: spacingVerticalType === strings.SPACING_LOOSE,
    });
});
</script>
