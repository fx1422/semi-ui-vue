<template>
    <ResizeObserver observeParent @resize="onResize">
        <div :style="{ height: defaultHeight, overflow: 'visible' }" :class="`${prefixcls}-auto-wrapper`">
            <slot v-if="!bailoutOnChildren" :height="height" :width="defaultWidth" />
        </div>
    </ResizeObserver>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/tree/constants';
import ResizeObserver from '../resizeObserver/index.vue';
import { get } from 'lodash-es';

export interface AutoSizerProps {
    defaultHeight?: number | string;
    defaultWidth?: number | string;
}

const props = withDefaults(defineProps<AutoSizerProps>(), {
    defaultHeight: '100%',
    defaultWidth: '100%',
});

const prefixcls = cssClasses.PREFIX;
const height = ref<number | string>(props.defaultHeight || 0);

const bailoutOnChildren = computed(() => {
    return height.value === 0 || typeof height.value !== 'number';
});

const onResize = (entries: any[]) => {
    // observe parent node height
    const target = entries && entries[1] && entries[1].target;
    if (target) {
        const targetHeight = get(target, 'offsetHeight') || 0;
        const style = window.getComputedStyle(target) || {};
        const paddingTop = parseInt(get(style, 'paddingTop'), 10) || 0;
        const paddingBottom = parseInt(get(style, 'paddingBottom'), 10) || 0;
        const newHeight = targetHeight - paddingTop - paddingBottom;
        if (height.value !== newHeight) {
            height.value = newHeight;
        }
    }
};

onMounted(() => {
    // if height is a number, pass it directly to virtual-list
    if (typeof height.value === 'number') {
        return;
    }
});
</script>
