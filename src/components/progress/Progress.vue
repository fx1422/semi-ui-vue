<template>
    <div
        v-if="type === 'line'"
        :id="id"
        :class="lineProgressClasses"
        :style="style"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="validPercent"
        v-bind="allAttrs"
    >
        <div :class="progressTrackCls" :style="orbitStroke ? { backgroundColor: orbitStroke } : {}" aria-hidden>
            <div :class="innerCls" :style="innerStyle" aria-hidden />
        </div>
        <div v-if="showInfo" :class="`${prefixCls}-line-text`">
            <component :is="formattedText" v-if="isVNode(formattedText)" />
            <template v-else>{{ formattedText }}</template>
        </div>
    </div>
    <div
        v-else
        :id="id"
        :class="circleProgressClasses"
        :style="style"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="animatedPercent"
        v-bind="allAttrs"
    >
        <svg :key="size" :class="`${prefixCls}-circle-ring`" :height="circleWidth" :width="circleWidth" aria-hidden>
            <circle
                :class="`${prefixCls}-circle-ring-track`"
                :stroke-dashoffset="0"
                :stroke-width="strokeWidth"
                :stroke-dasharray="strokeDasharray"
                :stroke-linecap="strokeLinecap"
                fill="transparent"
                :style="{ stroke: orbitStroke }"
                :r="radius"
                :cx="cx"
                :cy="cy"
                aria-hidden
            />
            <circle
                :class="`${prefixCls}-circle-ring-inner`"
                :stroke-dashoffset="strokeDashoffset"
                :stroke-width="strokeWidth"
                :stroke-dasharray="strokeDasharray"
                :stroke-linecap="strokeLinecap"
                fill="transparent"
                :style="{ stroke: computedStroke }"
                :r="radius"
                :cx="cx"
                :cy="cy"
                aria-hidden
            />
        </svg>
        <span v-if="showInfo && size !== 'small'" :class="`${prefixCls}-circle-text`">
            <component :is="formattedText" v-if="isVNode(formattedText)" />
            <template v-else>{{ formattedText }}</template>
        </span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, isVNode } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/progress/constants';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import { Animation } from '@douyinfe/semi-animation';
import { generateColor } from '@douyinfe/semi-foundation/progress/generates';
import type { ProgressProps, StrokeArr } from './interface';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<ProgressProps>(), {
    className: '',
    direction: 'horizontal',
    motion: true,
    percent: 0,
    showInfo: false,
    size: 'default',
    strokeGradient: false,
    strokeLinecap: 'round',
    strokeWidth: 4,
    type: 'line',
});

// Get all attributes (data + aria)
const allAttrs = computed(() => {
    const {
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-valuetext': ariaValuetext,
        className,
        direction,
        format,
        id,
        motion,
        orbitStroke,
        percent,
        showInfo,
        size,
        stroke,
        strokeGradient,
        strokeLinecap,
        strokeWidth,
        style,
        type,
        width,
        ...rest
    } = props;

    const attrs: Record<string, any> = getDataAttr(rest);

    // Add aria attributes if they exist
    if (ariaLabel) attrs['aria-label'] = ariaLabel;
    if (ariaLabelledby) attrs['aria-labelledby'] = ariaLabelledby;
    if (ariaValuetext) attrs['aria-valuetext'] = ariaValuetext;

    return attrs;
});

// State for animation
const animatedPercent = ref(props.percent);
let animation: Animation | null = null;
let mounted = true;

// Calc valid percent (clamp between 0-100)
const calcPercent = (percent: number): number => {
    if (percent > 100) {
        return 100;
    } else if (percent < 0) {
        return 0;
    }
    return percent;
};

const validPercent = computed(() => calcPercent(props.percent));

// Select stroke color
const selectStroke = (stroke: string | StrokeArr, percent: number, strokeGradient: boolean): string | undefined => {
    if (typeof stroke === 'string') {
        return stroke;
    }
    const color = generateColor(stroke, percent, strokeGradient);
    if (typeof color !== 'undefined') {
        return color;
    }
    return undefined;
};

const computedStroke = computed(() => {
    return selectStroke(props.stroke, props.percent, props.strokeGradient);
});

// Format function
const defaultFormat = (text: number): string => `${text}%`;
const formatFunc = computed(() => props.format || defaultFormat);

const formattedText = computed(() => {
    const percNumber = calcPercent(animatedPercent.value);
    return formatFunc.value(percNumber);
});

// Line progress styles
const lineProgressClasses = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-horizontal`]: props.direction === 'horizontal',
        [`${prefixCls}-vertical`]: props.direction !== 'horizontal',
        [`${prefixCls}-large`]: props.size === 'large',
    });
});

const progressTrackCls = computed(() => {
    return classNames({
        [`${prefixCls}-track`]: true,
    });
});

const innerCls = computed(() => {
    return `${prefixCls}-track-inner`;
});

const innerStyle = computed(() => {
    const perc = validPercent.value;
    const _stroke = selectStroke(props.stroke, props.percent, props.strokeGradient);
    const style: Record<string, any> = {};

    // Handle gradient for line progress
    if (props.strokeGradient && Array.isArray(props.stroke)) {
        // Create CSS linear gradient for line progress
        const gradientStops = props.stroke
            .sort((a, b) => a.percent - b.percent)
            .map((stop) => `${stop.color} ${stop.percent}%`)
            .join(', ');
        style.background = `linear-gradient(to right, ${gradientStops})`;
    } else {
        style.background = _stroke;
    }

    if (props.direction === 'horizontal') {
        style.width = `${perc}%`;
    } else {
        style.height = `${perc}%`;
    }
    return style;
});

// Circle progress styles
const circleProgressClasses = computed(() => {
    return classNames(`${prefixCls}-circle`, props.className);
});

const circleWidth = computed(() => {
    if (props.width) {
        return props.width;
    }
    if (props.size === 'small') {
        return 24;
    } else if (props.size === 'default') {
        return 72;
    } else if (props.size === 'large') {
        return 96;
    }
    return 72; // fallback to default
});

const cy = computed(() => circleWidth.value / 2);
const cx = computed(() => circleWidth.value / 2);
const radius = computed(() => (circleWidth.value - props.strokeWidth) / 2);
const circumference = computed(() => radius.value * 2 * Math.PI);

const strokeDashoffset = computed(() => {
    const perc = validPercent.value;
    return (1 - perc / 100) * circumference.value;
});

const strokeDasharray = computed(() => {
    return `${circumference.value} ${circumference.value}`;
});

// Watch percent changes for animation
watch(
    () => props.percent,
    (newPercent, oldPercent) => {
        if (isNaN(newPercent) || isNaN(oldPercent)) {
            throw new Error('[Semi Progress]:percent can not be NaN');
        }

        if (oldPercent === newPercent) {
            return;
        }

        if (!props.motion) {
            animatedPercent.value = newPercent;
            return;
        }

        // Destroy previous animation
        if (animation && animation.destroy) {
            animation.destroy();
        }

        animation = new Animation(
            {
                from: { value: oldPercent },
                to: { value: newPercent },
            },
            {
                easing: 'linear',
                duration: 300,
            }
        );

        animation.on('frame', (animProps: any) => {
            if (!mounted) {
                return;
            }
            const percentNumber = parseInt(animProps.value);
            animatedPercent.value = percentNumber;
        });

        animation.on('rest', () => {
            if (!mounted) {
                return;
            }
            animatedPercent.value = newPercent;
        });

        animation.start();
    }
);

onUnmounted(() => {
    if (animation && animation.destroy) {
        animation.destroy();
    }
    mounted = false;
});
</script>
