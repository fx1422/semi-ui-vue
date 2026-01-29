<template>
    <ResizeObserver v-if="renderMode === 'collapse'" @resize="handleResize">
        <div
            :class="containerClassName"
            :style="
                {
                    ...(style as any),
                    maxWidth: '100%',
                    visibility: state.overflowStatus === 'calculating' ? 'hidden' : 'visible',
                } as any
            "
        >
            <template v-if="collapseFrom === 'start'">
                <component :is="renderOverflow()" />
            </template>

            <ResizeObserver
                v-for="(item, idx) in state.visible"
                :key="getItemKey(item, idx)"
                @resize="(entries) => onItemResize(entries[0], item, idx)"
            >
                <div :class="`${prefixCls}-item`">
                    <component :is="visibleItemRenderer(item, idx)" />
                </div>
            </ResizeObserver>

            <template v-if="collapseFrom === 'end'">
                <component :is="renderOverflow()" />
            </template>
        </div>
    </ResizeObserver>

    <IntersectionObserver v-else :root="scroller" :threshold="threshold" :items="itemRefs" @intersect="handleIntersect">
        <div ref="containerRef" :class="containerClassName" :style="style as any">
            <template v-if="overflowRenderDirection === 'both'">
                <component :is="overflowElements[0]" />
            </template>
            <template v-else-if="overflowRenderDirection === 'start'">
                <component :is="overflowElements[1]" />
                <component :is="overflowElements[0]" />
            </template>

            <div ref="scroller" :class="[wrapperClassName, `${prefixCls}-scroll-wrapper`]" :style="wrapperStyle as any">
                <component
                    :is="element"
                    v-for="(element, idx) in visibleElements"
                    :key="element.key"
                    :ref="(el) => setItemRef(element.key, el)"
                    :data-scrollkey="element.key"
                />
            </div>

            <template v-if="overflowRenderDirection === 'both'">
                <component :is="overflowElements[1]" />
            </template>
            <template v-else-if="overflowRenderDirection === 'end'">
                <component :is="overflowElements[0]" />
                <component :is="overflowElements[1]" />
            </template>
        </div>
    </IntersectionObserver>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, watch, VNode, nextTick, onMounted } from 'vue';
import { isEqual, get } from 'lodash-es';
import { cssClasses, strings, numbers } from '@douyinfe/semi-foundation/overflowList/constants';
import OverflowListFoundation, { OverflowListAdapter } from '@douyinfe/semi-foundation/overflowList/foundation';
import ResizeObserver from '../_resizeObserver';
import type { ResizeEntry } from '../_resizeObserver';
import IntersectionObserver from './IntersectionObserver.vue';
import type { OverflowListProps, OverflowListState, OverflowItem } from './interface';
import copy from 'fast-copy';

defineOptions({
    name: 'OverflowList',
});

const props = withDefaults(defineProps<OverflowListProps>(), {
    collapseFrom: 'end',
    minVisibleItems: 0,
    renderMode: 'collapse',
    threshold: 0.75,
    overflowRenderDirection: 'both',
});

const emit = defineEmits<{
    intersect: [res: { [key: string]: IntersectionObserverEntry }];
    overflow: [overflowItems: Array<OverflowItem>];
    visibleStateChange: [visibleState: Map<string, boolean>];
}>();

const prefixCls = cssClasses.PREFIX;
const containerRef = ref<HTMLElement>();
const Boundary = strings.BOUNDARY_MAP;
const OverflowDirection = strings.OVERFLOW_DIR;
const RenderMode = strings.MODE_MAP;

const scroller = ref<HTMLDivElement>();
const itemRefs = reactive<Record<string, HTMLElement | null>>({});
const itemSizeMap = reactive<Map<string | number, number>>(new Map());

const state = reactive<OverflowListState>({
    direction: 'grow',
    lastOverflowCount: 0,
    overflow: [],
    visible: [],
    containerWidth: 0,
    visibleState: new Map(),
    itemSizeMap: new Map(),
    overflowStatus: 'calculating',
    pivot: -1,
    overflowWidth: 0,
    maxCount: 0,
});

