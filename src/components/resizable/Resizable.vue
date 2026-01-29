<template>
    <div ref="resizableRef" :class="resizableCls" :style="resizableStyle" v-bind="getDataAttr(restProps)">
        <div v-if="state.isResizing" :style="state.backgroundStyle" :class="`${cssClasses.PREFIX}-background`" />
        <slot></slot>
        <div v-if="enable" :class="props.handleWrapperClass" :style="props.handleWrapperStyle">
            <template v-for="dir in directions" :key="dir">
                <ResizableHandler
                    v-if="enable[dir as Direction] !== false"
                    :direction="dir as Direction"
                    :onResizeStart="
                        (e: MouseEvent | Touch, dir: Direction, type?: 'mouse' | 'touch') =>
                            foundation.onResizeStart(e as MouseEvent, dir, type)
                    "
                    :style="props.handleStyle?.[dir as keyof HandleStyle]"
                    :class="props.handleClass?.[dir as keyof HandleClassName]"
                >
                    <component
                        :is="props.handleNode[dir as keyof HandleComponent]"
                        v-if="props.handleNode?.[dir as keyof HandleComponent]"
                    />
                </ResizableHandler>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue';
import type { CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/resizable/constants';
import { directions, type Direction, type Enable } from '@douyinfe/semi-foundation/resizable/types';
import { ResizableFoundation, type ResizableAdapter } from '@douyinfe/semi-foundation/resizable/foundation';
import ResizableHandler from './ResizableHandler.vue';
import type { ResizableProps, ResizableState, HandleStyle, HandleClassName, HandleComponent } from './interface';
import './resizable.scss';

defineOptions({
    name: 'SemiResizable',
});

interface Props extends Omit<ResizableProps, 'grid'> {
    grid?: [number, number] | number;
}

const props = withDefaults(defineProps<Props>(), {
    enable: () => ({
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
    }),
    style: () => ({}),
    grid: () => [1, 1] as [number, number],
    lockAspectRatio: false,
    lockAspectRatioExtraWidth: 0,
    lockAspectRatioExtraHeight: 0,
    scale: 1,
    ratio: 1,
    snapGap: 0,
});

// 将 grid 转换为数组格式，支持数字和数组两种形式
const gridValue = computed<[number, number]>(() => {
    const grid = props.grid;
    if (typeof grid === 'number') {
        return [grid, grid];
    }
    return grid || [1, 1];
});

const emit = defineEmits<{
    resizeStart: [e: MouseEvent | Touch, dir: Direction];
    change: [
        size: { width: number | string; height: number | string },
        event: MouseEvent | TouchEvent,
        direction: Direction,
    ];
    resizeEnd: [size: { width: number; height: number }, event: MouseEvent | TouchEvent, direction: Direction];
}>();

const resizableRef = ref<HTMLDivElement>();

const state = reactive<ResizableState>({
    isResizing: false,
    width: 'auto',
    height: 'auto',
    direction: 'right',
    original: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
    backgroundStyle: {
        cursor: 'auto',
    },
    flexBasis: undefined,
});

const enable = computed<Enable | false>(() => {
    return props.enable || false;
});

const getResizable = () => {
    return resizableRef.value;
};

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
    const omitKeys = [
        'style',
        'className',
        'grid',
        'snap',
        'snapGap',
        'boundElement',
        'boundsByDirection',
        'size',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'lockAspectRatio',
        'lockAspectRatioExtraWidth',
        'lockAspectRatioExtraHeight',
        'enable',
        'handleStyle',
        'handleClass',
        'handleWrapperStyle',
        'handleWrapperClass',
        'handleNode',
        'defaultSize',
        'scale',
        'ratio',
        'onResizeStart',
        'onChange',
        'onResizeEnd',
    ];
    const rest: Record<string, unknown> = {};
    Object.keys(propsData).forEach((key) => {
        if (!omitKeys.includes(key)) {
            rest[key] = propsData[key];
        }
    });
    return rest;
});

