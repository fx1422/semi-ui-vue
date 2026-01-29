<template>
    <slot />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, useSlots } from 'vue';
import type { ResizeEntry, ReactResizeObserverProps } from './interface';
import { ObserverProperty } from './interface';

const props = withDefaults(defineProps<ReactResizeObserverProps>(), {
    observeParent: false,
    observerProperty: ObserverProperty.All,
    delayTick: 0,
});

const emit = defineEmits<{
    (e: 'resize', entries: ResizeEntry[]): void;
}>();

const slots = useSlots();
const observer = ref<ResizeObserver | null>(null);
const element = ref<Element | null>(null);
const parentNode = ref<HTMLElement | null>(null);
const formerPropertyValue = ref<Map<Element, number>>(new Map());

const handleResizeEventTriggered = (entries: ResizeEntry[]) => {
    if (props.observerProperty === ObserverProperty.All) {
        props.onResize?.(entries);
        emit('resize', entries);
    } else {
        const finalEntries: ResizeEntry[] = [];
        for (const entry of entries) {
            if (formerPropertyValue.value.has(entry.target)) {
                if (entry.contentRect[props.observerProperty] !== formerPropertyValue.value.get(entry.target)) {
                    formerPropertyValue.value.set(entry.target, entry.contentRect[props.observerProperty]);
                    finalEntries.push(entry);
                }
            } else {
                formerPropertyValue.value.set(entry.target, entry.contentRect[props.observerProperty]);
                finalEntries.push(entry);
            }
        }
        if (finalEntries.length > 0) {
            props.onResize?.(finalEntries);
            emit('resize', finalEntries);
        }
    }
};

const observeElement = (force = false) => {
    // Get the first slot element
    const slotDefault = slots.default?.();
    if (!slotDefault || !slotDefault[0]) {
        return;
    }

    const slotElement = slotDefault[0].el as Element;
    if (!slotElement) {
        return;
    }

    if (!observer.value && globalThis['ResizeObserver']) {
        observer.value = new ResizeObserver(handleResizeEventTriggered as any);
    }

    if (!observer.value) {
        return;
    }

    if (!(slotElement && slotElement instanceof Element)) {
        // stop everything if not defined
        observer.value.disconnect();
        return;
    }

    if (slotElement === element.value && !force) {
        // abort if given same element -- nothing to update (unless forced)
        return;
    } else {
        // clear observer list if new element
        observer.value.disconnect();
        // remember element reference for next time
        element.value = slotElement;
    }

    // observer callback is invoked immediately when observing new elements
    observer.value.observe(slotElement);

    if (
        props.observeParent &&
        slotElement.parentNode &&
        slotElement.parentNode.ownerDocument &&
        slotElement.parentNode.ownerDocument.defaultView &&
        slotElement.parentNode instanceof slotElement.parentNode.ownerDocument.defaultView.HTMLElement
    ) {
        parentNode.value = slotElement.parentNode;
        observer.value.observe(parentNode.value);
    }
};

onMounted(() => {
    if (globalThis['ResizeObserver']) {
        observer.value = new ResizeObserver(handleResizeEventTriggered as any);
    }
    // Need to delay to ensure slot elements are rendered
    setTimeout(() => {
        observeElement();
    }, 0);
});

watch(
    () => props.observeParent,
    (newVal, oldVal) => {
        if (newVal !== oldVal) {
            observeElement(true);
        }
    }
);

onBeforeUnmount(() => {
    if (observer.value) {
        observer.value.disconnect();
        observer.value = null;
        element.value = null;
    }
});
</script>
