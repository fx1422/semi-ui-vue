<template>
    <svg
        :class="arrowCls"
        :width="arrowBounding.width"
        :height="arrowBounding.height"
        xmlns="http://www.w3.org/2000/svg"
    >
        <template v-if="isVertical">
            <path
                d="M0 0.5L0 1.5C4 1.5, 5.5 3, 7.5 5S10,8 12,8S14.5 7, 16.5 5S20,1.5 24,1.5L24 0.5L0 0.5z"
                :style="borderStyle"
            />
            <path d="M0 0L0 1C4 1, 5.5 2, 7.5 4S10,7 12,7S14.5  6, 16.5 4S20,1 24,1L24 0L0 0z" :style="bgStyle" />
        </template>
        <template v-else>
            <path
                d="M0.5 0L1.5 0C1.5 4, 3 5.5, 5 7.5S8,10 8,12S7 14.5, 5 16.5S1.5,20 1.5,24L0.5 24L0.5 0z"
                :style="borderStyle"
            />
            <path d="M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z" :style="bgStyle" />
        </template>
    </svg>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import classNames from 'classnames';
import { numbers, cssClasses, strings } from '@douyinfe/semi-foundation/popover/constants';
import type { ArrowStyle } from './interface';

export interface ArrowProps {
    position?: string;
    className?: string;
    arrowStyle?: ArrowStyle;
    popStyle?: CSSProperties;
}

const props = withDefaults(defineProps<ArrowProps>(), {
    position: '',
    className: '',
});

const arrowBounding = numbers.ARROW_BOUNDING;

// 判断是否为垂直方向 (top/bottom)
const isVertical = computed(() => {
    return props.position.indexOf('top') === 0 || props.position.indexOf('bottom') === 0;
});

// 箭头类名
const arrowCls = computed(() => {
    return classNames(props.className, cssClasses.ARROW);
});

// 完全对照 React 的逻辑
// React: const borderOpacity = get(arrowStyle, 'borderOpacity');
const borderOpacity = computed(() => {
    return props.arrowStyle?.borderOpacity;
});

// React: const bgColor = get(arrowStyle, 'backgroundColor', get(popStyle, 'backgroundColor'));
// 使用 DEFAULT_ARROW_STYLE 作为默认值，确保箭头背景色与面板一致
const bgColor = computed(() => {
    return (
        props.arrowStyle?.backgroundColor ??
        props.popStyle?.backgroundColor ??
        strings.DEFAULT_ARROW_STYLE.backgroundColor
    );
});

// React: const borderColor = get(arrowStyle, 'borderColor', get(popStyle, 'borderColor'));
// 使用 DEFAULT_ARROW_STYLE 作为默认值
const borderColor = computed(() => {
    return props.arrowStyle?.borderColor ?? props.popStyle?.borderColor ?? strings.DEFAULT_ARROW_STYLE.borderColor;
});

// 完全对照 React 版本的逻辑
// React 版本即使 bgColor 或 borderColor 是 undefined，也会设置 style={{ fill: undefined }}
// 在 React 中，undefined 值会被忽略，不会应用内联样式，CSS 类会生效
// 现在我们总是有默认值（DEFAULT_ARROW_STYLE），所以总是设置内联样式
const borderStyle = computed(() => {
    return {
        fill: borderColor.value,
        opacity: borderOpacity.value ?? strings.DEFAULT_ARROW_STYLE.borderOpacity,
    };
});

const bgStyle = computed(() => {
    return {
        fill: bgColor.value,
    };
});
</script>
