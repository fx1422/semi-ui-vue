<template>
    <component :is="renderedOption" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import type { OptionProps } from './interface';

export interface VirtualRowProps {
    index: number;
    data: {
        visibleOptions: OptionProps[];
        renderOption: (option: OptionProps, index: number, style?: CSSProperties) => any;
    };
    style?: CSSProperties;
}

const props = defineProps<VirtualRowProps>();

const renderedOption = computed(() => {
    const { visibleOptions, renderOption } = props.data;
    const option = visibleOptions[props.index];

    if (!option) {
        return null;
    }

    return renderOption(option, props.index, props.style);
});
</script>
