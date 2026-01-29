<template>
    <component :is="renderedItem" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import type { Data } from './interface';

export interface VirtualRowProps {
    index: number;
    data: {
        visibleOptions: Data[];
        renderOption: (option: Data, index: number, style?: CSSProperties) => any;
    };
    style?: CSSProperties;
}

const props = defineProps<VirtualRowProps>();

const renderedItem = computed(() => {
    const { visibleOptions, renderOption } = props.data;
    const option = visibleOptions[props.index];

    if (!option) {
        return null;
    }

    return renderOption(option, props.index, props.style);
});
</script>
