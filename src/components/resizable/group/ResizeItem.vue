<template>
    <div ref="itemRef" :class="itemCls" :style="itemStyle">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import type { CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/resizable/constants';
import { ResizeItemFoundation, type ResizeItemAdapter } from '@douyinfe/semi-foundation/resizable/foundation';
import type { ResizeCallback, ResizeStartCallback } from '@douyinfe/semi-foundation/resizable/types';
import { useResizeContext } from './resizeContext';
import '../resizable.scss';

defineOptions({
    name: 'SemiResizeItem',
});

interface ResizeItemProps {
    style?: CSSProperties;
    className?: string;
    min?: string;
    max?: string;
    defaultSize?: string | number;
    onResizeStart?: ResizeStartCallback;
    onChange?: ResizeCallback;
    onResizeEnd?: ResizeCallback;
}

const props = withDefaults(defineProps<ResizeItemProps>(), {
    onResizeStart: () => {},
    onChange: () => {},
    onResizeEnd: () => {},
});

const itemRef = ref<HTMLDivElement>();
const context = useResizeContext();
let itemIndex = -1;
let direction: 'horizontal' | 'vertical' | undefined;
const isResizing = ref(false);

const handleResizeStart = (e: MouseEvent | Touch, dir: any) => {
    // 立即禁用过渡，确保拖拽时响应流畅
    isResizing.value = true;
    if (itemRef.value) {
        itemRef.value.style.transition = 'none';
    }
    if (props.onResizeStart) {
        props.onResizeStart(e, dir);
    }
};

const handleChange = (size: any, event: any, direction: any) => {
    props.onChange!(size, event, direction);
};

const handleResizeEnd = (size: any, event: any, direction: any) => {
    if (props.onResizeEnd) {
        props.onResizeEnd(size, event, direction);
    }
    // 延迟恢复过渡效果，确保 Foundation 完成所有 DOM 操作后再恢复
    // 使用 setTimeout 确保在 ensureConstraint 等后续操作完成后再恢复 transition
    setTimeout(() => {
        // 先移除 -resizing 类，这样 CSS 中的 transition 才能生效
        isResizing.value = false;
        // 使用 requestAnimationFrame 确保在浏览器重绘后再移除内联样式
        requestAnimationFrame(() => {
            if (itemRef.value) {
                // 移除内联的 transition，让 CSS 中的 transition 生效
                itemRef.value.style.removeProperty('transition');
            }
        });
    }, 250); // 延迟 250ms，确保 ensureConstraint 的 debounce (200ms) 完成
};

const adapter: ResizeItemAdapter<ResizeItemProps, any> = {
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
};

const foundation = new ResizeItemFoundation(adapter);

onMounted(() => {
    foundation.init();
    if (context && itemIndex === -1) {
        itemIndex = context.registerItem(
            itemRef as Ref<HTMLDivElement | undefined>,
            props.min ?? '',
            props.max ?? '',
            props.defaultSize ?? 'auto',
            handleResizeStart,
            handleChange,
            handleResizeEnd
        );
        direction = context.direction;
    }
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => context?.direction,
    (newDirection) => {
        if (newDirection && direction && newDirection !== direction && itemRef.value) {
            direction = newDirection;
            if (newDirection === 'horizontal') {
                const newWidth = itemRef.value.style.height;
                itemRef.value.style.width = newWidth;
                itemRef.value.style.removeProperty('height');
            } else {
                const newHeight = itemRef.value.style.width;
                itemRef.value.style.height = newHeight;
                itemRef.value.style.removeProperty('width');
            }
        }
    }
);

const itemCls = computed(() => {
    const cls = classNames(props.className, `${cssClasses.PREFIX}-item`, {
        [`${cssClasses.PREFIX}-item-resizing`]: isResizing.value,
    });
    // 减少日志输出，只在状态变化时输出
    // console.log('[ResizeItem] itemCls computed', {
    //     cls,
    //     isResizing: isResizing.value,
    //     prefix: cssClasses.PREFIX,
    // });
    return cls;
});

const itemStyle = computed(() => {
    return props.style || {};
});
</script>
