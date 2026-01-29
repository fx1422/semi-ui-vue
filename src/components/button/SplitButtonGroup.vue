<template>
    <div ref="containerRef" :class="cls" :style="style" role="group" :aria-label="props['aria-label']">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/button/constants';

defineOptions({
    name: 'SplitButtonGroup',
});

interface SplitButtonGroupProps {
    className?: string;
    style?: Record<string, any>;
    'aria-label'?: string;
}

const props = withDefaults(defineProps<SplitButtonGroupProps>(), {
    className: '',
    style: () => ({}),
    'aria-label': undefined,
});

const prefixCls = cssClasses.PREFIX;

const containerRef = ref<HTMLDivElement | null>(null);
let mutationObserver: MutationObserver | null = null;

const cls = computed(() => classNames(`${prefixCls}-split`, props.className));

const addClassName = () => {
    if (!containerRef.value) return;
    const buttons = containerRef.value.querySelectorAll('button');
    const firstButton = buttons[0] as HTMLElement;
    const lastButton = buttons[buttons.length - 1] as HTMLElement;
    if (firstButton && !firstButton.classList.contains(`${prefixCls}-first`)) {
        firstButton.classList.add(`${prefixCls}-first`);
    }
    if (lastButton && !lastButton.classList.contains(`${prefixCls}-last`)) {
        lastButton.classList.add(`${prefixCls}-last`);
    }
};

onMounted(() => {
    if (containerRef.value) {
        nextTick(() => {
            addClassName();
            mutationObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (
                        (mutation.type === 'attributes' && mutation.attributeName === 'class') ||
                        (mutation.type === 'childList' &&
                            Array.from(mutation.addedNodes).some((node) => (node as Node).nodeName === 'BUTTON'))
                    ) {
                        addClassName();
                    }
                }
            });
            if (containerRef.value) {
                mutationObserver.observe(containerRef.value, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                });
            }
        });
    }
});

onUnmounted(() => {
    if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
    }
});
</script>