const isScrollMode = (): boolean => {
    return props.renderMode === RenderMode.SCROLL;
};

const getItemKey = (item: OverflowItem, defaultKey?: string | number) => {
    const { itemKey } = props;
    if (typeof itemKey === 'function') {
        return (itemKey as (it: OverflowItem) => string | number)(item);
    }
    return get(item, itemKey || 'key', defaultKey);
};

const setItemRef = (key: string, el: HTMLElement | null | any) => {
    const extractDOMElement = (element: any): HTMLElement | null => {
        if (!element) return null;

        // Direct DOM element
        if (element instanceof HTMLElement) {
            return element;
        }
        if (element instanceof Element) {
            return element as HTMLElement;
        }

        // Vue component instance - try multiple ways to get DOM element
        // 1. Try $el (Vue 3 component instance root element)
        if (element.$el && element.$el instanceof HTMLElement) {
            return element.$el;
        }

        // 2. Try tabItemRef (TabItem exposed ref)
        if (element.tabItemRef) {
            const refValue = element.tabItemRef;
            if (refValue instanceof HTMLElement) {
                return refValue;
            }
            if (refValue?.value instanceof HTMLElement) {
                // If it's a ref object
                return refValue.value;
            }
        }

        // 3. Try to find the root element in the component setup state
        if (element.setupState?.tabItemRef?.value instanceof HTMLElement) {
            return element.setupState.tabItemRef.value;
        }

        return null;
    };

    if (el) {
        const domElement = extractDOMElement(el);
        if (domElement) {
            itemRefs[key] = domElement;
        } else {
            // If not a DOM element yet, try again on next tick (component might not be mounted)
            nextTick(() => {
                const retryElement = extractDOMElement(el);
                if (retryElement) {
                    itemRefs[key] = retryElement;
                } else {
                    delete itemRefs[key];
                }
            });
        }
    } else {
        delete itemRefs[key];
    }
};

const adapter: OverflowListAdapter = {
    getProps: () => props,
    getState: (key) => state[key],
    getStates: () => state,
    setState: (newState) => {
        Object.assign(state, newState);
    },
    getProp: (key) => props[key],
    getContext: () => ({}),
    getContexts: () => ({}),
    getCache: () => ({}),
    getCaches: () => ({}),
    setCache: () => {},
    updateVisibleState: (visibleState: Map<string, boolean>) => {
        state.visibleState = visibleState;
        emit('visibleStateChange', visibleState);
    },
    updateStates: (states: Partial<OverflowListState>) => {
        Object.assign(state, states);
    },
    notifyIntersect: (res) => {
        emit('intersect', res);
    },
    getItemSizeMap: () => {
        const map = new Map<string, number>();
        itemSizeMap.forEach((value, key) => {
            map.set(String(key), value);
        });
        return map;
    },
    stopPropagation: (e?: Event) => e?.stopPropagation(),
    persistEvent: () => {},
};

const foundation = new OverflowListFoundation(adapter);

// Initialize visible items based on props changes
watch(
    () => [props.items, props.style, props.renderMode],
    () => {
        state.direction = 'grow';
        state.lastOverflowCount = 0;
        state.maxCount = 0;

        if (props.renderMode === RenderMode.SCROLL) {
            state.visible = props.items || [];
            state.overflow = [];
        } else {
            let maxCount = (props.items || []).length;
            // If containerWidth is 0, set initial visible to all items
            // This allows ResizeObserver to trigger and calculate properly
            if (
                state.containerWidth > 0 &&
                Math.floor(state.containerWidth / numbers.MINIMUM_HTML_ELEMENT_WIDTH) !== 0
            ) {
                maxCount = Math.min(maxCount, Math.floor(state.containerWidth / numbers.MINIMUM_HTML_ELEMENT_WIDTH));
            }

            const isCollapseFromStart = props.collapseFrom === Boundary.START;
            const items = props.items || [];
            const visible = isCollapseFromStart ? copy(items).reverse().slice(0, maxCount) : items.slice(0, maxCount);
            const overflow = isCollapseFromStart ? copy(items).reverse().slice(maxCount) : items.slice(maxCount);

            state.visible = visible;
            state.overflow = overflow;
            state.maxCount = maxCount;
        }

        state.pivot = -1;
        // Only set to calculating if we have a container width, otherwise show items immediately
        // This prevents items from being hidden when container width is 0
        if (state.containerWidth > 0) {
            state.overflowStatus = 'calculating';
        } else {
            // If no container width yet, show items immediately and let ResizeObserver handle calculation
            state.overflowStatus = 'normal';
        }
    },
    { deep: true, immediate: true }
);

