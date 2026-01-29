<template>
    <div
        :class="carouselCls"
        :style="props.style"
        v-bind="restAttrs"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div :class="contentCls" x-semi-prop="children">
            <component :is="child" v-for="(child, index) in renderedChildren" :key="getChildKey(child, index)" />
        </div>
        <CarouselIndicator
            v-if="showIndicator && validChildren.length > 1"
            :type="indicatorType"
            :total="validChildren.length"
            :active-index="state.activeIndex"
            :position="indicatorPosition"
            :trigger="trigger"
            :size="indicatorSize"
            :theme="theme"
            :on-indicator-change="onIndicatorChange"
            @indicator-change="onIndicatorChange"
        />
        <CarouselArrow
            v-if="showArrow && validChildren.length > 1"
            :type="arrowType"
            :theme="theme"
            :arrow-props="arrowProps"
            :prev="prev"
            :next="next"
            @prev="prev"
            @next="next"
        />
    </div>
</template>

<script setup lang="ts">
import {
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    useSlots,
    isVNode,
    cloneVNode,
    Comment,
    Fragment,
} from 'vue';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/carousel/constants';
import CarouselFoundation, { CarouselAdapter } from '@douyinfe/semi-foundation/carousel/foundation';
import { useFoundation } from '../_utils';
import type { CarouselProps, CarouselState, CarouselMethod } from './interface';
import CarouselIndicator from './CarouselIndicator.vue';
import CarouselArrow from './CarouselArrow.vue';
import isNullOrUndefined from '@douyinfe/semi-foundation/utils/isNullOrUndefined';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';

defineOptions({
    name: 'Carousel',
});

const props = withDefaults(defineProps<CarouselProps>(), {
    animation: 'slide',
    autoPlay: true,
    arrowType: 'always',
    defaultActiveIndex: numbers.DEFAULT_ACTIVE_INDEX,
    indicatorPosition: 'center',
    indicatorSize: 'small',
    indicatorType: 'dot',
    theme: 'light',
    onChange: () => undefined,
    showArrow: true,
    showIndicator: true,
    slideDirection: 'left',
    speed: numbers.DEFAULT_SPEED,
    trigger: 'click',
});

const emit = defineEmits<{
    change: [index: number, preIndex: number];
}>();

const slots = useSlots();

const defaultIndex = props.defaultActiveIndex ?? numbers.DEFAULT_ACTIVE_INDEX;
const state = reactive<CarouselState>({
    activeIndex: defaultIndex,
    preIndex: defaultIndex,
    isReverse: false,
    isInit: true,
});

const flattenChildren = (children: any[]): any[] => {
    const result: any[] = [];
    for (const child of children) {
        if (!child) continue;
        if (Array.isArray(child)) {
            result.push(...flattenChildren(child));
        } else if (isVNode(child)) {
            if (child.type === Fragment) {
                if (child.children && Array.isArray(child.children)) {
                    result.push(...flattenChildren(child.children));
                }
            } else if (child.type !== Comment) {
                result.push(child);
            }
        }
    }
    return result;
};

const validChildren = computed(() => {
    if (!slots.default) return [];
    try {
        const children = slots.default();
        return flattenChildren(Array.isArray(children) ? children : [children]);
    } catch (e) {
        return [];
    }
});

const renderedChildren = computed(() => {
    return validChildren.value.map((child, index) => renderChild(child, index));
});

const getChildKey = (child: any, index: number) => {
    if (isVNode(child) && child.key != null) {
        return child.key;
    }
    return `carousel-item-${index}`;
};

watch(
    () => props.activeIndex,
    (newIndex) => {
        if (!isNullOrUndefined(newIndex) && newIndex !== state.activeIndex) {
            state.activeIndex = newIndex;
        }
    },
    { immediate: true }
);

const adapter: CarouselAdapter<CarouselProps, CarouselState> = {
    getProps: () => {
        // 过滤掉 undefined 的 props，确保 _isInProps 能正确判断是否为受控组件
        const filteredProps: any = {};
        for (const key in props) {
            if (props[key as keyof CarouselProps] !== undefined) {
                filteredProps[key] = props[key as keyof CarouselProps];
            }
        }
        return filteredProps;
    },
    getProp: (key) => props[key as keyof CarouselProps],
    getState: (key) => state[key as keyof CarouselState],
    getStates: () => state,
    setState: (states, cb) => {
        Object.assign(state, states);
        cb?.();
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e) => e?.stopPropagation(),
    persistEvent: () => {},
    notifyChange: (activeIndex: number, preIndex: number) => {
        emit('change', activeIndex, preIndex);
        props.onChange?.(activeIndex, preIndex);
    },
    setNewActiveIndex: (activeIndex: number) => {
        state.activeIndex = activeIndex;
    },
    setPreActiveIndex: (preIndex: number) => {
        state.preIndex = preIndex;
    },
    setIsReverse: (isReverse: boolean) => {
        state.isReverse = isReverse;
    },
    setIsInit: (isInit: boolean) => {
        state.isInit = isInit;
    },
    getChildren: () => {
        return validChildren.value as any[];
    },
};

