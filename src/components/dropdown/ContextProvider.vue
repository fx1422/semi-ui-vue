<template>
    <slot></slot>
</template>

<script setup lang="ts">
import { provideDropdownContext } from './context';
import type { DropdownContextType } from './interface';

const props = defineProps<{
    value: DropdownContextType;
}>();

provideDropdownContext(props.value);
</script>
