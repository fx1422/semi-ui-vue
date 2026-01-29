<template>
    <th v-if="!isResizable" v-bind="$attrs">
        <slot />
    </th>
    <th v-else :class="resizableCls" :style="resizableStyle" v-bind="$attrs" @mousedown="handleMouseDown">
        <slot />
        <div :class="`${prefixCls}-resize-handle`" @mousedown.stop="handleResizeStart" />
    </th>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'SemiResizableHeaderCell',
    inheritAttrs: false,
});

interface Props {
    width?: number | string;
    resize?: boolean;
    prefixCls?: string;
    onResize?: (e: { width: number }) => void;
    onResizeStart?: (e: MouseEvent) => void;
    onResizeStop?: (e: MouseEvent) => void;
}

const props = withDefaults(defineProps<Props>(), {
    resize: true,
    prefixCls: 'semi-table',
});

const isResizable = computed(() => {
    return typeof props.width === 'number' && props.resize !== false;
});

const resizableCls = computed(() => ({
    [`${props.prefixCls}-resizable-column`]: isResizable.value,
}));

const resizableStyle = computed<CSSProperties>(() => {
    if (!isResizable.value) {
        return {};
    }
    return {
        width: `${props.width}px`,
        position: 'relative',
    };
});

const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);

const handleResizeStart = (e: MouseEvent) => {
    if (!isResizable.value) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    isResizing.value = true;
    startX.value = e.clientX;
    startWidth.value = typeof props.width === 'number' ? props.width : 0;

    if (props.onResizeStart) {
        props.onResizeStart(e);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) {
        return;
    }

    const diff = e.clientX - startX.value;
    const newWidth = Math.max(50, startWidth.value + diff); // 最小宽度 50px

    if (props.onResize) {
        props.onResize({ width: newWidth });
    }
};

const handleMouseUp = (e: MouseEvent) => {
    if (!isResizing.value) {
        return;
    }

    isResizing.value = false;

    if (props.onResizeStop) {
        props.onResizeStop(e);
    }

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
};

const handleMouseDown = (e: MouseEvent) => {
    // 阻止拖拽选中文本
    if (isResizing.value) {
        e.preventDefault();
    }
};

onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style>
.semi-table-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 8px;
    cursor: col-resize;
    user-select: none;
    z-index: 10;
    touch-action: none;
}

.semi-table-resize-handle:hover {
    background-color: rgba(22, 24, 35, 0.1);
}

.semi-table-resizable-column {
    user-select: none;
}
</style>
