<template>
    <div :class="indicatorCls" :style="style" v-bind="restAttrs">
        <span
            v-for="index in total"
            :key="index - 1"
            :data-index="index - 1"
            :class="getItemCls(index - 1)"
            @click="handleIndicatorClick(index - 1)"
            @mouseenter="handleIndicatorHover(index - 1)"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/carousel/constants';
import type { CarouselIndicatorProps } from './interface';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';

defineOptions({
    name: 'CarouselIndicator',
});

const props = withDefaults(defineProps<CarouselIndicatorProps>(), {
    total: 0,
    activeIndex: 0,
    position: 'center',
    size: 'small',
    theme: 'light',
    type: 'dot',
    trigger: 'click',
});

const restAttrs = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { className, style, total, activeIndex, position, size, theme, type, trigger, onIndicatorChange, ...rest } =
        props;
    return getDataAttr(rest);
});

const indicatorCls = computed(() => {
    return classNames(props.className, {
        [cssClasses.CAROUSEL_INDICATOR]: true,
        [`${cssClasses.CAROUSEL_INDICATOR}-${props.type}`]: props.type,
        [`${cssClasses.CAROUSEL_INDICATOR}-${props.position}`]: props.position,
    });
});

const getItemCls = (index: number) => {
    return classNames(`${cssClasses.CAROUSEL_INDICATOR}-item`, {
        [`${cssClasses.CAROUSEL_INDICATOR}-item-active`]: index === props.activeIndex,
        [`${cssClasses.CAROUSEL_INDICATOR}-item-${props.theme}`]: props.theme,
        [`${cssClasses.CAROUSEL_INDICATOR}-item-${props.size}`]: props.size,
    });
};

const emit = defineEmits<{
    indicatorChange: [activeIndex: number];
}>();

const handleIndicatorClick = (activeIndex: number) => {
    if (props.trigger === 'click') {
        emit('indicatorChange', activeIndex);
        props.onIndicatorChange?.(activeIndex);
    }
};

const handleIndicatorHover = (activeIndex: number) => {
    if (props.trigger === 'hover') {
        emit('indicatorChange', activeIndex);
        props.onIndicatorChange?.(activeIndex);
    }
};
</script>
