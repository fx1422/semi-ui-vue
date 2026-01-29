<template>
    <div ref="groupRef" :class="groupCls" :style="groupStyle" v-bind="dataAttrs">
        <div v-if="state.isResizing" :style="state.backgroundStyle" :class="`${cssClasses.PREFIX}-background`" />
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import type { CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/resizable/constants';
import { ResizeGroupFoundation, type ResizeGroupAdapter } from '@douyinfe/semi-foundation/resizable/foundation';
import type { ResizeCallback, ResizeEventType, ResizeStartCallback } from '@douyinfe/semi-foundation/resizable/types';
import { provideResizeContext, type ResizeContextProps } from './resizeContext';
import '../resizable.scss';

defineOptions({
    name: 'SemiResizeGroup',
});

interface ResizeGroupProps {
    direction?: 'horizontal' | 'vertical';
    className?: string;
    style?: CSSProperties;
}

const props = withDefaults(defineProps<ResizeGroupProps>(), {
    direction: 'horizontal',
    style: () => ({}),
});

const groupRef = ref<HTMLDivElement>();

const state = reactive({
    isResizing: false,
    originalPosition: {
        x: 0,
        y: 0,
        lastItemSize: 0,
        nextItemSize: 0,
        lastOffset: 0,
        nextOffset: 0,
    },
    backgroundStyle: {
        cursor: 'auto',
    } as CSSProperties,
    curHandler: null as number | null,
});

const itemRefs = new Map<number, Ref<HTMLDivElement | undefined>>();
const itemMinMap = new Map<number, string>();
const itemMaxMap = new Map<number, string>();
// itemMinusMap is used by foundation internally
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const itemMinusMap = new Map<number, number>();
const itemDefaultSizeList = new Map<number, string | number>();
const itemResizeStart = new Map<number, ResizeStartCallback>();
const itemResizing = new Map<number, ResizeCallback>();
const itemResizeEnd = new Map<number, ResizeCallback>();
const handlerRefs = new Map<number, Ref<HTMLDivElement | undefined>>();

function getDataAttr(propsData: Record<string, unknown>) {
    const dataAttrs: Record<string, unknown> = {};
    Object.keys(propsData).forEach((key) => {
        if (key.startsWith('data-')) {
            dataAttrs[key] = propsData[key];
        }
    });
    return dataAttrs;
}

const restProps = computed(() => {
    const propsData = props as unknown as Record<string, unknown>;
    const omitKeys = ['style', 'className', 'direction'];
    const rest: Record<string, unknown> = {};
    Object.keys(propsData).forEach((key) => {
        if (!omitKeys.includes(key)) {
            rest[key] = propsData[key];
        }
    });
    return rest;
});

const dataAttrs = computed(() => getDataAttr(restProps.value));

const registerItem = (
    ref: Ref<HTMLDivElement | undefined>,
    min: string,
    max: string,
    defaultSize: string | number,
    onResizeStart: ResizeStartCallback,
    onChange: ResizeCallback,
    onResizeEnd: ResizeCallback
): number => {
    if (Array.from(itemRefs.values()).some((r) => r === ref)) {
        return -1;
    }
    const index = itemRefs.size;
    itemRefs.set(index, ref);
    itemMinMap.set(index, min);
    itemMaxMap.set(index, max);
    itemDefaultSizeList.set(index, defaultSize);
    itemResizeStart.set(index, onResizeStart);
    itemResizing.set(index, onChange);
    itemResizeEnd.set(index, onResizeEnd);
    return index;
};

const registerHandler = (ref: Ref<HTMLDivElement | undefined>): number => {
    if (Array.from(handlerRefs.values()).some((r) => r === ref)) {
        return -1;
    }
    const index = handlerRefs.size;
    handlerRefs.set(index, ref);
    return index;
};

const getGroupSize = (): number => {
    if (groupRef.value) {
        return props.direction === 'horizontal' ? groupRef.value.offsetWidth : groupRef.value.offsetHeight;
    }
    return 0;
};

const registerEvent = (type: ResizeEventType = 'mouse') => {
    const window = groupRef.value?.ownerDocument?.defaultView;
    if (!window || !foundation) return;
    if (type === 'mouse') {
        window.addEventListener('mousemove', foundation.onMouseMove);
        window.addEventListener('mouseup', foundation.onResizeEnd);
        window.addEventListener('mouseleave', foundation.onResizeEnd);
    } else {
        window.addEventListener('touchmove', foundation.onTouchMove, { passive: false });
        window.addEventListener('touchend', foundation.onResizeEnd);
        window.addEventListener('touchcancel', foundation.onResizeEnd);
    }
};

const unregisterEvent = (type: ResizeEventType = 'mouse') => {
    const window = groupRef.value?.ownerDocument?.defaultView;
    if (!window || !foundation) return;
    if (type === 'mouse') {
        window.removeEventListener('mousemove', foundation.onMouseMove);
        window.removeEventListener('mouseup', foundation.onResizeEnd);
        window.removeEventListener('mouseleave', foundation.onResizeEnd);
    } else {
        window.removeEventListener('touchmove', foundation.onTouchMove);
        window.removeEventListener('touchend', foundation.onResizeEnd);
        window.removeEventListener('touchcancel', foundation.onResizeEnd);
    }
};

const adapter: ResizeGroupAdapter<ResizeGroupProps, typeof state> = {
    getProp: (key: string) => (props as Record<string, unknown>)[key],
    getProps: () => props,
    getState: () => state,
    getStates: () => state,
    setState: (states: Partial<typeof state>) => {
        Object.assign(state, states);
    },
    getContext: () => undefined,
    getContexts: () => undefined,
    getCache: () => undefined,
    getCaches: () => undefined,
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
    getGroupRef: () => groupRef.value || null,
    getItem: (id: number) => {
        const ref = itemRefs.get(id);
        return ref?.value as HTMLDivElement;
    },
    getItemCount: () => itemRefs.size,
    getHandler: (id: number) => {
        const ref = handlerRefs.get(id);
        return ref?.value as HTMLDivElement;
    },
    getHandlerCount: () => handlerRefs.size,
    getItemMin: (index: number) => {
        const min = itemMinMap.get(index);
        return min ?? '';
    },
    getItemMax: (index: number) => {
        const max = itemMaxMap.get(index);
        return max ?? '';
    },
    getItemChange: (index: number) => {
        const callback = itemResizing.get(index);
        console.log('[ResizeGroup] getItemChange', { index, callback: !!callback });
        return callback;
    },
    getItemEnd: (index: number) => {
        const callback = itemResizeEnd.get(index);
        console.log('[ResizeGroup] getItemEnd', { index, callback: !!callback });
        return callback;
    },
    getItemStart: (index: number) => {
        const callback = itemResizeStart.get(index);
        console.log('[ResizeGroup] getItemStart', {
            index,
            callback: !!callback,
            callbackType: typeof callback,
            callbackName: callback?.name || 'anonymous',
        });
        if (callback) {
            console.log('[ResizeGroup] getItemStart - will call callback', { index });
        }
        return callback;
    },
    getItemDefaultSize: (index: number) => itemDefaultSizeList.get(index),
    registerEvents: registerEvent,
    unregisterEvents: unregisterEvent,
};

const foundation: ResizeGroupFoundation<ResizeGroupProps, typeof state> = new ResizeGroupFoundation(adapter);

const contextValue: ResizeContextProps = {
    direction: props.direction,
    registerItem,
    registerHandler,
    notifyResizeStart: foundation.onResizeStart,
    getGroupSize,
};

provideResizeContext(contextValue);

onMounted(() => {
    foundation.init();
    window.addEventListener('resize', foundation.ensureConstraint);
});

onUnmounted(() => {
    foundation.destroy();
    window.removeEventListener('resize', foundation.ensureConstraint);
});

watch(
    () => props.direction,
    (newDirection) => {
        foundation.direction = newDirection;
        contextValue.direction = newDirection;
    }
);

const groupCls = computed(() => {
    return classNames(props.className, `${cssClasses.PREFIX}-group`);
});

const groupStyle = computed<CSSProperties>(() => {
    return {
        flexDirection: props.direction === 'vertical' ? 'column' : 'row',
        ...props.style,
    };
});
</script>