// Handle overflow calculation when status changes
watch(
    () => state.overflowStatus,
    (status) => {
        if (!isScrollMode() && status === 'calculating') {
            foundation.handleCollapseOverflow();
        }
    }
);

const handleResize = (entries: Array<ResizeEntry> = []) => {
    const containerWidth = entries[0]?.target.clientWidth;
    state.containerWidth = containerWidth;
    state.overflowStatus = 'calculating';
};

const handleIntersect = (entries: Array<IntersectionObserverEntry>) => {
    foundation.handleIntersect(entries);
};

const onItemResize = (entry: ResizeEntry, item: OverflowItem, idx: number) => {
    const key = getItemKey(item, idx);
    const newWidth = entry.target.clientWidth;
    const previousWidth = itemSizeMap.get(key);

    // 只在宽度变化时更新
    if (previousWidth !== newWidth) {
        itemSizeMap.set(key, newWidth);

        // 只在已有宽度的情况下才触发重新计算（避免初始化时重复计算）
        if (previousWidth !== undefined) {
            state.overflowStatus = 'calculating';
        }
    }

    // 所有项都已测量完毕，触发最终计算
    const { maxCount } = state;
    if (itemSizeMap.size === maxCount && state.overflowStatus !== 'calculating') {
        state.overflowStatus = 'calculating';
    }
};

const renderOverflow = () => {
    const overflow = foundation.getOverflowItem();
    const overflowNode = props.overflowRenderer?.(overflow) || null;

    if (!isScrollMode() && overflowNode) {
        if (Array.isArray(overflowNode)) {
            return h('div', {}, overflowNode as any);
        }

        // 包裹在 ResizeObserver 中以监听溢出区域尺寸
        return h(
            ResizeObserver,
            {
                onResize: ([entry]: ResizeEntry[]) => {
                    const newWidth = entry.target.clientWidth;
                    if (state.overflowWidth !== newWidth) {
                        state.overflowWidth = newWidth;
                        state.overflowStatus = 'calculating';
                    }
                },
            },
            () => h('div', { class: `${prefixCls}-overflow` }, overflowNode as any)
        );
    }

    return overflowNode;
};

const containerClassName = computed(() => {
    return [prefixCls, props.className];
});

const visibleElements = computed(() => {
    if (!isScrollMode()) {
        return [];
    }

    const elements: any[] = [];
    const visible = state.visible;

    for (let idx = 0; idx < visible.length; idx++) {
        const item = visible[idx];
        let element: any = null;
        if (typeof props.visibleItemRenderer === 'function') {
            element = (props.visibleItemRenderer as (it: OverflowItem, i: number) => any)(item, idx);
        } else {
            element = (props.visibleItemRenderer as any) || null;
        }
        if (element) {
            // 直接修改 key 属性，避免对象扩展
            element.key = getItemKey(item, idx);
            elements.push(element);
        }
    }

    return elements;
});

const overflowElements = computed(() => {
    if (!isScrollMode()) {
        return [null, null];
    }

    const overflow = renderOverflow();
    return Array.isArray(overflow) ? overflow : [overflow, null];
});
</script>
