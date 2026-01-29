<template>
    <div v-if="loading" :class="skeletonClasses" :style="style">
        <slot name="placeholder"></slot>
    </div>
    <template v-else>
        <slot></slot>
    </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/skeleton/constants';
import type { SkeletonProps } from './interface';

const props = withDefaults(defineProps<SkeletonProps>(), {
    loading: true,
});

const skeletonClasses = computed(() => {
    return classNames(
        cssClasses.PREFIX,
        {
            [`${cssClasses.PREFIX}-active`]: Boolean(props.active),
        },
        props.className
    );
});
</script>
