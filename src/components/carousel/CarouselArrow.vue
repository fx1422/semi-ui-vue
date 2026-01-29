<template>
    <div :class="arrowCls">
        <div :class="leftCls" v-bind="leftArrowProps" x-semi-prop="arrowProps.leftArrow.children" @click="handlePrev">
            <component :is="leftIcon" />
        </div>
        <div
            :class="rightCls"
            v-bind="rightArrowProps"
            x-semi-prop="arrowProps.rightArrow.children"
            @click="handleNext"
        >
            <component :is="rightIcon" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/carousel/constants';
import type { CarouselArrowProps } from './interface';
import { IconChevronLeft, IconChevronRight } from '../icons';
import { get } from 'lodash-es';

defineOptions({
    name: 'CarouselArrow',
});

const props = withDefaults(defineProps<CarouselArrowProps>(), {
    type: 'always',
    theme: 'light',
});

const arrowCls = computed(() => {
    return classNames({
        [cssClasses.CAROUSEL_ARROW]: true,
        [`${cssClasses.CAROUSEL_ARROW}-${props.theme}`]: props.theme,
        [`${cssClasses.CAROUSEL_ARROW}-hover`]: props.type === 'hover',
    });
});

const leftCls = computed(() => {
    return classNames({
        [`${cssClasses.CAROUSEL_ARROW}-prev`]: true,
        [`${cssClasses.CAROUSEL_ARROW}-${props.theme}`]: props.theme,
    });
});

const rightCls = computed(() => {
    return classNames({
        [`${cssClasses.CAROUSEL_ARROW}-next`]: true,
        [`${cssClasses.CAROUSEL_ARROW}-${props.theme}`]: props.theme,
    });
});

const leftIcon = computed(() => {
    const customIcon = get(props, 'arrowProps.leftArrow.children');
    if (customIcon) {
        return typeof customIcon === 'string' ? () => customIcon : customIcon;
    }
    return h(IconChevronLeft, { 'aria-label': 'Previous index', size: 'inherit' });
});

const rightIcon = computed(() => {
    const customIcon = get(props, 'arrowProps.rightArrow.children');
    if (customIcon) {
        return typeof customIcon === 'string' ? () => customIcon : customIcon;
    }
    return h(IconChevronRight, { 'aria-label': 'Next index', size: 'inherit' });
});

const leftArrowProps = computed(() => {
    return get(props, 'arrowProps.leftArrow.props', {});
});

const rightArrowProps = computed(() => {
    return get(props, 'arrowProps.rightArrow.props', {});
});

const handlePrev = () => {
    props.prev?.();
};

const handleNext = () => {
    props.next?.();
};
</script>
