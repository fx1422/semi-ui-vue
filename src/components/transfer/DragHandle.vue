<template>
    <component :is="handleComponent" />
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { IconHandle } from '../icons';

const props = defineProps<{
    sortableHandle: (renderFn: () => any) => any;
    iconClass?: string;
}>();

const handleComponent = computed(() => {
    if (!props.sortableHandle) return null;
    return props.sortableHandle(() =>
        h(IconHandle, {
            role: 'button',
            'aria-label': 'Drag and sort',
            class: props.iconClass || 'semi-transfer-right-item-drag-handler',
        })
    );
});
</script>
