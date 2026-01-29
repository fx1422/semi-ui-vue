<template>
    <Collapsible v-bind="otherProps" :isOpen="isOpenState">
        <slot />
    </Collapsible>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Collapsible from '../collapsible';

// Animation constants
const DEFAULT_ANIMATION_DURATION = 200;

interface NodeCollapsibleProps {
    open?: boolean;
    motion?: boolean;
    duration?: number;
    onMotionEnd?: () => void;
}

const props = withDefaults(defineProps<NodeCollapsibleProps>(), {
    open: false,
    motion: true,
    duration: DEFAULT_ANIMATION_DURATION,
});

const isOpenState = ref(props.open);

const otherProps = computed(() => {
    const { open, ...rest } = props;
    return rest;
});

onMounted(() => {
    // Why do we need to change isOpen value in setTimeout？
    // Because when NodeCollapsible ComponentDidMount, the domHeight in Collapsible has not been given
    setTimeout(() => {
        isOpenState.value = !props.open;
    }, 0);
});
</script>