const adapter: ResizableAdapter<ResizableProps, ResizableState> = {
    getProp: (key: string) => {
        if (key === 'onResizeStart') {
            return (e: MouseEvent | Touch, dir: Direction) => {
                const result = props.onResizeStart?.(e, dir);
                emit('resizeStart', e, dir);
                return result;
            };
        }
        if (key === 'onChange') {
            return (
                size: { width: number | string; height: number | string },
                event: MouseEvent | TouchEvent,
                direction: Direction
            ) => {
                props.onChange?.(size, event, direction);
                emit('change', size, event, direction);
            };
        }
        if (key === 'onResizeEnd') {
            return (size: { width: number; height: number }, event: MouseEvent | TouchEvent, direction: Direction) => {
                props.onResizeEnd?.(size, event, direction);
                emit('resizeEnd', size, event, direction);
            };
        }
        if (key === 'grid') {
            return gridValue.value;
        }
        return (props as Record<string, unknown>)[key];
    },
    getProps: () => props,
    getState: () => state,
    getStates: () => state,
    setState: (states: Partial<ResizableState>) => {
        Object.assign(state, states);
    },
    getContext: () => undefined,
    getContexts: () => undefined,
    getCache: () => undefined,
    getCaches: () => undefined,
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
    getResizable,
    registerEvent: (type: 'mouse' | 'touch') => {
        const window = resizableRef.value?.ownerDocument?.defaultView;
        if (!window || !foundation) return;
        if (type === 'mouse') {
            window.addEventListener('mouseup', foundation.onMouseUp);
            window.addEventListener('mousemove', foundation.onMouseMove);
            window.addEventListener('mouseleave', foundation.onMouseUp);
        } else {
            window.addEventListener('touchmove', foundation.onTouchMove, { passive: false });
            window.addEventListener('touchend', foundation.onMouseUp);
            window.addEventListener('touchcancel', foundation.onMouseUp);
        }
    },
    unregisterEvent: (type: 'mouse' | 'touch') => {
        const window = resizableRef.value?.ownerDocument?.defaultView;
        if (!window || !foundation) return;
        if (type === 'mouse') {
            window.removeEventListener('mouseup', foundation.onMouseUp);
            window.removeEventListener('mousemove', foundation.onMouseMove);
            window.removeEventListener('mouseleave', foundation.onMouseUp);
        } else {
            window.removeEventListener('touchmove', foundation.onTouchMove);
            window.removeEventListener('touchend', foundation.onMouseUp);
            window.removeEventListener('touchcancel', foundation.onMouseUp);
        }
    },
};

const foundation: ResizableFoundation<ResizableProps, ResizableState> = new ResizableFoundation(adapter);

onMounted(() => {
    foundation.init();
    const flexBasis = resizableRef.value ? window.getComputedStyle(resizableRef.value).flexBasis : 'auto';
    const propSize = foundation.propSize;
    state.width = propSize.width ?? 'auto';
    state.height = propSize.height ?? 'auto';
    state.flexBasis = flexBasis !== 'auto' ? flexBasis : undefined;
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => props.size,
    (newSize) => {
        if (newSize) {
            if (newSize.width !== undefined) {
                state.width = newSize.width;
            }
            if (newSize.height !== undefined) {
                state.height = newSize.height;
            }
        }
    },
    { immediate: true }
);

const resizableCls = computed(() => {
    return classNames(props.className, `${cssClasses.PREFIX}-resizable`);
});

const resizableStyle = computed(() => {
    const resizeStyle: CSSProperties = {
        userSelect: state.isResizing ? 'none' : 'auto',
        maxWidth: props.maxWidth,
        maxHeight: props.maxHeight,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
        ...props.style,
        ...foundation.sizeStyle,
    };

    if (state.flexBasis) {
        resizeStyle.flexBasis = state.flexBasis;
    }

    return resizeStyle;
});
</script>