const { foundation } = useFoundation(CarouselFoundation, adapter);

const play = () => {
    foundation.setForcePlay(true);
    return foundation.handleAutoPlay();
};

const stop = () => {
    foundation.setForcePlay(false);
    return foundation.stop();
};

const goTo = (targetIndex: number) => {
    return foundation.goTo(targetIndex);
};

const prev = () => {
    foundation.prev();
};

const next = () => {
    foundation.next();
};

const getValidIndex = (activeIndex: number): number => {
    return foundation.getValidIndex(activeIndex);
};

const onIndicatorChange = (activeIndex: number) => {
    return foundation.onIndicatorChange(activeIndex);
};

const handleAutoPlay = () => {
    if (!foundation.getIsControlledComponent()) {
        foundation.handleAutoPlay();
    }
};

const handleMouseEnter = debounce(() => {
    const { autoPlay } = props;
    if (autoPlay === true || (typeof autoPlay === 'object' && autoPlay.hoverToPause)) {
        foundation.stop();
    }
}, 400);

const handleMouseLeave = debounce(() => {
    const { autoPlay } = props;
    if ((typeof autoPlay !== 'object' || autoPlay.hoverToPause) && !foundation.getIsControlledComponent()) {
        foundation.handleAutoPlay();
    }
}, 400);

const carouselCls = computed(() => {
    return classNames(props.className, {
        [cssClasses.CAROUSEL]: true,
    });
});

const contentCls = computed(() => {
    return classNames(`${cssClasses.CAROUSEL_CONTENT}-${props.animation}`, {
        [cssClasses.CAROUSEL_CONTENT]: true,
        [`${cssClasses.CAROUSEL_CONTENT}-reverse`]:
            props.slideDirection === 'left' ? state.isReverse : !state.isReverse,
    });
});

const getChildStyle = (index: number) => {
    const isCurrent = index === state.activeIndex;
    const baseStyle: Record<string, string | number> = {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transitionTimingFunction: 'ease',
        transitionDuration: `${props.speed}ms`,
        animationTimingFunction: 'ease',
        animationDuration: `${props.speed}ms`,
    };

    if (isCurrent) {
        baseStyle.zIndex = 1;
    }

    if (props.animation === 'slide') {
        baseStyle.visibility = isCurrent ? 'visible' : 'hidden';
    } else if (props.animation === 'fade') {
        baseStyle.opacity = isCurrent ? 1 : 0;
    }

    return baseStyle;
};

const getChildCls = (index: number) => {
    const isCurrent = index === state.activeIndex;
    const isPrev = index === getValidIndex(state.activeIndex - 1);
    const isNext = index === getValidIndex(state.activeIndex + 1);

    return classNames({
        [`${cssClasses.CAROUSEL_CONTENT}-item-prev`]: isPrev,
        [`${cssClasses.CAROUSEL_CONTENT}-item-next`]: isNext,
        [`${cssClasses.CAROUSEL_CONTENT}-item-current`]: isCurrent,
        [`${cssClasses.CAROUSEL_CONTENT}-item`]: true,
        [`${cssClasses.CAROUSEL_CONTENT}-item-active`]: isCurrent,
        [`${cssClasses.CAROUSEL_CONTENT}-item-slide-in`]: props.animation === 'slide' && !state.isInit && isCurrent,
        [`${cssClasses.CAROUSEL_CONTENT}-item-slide-out`]:
            props.animation === 'slide' && !state.isInit && index === state.preIndex,
    });
};

const renderChild = (child: any, index: number) => {
    if (!isVNode(child)) {
        return child;
    }

    const childStyle = getChildStyle(index);
    const childCls = getChildCls(index);
    const existingStyle = child.props?.style || {};
    const existingClass = child.props?.class || child.props?.className || '';

    const mergedStyle = {
        ...(typeof existingStyle === 'object' && existingStyle !== null ? existingStyle : {}),
        ...childStyle,
    };

    const mergedClass = classNames(existingClass, childCls);
    const newProps: any = {
        ...(child.props || {}),
        style: mergedStyle,
        class: mergedClass,
    };

    if (child.props?.className) {
        newProps.className = mergedClass;
    }

    if (child.key == null) {
        newProps.key = `carousel-item-${index}`;
    }

    return cloneVNode(child, newProps);
};

const restAttrs = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { className, style, ...rest } = props;
    return getDataAttr(rest);
});

onMounted(() => {
    const defaultActiveIndex = foundation.getDefaultActiveIndex();
    const validActiveIndex = defaultActiveIndex ?? numbers.DEFAULT_ACTIVE_INDEX;
    state.activeIndex = validActiveIndex;
    state.preIndex = validActiveIndex;
    handleAutoPlay();
});

onUnmounted(() => {
    foundation.destroy();
});

defineExpose<CarouselMethod>({
    next,
    prev,
    goTo,
    play,
    stop,
});
</script>
