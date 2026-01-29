<template>
    <div :class="wrapperCls" :style="wrapperStyle" @transitionend="handleTransitionEnd">
        <div :id="id" ref="domRef" :style="contentStyle" x-semi-prop="children">
            <slot v-if="shouldRender"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { CollapsibleProps, CollapsibleState } from './interface';
import { useFoundation } from '../_utils';
import CollapsibleFoundation, { CollapsibleAdapter } from '@douyinfe/semi-foundation/collapsible/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/collapsible/constants';
import classNames from 'classnames';

const props = withDefaults(defineProps<CollapsibleProps>(), {
    isOpen: false,
    duration: 250,
    motion: true,
    keepDOM: false,
    lazyRender: false,
    collapseHeight: 0,
    fade: false,
});

const domRef = ref<HTMLDivElement>();
const resizeObserver = ref<ResizeObserver | null>(null);
const hasBeenRendered = ref(false);

const state = ref<CollapsibleState>({
    domInRenderTree: false,
    domHeight: 0,
    visible: props.isOpen,
    isTransitioning: false,
    cacheIsOpen: props.isOpen,
});

const adapter: CollapsibleAdapter<CollapsibleProps, CollapsibleState> = {
    setDOMInRenderTree: (domInRenderTree: boolean) => {
        if (state.value.domInRenderTree !== domInRenderTree) {
            state.value.domInRenderTree = domInRenderTree;
        }
    },
    setDOMHeight: (domHeight: number) => {
        if (state.value.domHeight !== domHeight) {
            state.value.domHeight = domHeight;
        }
    },
    setVisible: (visible: boolean) => {
        if (state.value.visible !== visible) {
            state.value.visible = visible;
        }
    },
    setIsTransitioning: (isTransitioning: boolean) => {
        if (state.value.isTransitioning !== isTransitioning) {
            state.value.isTransitioning = isTransitioning;
        }
    },
    getContext: () => ({}),
    getContexts: () => ({}),
    getProp: (key: string) => (props as any)[key],
    getProps: () => props,
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (states: Partial<CollapsibleState>) => {
        Object.assign(state.value, states);
    },
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: any) => {
        e.stopPropagation();
    },
    persistEvent: () => {},
};

const { foundation } = useFoundation(CollapsibleFoundation, adapter);

const getEntryInfo = (entry: ResizeObserverEntry) => {
    // 判断是否在渲染树中（父元素或自身是否 display none）
    let inRenderTree: boolean;
    if (entry.borderBoxSize) {
        inRenderTree = !(entry.borderBoxSize[0].blockSize === 0 && entry.borderBoxSize[0].inlineSize === 0);
    } else {
        inRenderTree = !(entry.contentRect.height === 0 && entry.contentRect.width === 0);
    }

    let height = 0;
    if (entry.borderBoxSize) {
        height = Math.ceil(entry.borderBoxSize[0].blockSize);
    } else {
        const target = entry.target as HTMLElement;
        height = target.clientHeight;
    }

    return {
        isShown: inRenderTree,
        height,
    };
};

const handleResize = (entryList: ResizeObserverEntry[]) => {
    const entry = entryList[0];
    if (entry) {
        const entryInfo = getEntryInfo(entry);
        foundation.updateDOMHeight(entryInfo.height);
        foundation.updateDOMInRenderTree(entryInfo.isShown);
    }
};

const isChildrenInRenderTree = () => {
    if (domRef.value) {
        return domRef.value.offsetHeight > 0;
    }
    return false;
};

const handleTransitionEnd = () => {
    if (!props.isOpen) {
        foundation.updateVisible(false);
    }
    foundation.updateIsTransitioning(false);
    props.onMotionEnd?.();
};

// 监听 isOpen 变化
watch(
    () => props.isOpen,
    (newIsOpen) => {
        const isOpenChanged = newIsOpen !== state.value.cacheIsOpen;
        if (isOpenChanged) {
            if (newIsOpen || !props.motion) {
                state.value.visible = newIsOpen;
            }
            if (props.motion) {
                state.value.isTransitioning = true;
            }
        }
        state.value.cacheIsOpen = newIsOpen;
    }
);

// 监听 reCalcKey 变化
watch(
    () => props.reCalcKey,
    () => {
        if (domRef.value) {
            foundation.updateDOMHeight(domRef.value.scrollHeight);
        }
    }
);

// 监听 domInRenderTree 变化
watch(
    () => state.value.domInRenderTree,
    (newValue, oldValue) => {
        if (newValue && newValue !== oldValue && domRef.value) {
            foundation.updateDOMHeight(domRef.value.scrollHeight);
        }
    }
);

onMounted(() => {
    nextTick(() => {
        if (domRef.value && typeof ResizeObserver !== 'undefined') {
            resizeObserver.value = new ResizeObserver(handleResize);
            resizeObserver.value.observe(domRef.value);

            const domInRenderTree = isChildrenInRenderTree();
            foundation.updateDOMInRenderTree(domInRenderTree);
            if (domInRenderTree) {
                foundation.updateDOMHeight(domRef.value.scrollHeight);
            }
        }
    });
});

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
    }
});

const wrapperStyle = computed(() => ({
    overflow: 'hidden',
    height: props.isOpen ? `${state.value.domHeight}px` : `${props.collapseHeight}px`,
    opacity: props.isOpen || !props.fade || props.collapseHeight !== 0 ? 1 : 0,
    transitionDuration: `${props.motion && state.value.isTransitioning ? props.duration : 0}ms`,
    WebkitMaskImage:
        props.collapseHeight > 0 && !props.isOpen
            ? 'linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0.2) 80%, transparent 100%)'
            : undefined,
    maskImage:
        props.collapseHeight > 0 && !props.isOpen
            ? 'linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0.2) 80%, transparent 100%)'
            : undefined,
    ...props.style,
}));

const wrapperCls = computed(() =>
    classNames(
        `${cssClasses.PREFIX}-wrapper`,
        {
            [`${cssClasses.PREFIX}-transition`]: props.motion && state.value.isTransitioning,
        },
        props.className
    )
);

const contentStyle = computed(() => ({
    overflow: 'hidden',
}));

const shouldRender = computed(() => {
    return (
        (props.keepDOM && (props.lazyRender ? hasBeenRendered.value : true)) ||
        props.collapseHeight !== 0 ||
        state.value.visible ||
        props.isOpen
    );
});

// 更新 hasBeenRendered
watch(shouldRender, (newValue) => {
    if (newValue && !hasBeenRendered.value) {
        hasBeenRendered.value = true;
    }
});

// 初始化时如果需要渲染，设置 hasBeenRendered
if (shouldRender.value) {
    hasBeenRendered.value = true;
}

defineExpose({
    foundation: foundation,
});
</script>
