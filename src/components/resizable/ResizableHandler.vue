<template>
    <div ref="handlerRef" :class="handlerCls" :style="props.style">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/resizable/constants';
import {
    ResizableHandlerFoundation,
    type ResizableHandlerAdapter,
} from '@douyinfe/semi-foundation/resizable/foundation';
import type { ResizableHandlerProps } from './interface';

defineOptions({
    name: 'SemiResizableHandler',
});

const props = withDefaults(defineProps<ResizableHandlerProps>(), {
    disabled: false,
});

const handlerRef = ref<HTMLDivElement>();

const handlerCls = computed(() => {
    return classNames(
        props.className,
        `${cssClasses.PREFIX}-resizableHandler`,
        `${cssClasses.PREFIX}-resizableHandler-${props.direction}`
    );
});

const adapter: ResizableHandlerAdapter<ResizableHandlerProps, any> = {
    getProp: (key: string) => (props as Record<string, unknown>)[key],
    getProps: () => props,
    getState: () => ({}),
    getStates: () => ({}),
    setState: () => {},
    getContext: () => undefined,
    getContexts: () => undefined,
    getCache: () => undefined,
    getCaches: () => undefined,
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
    registerEvent: () => {
        if (handlerRef.value && foundation) {
            handlerRef.value.addEventListener('mousedown', foundation.onMouseDown);
            handlerRef.value.addEventListener('touchstart', foundation.onTouchStart);
        }
    },
    unregisterEvent: () => {
        if (handlerRef.value && foundation) {
            handlerRef.value.removeEventListener('mousedown', foundation.onMouseDown);
            handlerRef.value.removeEventListener('touchstart', foundation.onTouchStart);
        }
    },
};

const foundation: ResizableHandlerFoundation<ResizableHandlerProps, any> = new ResizableHandlerFoundation(adapter);

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});
</script>
