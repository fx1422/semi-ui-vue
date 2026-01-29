<template>
    <div ref="handlerRef" :class="handlerCls" :style="props.style">
        <slot>
            <IconHandle
                :size="'inherit'"
                :style="{
                    rotate: context?.direction === 'horizontal' ? '0deg' : '90deg',
                }"
            />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import type { CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/resizable/constants';
import { ResizeHandlerFoundation, type ResizeHandlerAdapter } from '@douyinfe/semi-foundation/resizable/foundation';
import { useResizeContext } from './resizeContext';
import { IconHandle } from '../../icons';

defineOptions({
    name: 'SemiResizeHandler',
});

interface ResizeHandlerProps {
    className?: string;
    disabled?: boolean;
    style?: CSSProperties;
}

const props = withDefaults(defineProps<ResizeHandlerProps>(), {
    disabled: false,
});

const handlerRef = ref<HTMLDivElement>();
const context = useResizeContext();
let handlerIndex = -1;

const onMouseDown = (e: MouseEvent) => {
    if (context && handlerIndex !== -1) {
        context.notifyResizeStart(handlerIndex, e, 'mouse');
    }
};

const onTouchStart = (e: TouchEvent) => {
    if (context && handlerIndex !== -1) {
        context.notifyResizeStart(handlerIndex, e.targetTouches[0], 'touch');
    }
};

const adapter: ResizeHandlerAdapter<ResizeHandlerProps, any> = {
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
    registerEvents: () => {
        if (handlerRef.value) {
            handlerRef.value.addEventListener('mousedown', onMouseDown);
            handlerRef.value.addEventListener('touchstart', onTouchStart);
        }
    },
    unregisterEvents: () => {
        if (handlerRef.value) {
            handlerRef.value.removeEventListener('mousedown', onMouseDown);
            handlerRef.value.removeEventListener('touchstart', onTouchStart);
        }
    },
};

const foundation: ResizeHandlerFoundation<ResizeHandlerProps, any> = new ResizeHandlerFoundation(adapter);

onMounted(() => {
    foundation.init();
    if (context && handlerIndex === -1) {
        handlerIndex = context.registerHandler(handlerRef as Ref<HTMLDivElement | undefined>);
    }
});

onUnmounted(() => {
    foundation.destroy();
});

const handlerCls = computed(() => {
    return classNames(
        props.className,
        `${cssClasses.PREFIX}-handler`,
        `${cssClasses.PREFIX}-handler-${context?.direction || 'horizontal'}`
    );
});
</script>
