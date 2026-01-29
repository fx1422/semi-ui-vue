<template>
    <div ref="containerRef" style="display: contents">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import type { ResizeEntry, ResizeObserverProps } from './interface';
import { ObserverProperty } from './interface';

const props = withDefaults(defineProps<ResizeObserverProps>(), {
    observeParent: false,
    observerProperty: 'all',
    delayTick: 0,
});

const emit = defineEmits<{
    resize: [entries: ResizeEntry[]];
}>();

const containerRef = ref<HTMLDivElement>();
const observer = ref<ResizeObserver | null>(null);
const observedElement = ref<Element | null>(null);
const observedParent = ref<HTMLElement | null>(null);
const formerPropertyValue = new Map<Element, number>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const emitResizeEvent = (entries: ResizeEntry[]) => {
    emit('resize', entries);
    props.onResize?.(entries);
};

const handleResizeEventTriggered = (entries: ResizeObserverEntry[]) => {
    const resizeEntries = entries as ResizeEntry[];

    const processEntries = () => {
        const property = props.observerProperty;
        if (property === ObserverProperty.All) {
            emitResizeEvent(resizeEntries);
        } else {
            const finalEntries: ResizeEntry[] = [];
            for (const entry of resizeEntries) {
                const propertyValue = entry.contentRect[property as 'width' | 'height'];
                const previousValue = formerPropertyValue.get(entry.target);

                if (previousValue === undefined || propertyValue !== previousValue) {
                    formerPropertyValue.set(entry.target, propertyValue);
                    finalEntries.push(entry);
                }
            }

            if (finalEntries.length > 0) {
                emitResizeEvent(finalEntries);
            }
        }
    };

    // delayTick 防抖处理
    if (props.delayTick > 0) {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(processEntries, props.delayTick);
    } else {
        processEntries();
    }
};

const observeElement = (force = false) => {
    if (!containerRef.value) {
        return;
    }

    if (!observer.value && typeof ResizeObserver !== 'undefined') {
        observer.value = new ResizeObserver(handleResizeEventTriggered);
    }

    if (!observer.value) {
        return;
    }

    const firstChild = containerRef.value.firstElementChild;

    if (!firstChild) {
        observer.value.disconnect();
        return;
    }

    // 相同元素且非强制更新则跳过
    if (firstChild === observedElement.value && !force) {
        return;
    }

    observer.value.disconnect();
    observedElement.value = firstChild;
    observer.value.observe(firstChild);

    if (props.observeParent && firstChild.parentElement) {
        observedParent.value = firstChild.parentElement;
        observer.value.observe(observedParent.value);
    } else {
        observedParent.value = null;
    }
};

watch(
    () => props.observeParent,
    () => {
        observeElement(true);
    }
);

onMounted(() => {
    nextTick(() => {
        observeElement();
    });
});

onBeforeUnmount(() => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }

    if (observer.value) {
        observer.value.disconnect();
        observer.value = null;
    }

    observedElement.value = null;
    observedParent.value = null;
    formerPropertyValue.clear();
});
</script>
