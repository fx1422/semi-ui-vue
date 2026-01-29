<template>
    <slot></slot>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

export interface IntersectionObserverProps {
    root?: HTMLElement;
    rootMargin?: string;
    threshold?: number | number[];
    items?: Record<string, any>;
}

const props = withDefaults(defineProps<IntersectionObserverProps>(), {
    rootMargin: '0px',
    threshold: 0,
});

const emit = defineEmits<{
    intersect: [entries: IntersectionObserverEntry[]];
}>();

const containerRef = ref<HTMLElement>();
let observer: IntersectionObserver | null = null;

const createObserver = async () => {
    // Wait for next tick to ensure DOM is ready
    await nextTick();

    if (observer) {
        observer.disconnect();
    }

    observer = new IntersectionObserver(
        (entries) => {
            emit('intersect', entries);
        },
        {
            root: props.root || null,
            rootMargin: props.rootMargin,
            threshold: props.threshold,
        }
    );

    // Observe all items - ensure they are DOM elements
    if (props.items) {
        Object.values(props.items).forEach((element) => {
            if (element && element instanceof Element) {
                observer!.observe(element);
            }
        });
    }
};

watch(
    () => props.items,
    () => {
        createObserver();
    },
    { deep: true }
);

watch(
    () => props.root,
    () => {
        createObserver();
    }
);

onMounted(() => {
    createObserver();
});

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});
</script>
