<template>
    <component :is="renderTrigger" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TriggerProps } from './interface';

const props = defineProps<TriggerProps>();

const renderTrigger = computed(() => {
    if (!props.triggerRender || typeof props.triggerRender !== 'function') {
        return null;
    }

    const { triggerRender, componentName, componentProps, ...rest } = props;

    // 过滤掉 undefined 值，避免传递给子组件时出错
    // Vue 3 中，undefined 的 props 会被尝试设置为 DOM 属性，导致错误
    const filteredProps: Record<string, any> = {};
    for (const key in rest) {
        const value = rest[key];
        if (value !== undefined && value !== null) {
            filteredProps[key] = value;
        }
    }

    return triggerRender(filteredProps);
});
</script>
